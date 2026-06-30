import os
from rouge_score import rouge_scorer
import torch

# Simulation Data (Ground Truth Evaluation Matrix)
eval_dataset = [
    {
        "query": "I have a university presentation today, what should I wear?",
        "expected_item": "Classic Navy Blue Shirt",
        "expected_keywords": ["formal", "presentation", "navy blue shirt"]
    },
    {
        "query": "Suggest me something for playing football at the gym.",
        "expected_item": "Black Performance Tracksuit",
        "expected_keywords": ["tracksuit", "sports", "gym", "football"]
    },
    {
        "query": "Going on a casual hangout with friends on Friday.",
        "expected_item": "Casual Beige Chinos",
        "expected_keywords": ["casual", "chinos", "beige"]
    },
    {
        "query": "Can you recommend a recipe for Biryani?",
        "expected_item": "I do not have idea about that",
        "expected_keywords": ["do not have idea", "catalog"]
    }
]

# Initialize scorers
scorer = rouge_scorer.RougeScorer(['rougeL'], use_stemmer=True)

# Fast & Offline String Token Overlap for BLEU approximation (Bypassing NLTK Server)
def compute_offline_bleu(reference, hypothesis):
    ref_tokens = set(reference.lower().split())
    hyp_tokens = hypothesis.lower().split()
    if not hyp_tokens:
        return 0.0
    matches = sum(1 for token in hyp_tokens if token in ref_tokens)
    return matches / len(hyp_tokens)

# Import the main architecture from your code
from main2 import rag_chain, parse_stylist_response

print("================ STARTING RAG EVALUATION ================")
results = []

total_bleu = 0
total_rouge = 0
total_hits = 0
total_format_pass = 0

for idx, test in enumerate(eval_dataset):
    print(f"\nRunning Test {idx+1}/{len(eval_dataset)}: Query -> '{test['query']}'")
    
    # 1. Execute Chain
    raw_response = rag_chain.invoke({
        "question": test["query"],
        "chat_history": []
    })
    
    # 2. Parse Format
    parsed = parse_stylist_response(raw_response, "127.0.0.1:8000")
    rec = parsed["recommendation"]
    why = parsed["why"]
    
    # 3. Calculate BLEU & ROUGE (Pure Offline)
    bleu = compute_offline_bleu(test["expected_item"], rec)
    rouge = scorer.score(test["expected_item"].lower(), rec.lower())['rougeL'].fmeasure
    
    # 4. Retrieval Hit Rate
    hit = 1.0 if test["expected_item"].lower() in rec.lower() or any(k in why.lower() for k in test["expected_keywords"]) else 0.0
    
    # 5. Format Adherence Check
    format_pass = 1.0 if "Recommendation:" in raw_response and "Why:" in raw_response and "Image_Path:" in raw_response else 0.0
    
    # Accumulate
    total_bleu += bleu
    total_rouge += rouge
    total_hits += hit
    total_format_pass += format_pass
    
    results.append({
        "Query": test["query"][:25] + "...",
        "Bleu": round(bleu, 2),
        "Rouge-L": round(rouge, 2),
        "Hit Rate": "100%" if hit == 1.0 else "0%",
        "Format": "PASS" if format_pass == 1.0 else "FAIL"
    })

num_samples = len(eval_dataset)
print("\n================ FINAL EVALUATION METRICS ================")
print(f"Average BLEU Score: {total_bleu / num_samples:.2f}")
print(f"Average ROUGE-L Score: {total_rouge / num_samples:.2f}")
print(f"Context Retrieval Hit Rate: {(total_hits / num_samples) * 100:.2f}%")
print(f"Prompt Format Adherence: {(total_format_pass / num_samples) * 100:.2f}%")
print("==========================================================")

import pandas as pd
df_res = pd.DataFrame(results)
print(df_res.to_string(index=False))