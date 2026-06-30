# V-Fit: AR-Based AI-Driven Real-Time Shirt Try-Out System

An enterprise-grade, low-latency Augmented Reality (AR) virtual try-on ecosystem built for modern e-commerce. **V-Fit** allows users to instantly visualize catalog items dynamically on a live media stream via standard webcams, incorporating deep learning-driven size estimation and high-performance server components to mitigate online retail sizing uncertainty.

---

## 🚀 Key Architectural Pillars

- **Real-Time Human Telemetry:** Ultra-low latency body tracking and joint coordinate estimation.
- **AI-Powered Size Matrix Diagnostics:** Automated physical proportion mapping (Chest, Shoulder, Waist) providing exact fit validation ($S/M/L/XL$).
- **Contextual Agentic Chatbot:** Integrated AI-powered styling assistant leveraging a high-performance vector space vector indexing setup for personalized wardrobe curation.
- **Stateful Security Gateway:** Comprehensive protection layer featuring token-based session validation and robust Row-Level Security (RLS) configurations.

---

## 🛠️ Production Tech Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js, Tailwind CSS, Custom Transitions | Responsive presentation view, floating conversational models, live camera streaming grids. |
| **Backend** | FastAPI (Python), Uvicorn | Asynchronous endpoint orchestration, algorithmic routing architectures, and payload security. |
| **Database** | Supabase, PostgreSQL | Distributed user persistence layers, media asset management, and secure cross-user access policies. |
| **AI / Core** | Google GenAI API, FAISS, Hugging Face Embeddings | Intelligent multi-modal vision context, fast semantic index lookups, and styling generation workflows. |

---

## 📂 Repository Structural Layout

```text
VFit-Project/
├── .gitignore                # Production environment gatekeeper config
├── README.md                 # Primary system manual and project indexing
├── LICENSE                   # MIT open-source authorization parameters
│
├── frontend/                 # Client React.js Application layer
│   ├── public/               # Core static assets
│   ├── src/                  # Component definitions and live views
│   └── package.json          # Dependency trees and deployment build scripts
│
└── backend/                  # Production FastAPI Server infrastructure
    ├── main2.py              # Central routing gate and API engine
    ├── image_tryon.py        # Core vision and transformation logic
    └── requirements.txt      # Python deployment package manifests
⚙️ Local Development Environment Configuration
1. Backend Service Initialization
Ensure you are in the server context and your virtual environment is active:

Bash
cd backend
python -m venv venv
# Windows execution
.\venv\Scripts\activate

# Install deterministic production packages
pip install -r requirements.txt

# Launch asynchronous worker thread pool
python -m uvicorn main:app --reload --port 8001
2. Frontend Interface Initialization
Spawn a parallel terminal sequence to launch the client application context:

Bash
cd frontend
npm install
npm start
The interface will automatically route to local execution pathways at http://localhost:3000.

💻 Author
Created & Developed by Abdullah Arif

📄 Licensing Parameters
Distributed under the MIT License. Check the root LICENSE matrix for comprehensive operational transparency and parameters.
