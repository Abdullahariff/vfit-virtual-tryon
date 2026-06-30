import os
from operator import itemgetter
from urllib.parse import quote
from fastapi import Depends, FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# LangChain Imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.chat_history import InMemoryChatMessageHistory

from auth_gateway import verify_supabase_token

load_dotenv()

app = FastAPI()

# 1. CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_coep_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
    response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
    return response

# 2. Static Files Setup
# Get the absolute path of the directory where main2.py is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
images_path = os.path.join(BASE_DIR, "images")

if not os.path.exists(images_path):
    os.makedirs(images_path)

app.mount("/images", StaticFiles(directory=images_path), name="images")

# 3. AI Components Setup
embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    cache_folder="./model_cache"
)

vector_db = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3) # Temperature kam kiya taake bakwas na kare

# 4. Multi-User Memory
sessions_store = {}

def get_chat_history(session_id: str):
    if session_id not in sessions_store:
        sessions_store[session_id] = InMemoryChatMessageHistory()
    return sessions_store[session_id]

# 5. STRICT Prompt Template
template = """You are a professional AI Fashion Stylist.
You must suggest an outfit ONLY from the provided catalog context. Do NOT invent items that are not in the context.

If the user sends a greeting, casual chat, or asks something unrelated to outfit styling, do not recommend clothing. Instead answer with a short response such as:
Recommendation: I do not have idea about that
Why: I can only recommend clothes from the catalog when asked about an outfit or styling.
Image_Path: N/A

CRITICAL: You must return exactly 3 lines in your response, following this format strictly:
Recommendation: [Exact Item Name from context or a short "I do not have idea about that" message]
Why: [Brief reasoning why this fits the user's query or why the request cannot be answered]
Image_Path: [The exact file path provided in the context, e.g., images/classic navy blue shirt.png, or N/A if not applicable]

Context: {context}
Question: {question}"""

prompt = ChatPromptTemplate.from_messages([
    ("system", template),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}")
])

rag_chain = (
    {
        "context": itemgetter("question") | vector_db.as_retriever(search_kwargs={"k": 2}),
        "question": itemgetter("question"),
        "chat_history": itemgetter("chat_history")
    }
    | prompt
    | llm
    | StrOutputParser()
)

# 6. Advanced Bulletproof Response Parser
def parse_stylist_response(raw_text, request_host: str):
    # Initialize with image_url as None so it doesn't leak mock assets
    data = {
        "recommendation": "VFit Selection",
        "why": "Recommended based on your preference.",
        "image_url": None
    }
    
    print(f"\n--- RAW GEMINI RESPONSE ---\n{raw_text}\n---------------------------")
    
    lines = raw_text.strip().split("\n")
    found_image = False
    
    for line in lines:
        if "Recommendation:" in line:
            data["recommendation"] = line.split("Recommendation:")[1].strip()
        elif "Why:" in line:
            data["why"] = line.split("Why:")[1].strip()
        elif "Image_Path:" in line:
            path = line.split("Image_Path:")[1].strip()
            # ONLY build URL if path is a genuine image file and NOT N/A
            if path and path.upper() != "N/A" and ("images/" in path or ".png" in path or ".jpg" in path):
                filename = path.replace("images/", "")
                encoded_filename = quote(filename)
                data["image_url"] = f"http://{request_host}/images/{encoded_filename}"
                found_image = True

    # Smart Fallback: Only lookup keywords if Gemini DID suggest an item but forgot the path markup
    if not found_image and data["recommendation"] != "I do not have idea about that":
        available_images = [
            "black performance tracksuit.png",
            "casual beige chinos.png",
            "classic navy blue shirt.png",
            "white linen button down.png"
        ]
        for img in available_images:
            if img.lower().replace(".png", "") in raw_text.lower():
                data["image_url"] = f"http://{request_host}/images/{quote(img)}"
                if data["recommendation"] == "VFit Selection":
                    data["recommendation"] = img.replace(".png", "").title()
                found_image = True
                break

    return data

# 7. API Endpoints
class ChatRequest(BaseModel):
    query: str
    session_id: str = "default_user"

@app.post("/ask-stylist")
async def ask_stylist(request_data: ChatRequest, request: Request,current_user: dict = Depends(verify_supabase_token)):
    try:
        print("\n[AUTH] INFO: Secure token validation successful.")
        print(f"[AUTH] User Email: {current_user.email}")
        print(f"[AUTH] User UUID: {current_user.id}\n")
        secure_session_id = str(current_user.id)
        history = get_chat_history(secure_session_id)
        
        # Extract the actual user input by splitting at the System Note if present
        user_raw_query = request_data.query.split("\n[System Note:")[0].strip().lower()
        
        # Clean basic punctuation from the greeting check
        user_raw_query = user_raw_query.replace("!", "").replace(".", "")
        
        # Check for simple greetings
        greetings = ["hi", "hello", "hey", "greetings", "assalam o alaikum", "how are you", "aoa", "yo"]
        if user_raw_query in greetings:
            greeting_response = {
                "recommendation": "Hello! 👋",
                "why": "I'm your VFit AI Stylist. How can I help you find or suggest the perfect outfit today?",
                "image_url": None
            }
            history.add_user_message(request_data.query)
            history.add_ai_message(greeting_response["why"])
            return greeting_response
        
        response_text = rag_chain.invoke({
            "question": request_data.query,
            "chat_history": history.messages
        })
        
        history.add_user_message(request_data.query)
        history.add_ai_message(response_text)
        
        request_host = request.headers.get("host", "127.0.0.1:8000")
        return parse_stylist_response(response_text, request_host)
        
    except Exception as e:
        return {"error": str(e), "why": "Backend connection issue."}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)