# Occasion-Aware Multimodal Fashion Styling Agent Using Agentic RAG Framework

## CS-416 Natural Language Processing (3+0)  
## Department of Computer Science, BSCS Program  
## HITEC University, Taxila  
## Instructor: Dr. Samia Ijaz  
## Group Members:  
- Abdullah Arif (22-CS-168)  
- Infaal Noor (21-CS-063)  
- Abdullah Sajid Abbasi (22-CS-200)  
## Submission Date: June 22, 2026  

---

## 1. Introduction & Problem Formulation

In contemporary fashion recommendation systems, exact keyword matching is insufficient when the user input is inherently abstract or context-dependent. For example, a query such as “university presentation outfit” does not contain direct item names, brand labels, or explicit style tokens. Instead, it encodes an occasion, a communicative intent, and a multimodal expectation: the outfit must appear professional, comfortable, visually coherent for an academic setting, and compatible with a student’s available wardrobe. Traditional keyword-based retrieval systems, depending on lexical overlap, fail to capture this semantic richness. This failure manifests as irrelevant recommendations, poor user satisfaction, and an inability to generalize beyond fixed catalog terminology.

This assignment is formulated as a Complex Computing Problem (CCP) oriented toward CO3 and CO4. CO3 demands rigorous analysis and evaluation of model behavior under semantic abstraction, and CO4 requires designing and developing a robust end-to-end NLP pipeline. The problem is thus structured as: given a natural language prompt with occasion-oriented, domain-specific, and occasionally out-of-domain content, retrieve the most relevant fashion items from a structured catalog and generate a stylistically coherent response constrained by both visual and textual rules. This requires not only evaluating model performance against exact retrieval benchmarks, but also engineering a pipeline that integrates dense semantic search, language model inference, and domain-aware post-processing. The system must therefore solve a dual challenge: semantically interpret abstract prompts and enforce styling constraints, while maintaining high fidelity to downstream retrieval and generation metrics.

---

## 2. Literature Review

The evolution of Retrieval-Augmented Generation (RAG) in NLP has been driven by the need to bridge structured knowledge sources and generative language models. Early intelligent systems relied on token-frequency models such as TF-IDF and BM25, which measure similarity based on keyword overlap. These methods were effective for document retrieval in constrained domains but suffered when user queries were semantically broad or when lexical variance was high. In fashion styling, where users often describe the desired outcome rather than the exact product label, such sparse retrieval cannot capture latent semantic associations.

The emergence of Dense Vector Retrieval represented a paradigm shift. Models like BERT and Sentence-BERT produce contextual embeddings where semantically similar phrases are located near one another in continuous vector space. FAISS, a library optimized for efficient similarity search on dense vectors, enabled the practical use of these embeddings at scale. In our architecture, FAISS is paired with HuggingFaceEmbeddings using `all-MiniLM-L6-v2`. This embedding engine is designed to produce compact vectors that preserve fine-grained semantic relationships while remaining computationally efficient.

State-of-the-art Large Language Models (LLMs) such as Gemini further extended the RAG framework by allowing generative reasoning over retrieved context. Gemini’s capacity for prompt-conditioned inference gives it the ability to assimilate retrieved catalog data and domain rules into a coherent output. When combined with dense retrieval, the system becomes context-grounded: retrieval provides relevant evidence, while generation maps that evidence into a user-facing recommendation. This integration of FAISS with BERT-style embeddings and Gemini LLMs exemplifies the modern trajectory of RAG, moving from shallow lexical matching toward deep semantic retrieval and generation.

---

## 3. Dataset & Preprocessing Pipeline

### 3.1 Structured Catalog Description

The primary dataset for this research is the `catalog.json` file. This JSON corpus encodes each product as a structured object with the following canonical fields:

- `id`: a unique numerical or string identifier that distinguishes each catalog item.
- `name`: the human-readable product name, used for display and retrieval resolution.
- `category`: a taxonomy field capturing the type of garment or accessory, such as formal shirt, casual pants, or sportswear.
- `occasion`: the target use-case label, reflecting the contextual suitability of the item.
- `description`: a descriptive textual summary that provides semantic detail about fabric, fit, texture, and style.
- `color`: the dominant color attribute, important for contrast and outfit coordination.
- `image_path`: the local file path reference for the associated product image asset.

This structured mapping enables the system to ingest both semantic metadata and multimodal grounding signals. Each object is treated as a retrieval unit within the FAISS vector store, while the `description` and `occasion` fields are particularly critical for embedding generation and similarity search.

### 3.2 Core Product Entities

The dataset includes four core product entities selected to represent distinct fashion categories and occasion specializations:

- **Classic Navy Blue Shirt (Formal)**: This item models a formal upper-body garment suitable for presentations and academic functions. Its formal label and navy color encode business-like aesthetics.
- **White Linen Button-Down (Semi-Formal)**: This piece represents a semi-formal option with breathable fabric and relaxed tailoring, ideal for hybrid events such as faculty meetings or campus networking.
- **Black Performance Tracksuit (Sportswear)**: This item addresses sportswear occasions, focusing on mobility, moisture-wicking performance, and athletic aesthetic for physical activity.
- **Casual Beige Chinos (Casual)**: This garment provides a relaxed casual baseline for hangouts, study sessions, and everyday campus wear, emphasizing comfort and neutral color coordination.

These entities are intentionally chosen to test the system’s ability to perform occasion-aware recommendations across formal, semi-formal, sportswear, and casual categories.

### 3.3 Domain Rule-Base

The system also integrates an expert rule-base defined in `styling_rules.txt`. The rule base contains domain knowledge such as:

- **Contrast Rule**: Ensures visual balance by recommending complementary or contrasting colors, especially when pairing tops and bottoms.
- **Occasion Matching**: Enforces alignment between the prompt’s target event and the item’s `occasion` label, preventing mismatched recommendations such as formal wear for sports activities.
- **Skin Tone Advice**: Guides color recommendations relative to a user’s skin undertone, encouraging choices that maximize visual harmony.
- **Footwear Logic**: Maps outfit categories to appropriate footwear classes, ensuring the ensemble is complete and contextually consistent.
- **Layering**: Provides guidance on layering garments for temperature and style, particularly relevant for formal campus presentations and semi-formal campus events.

These rules act as a domain-specific post-processing layer, adding deterministic guardrails on top of the probabilistic output of the generative model.

### 3.4 Preprocessing Layer in `main2.py`

The preprocessing pipeline implemented in `main2.py` is engineered for transformer-based embedding ingestion. It includes:

- **Tokenization splits**: User prompts are segmented into tokens using a tokenizer compatible with transformer embeddings. This preserves syntactic structures and ensures that semantic relationships are maintained for bidirectional attention.
- **Custom punctuation stripping for greetings checking**: The pipeline applies targeted punctuation normalization only for greeting and meta-intent detection. This specialized normalization allows the system to identify salutations such as “Hello” or “Hi” without disturbing the core prompt semantics.
- **Bypassing traditional NLTK stop-word removal**: The preprocessing intentionally omits classical stop-word filtering. In transformer-based models, stop words contribute to the full syntactic structure that bidirectional attention uses to compute contextual embeddings. Removing these tokens would degrade the alignment between query vectors and catalog vectors, particularly for nuanced prompts like “university presentation outfit,” where prepositions and relational words carry meaning.

This preprocessing layer therefore prioritizes preservation of the original linguistic structure over sparse lexical reduction, which is essential for accurate semantic retrieval in BERT-style embedding spaces.

---

## 4. Proposed Methodology

The proposed architecture consists of the following sequential steps:

1. **Document Ingestion (JSON Catalog)**: The `catalog.json` file is parsed and each product entry is ingested as an indexed document. Textual fields such as `name`, `category`, `occasion`, and `description` are concatenated into a single representation optimized for embedding generation.
2. **FAISS Vector Mapping**: Each document is encoded using `HuggingFaceEmbeddings('all-MiniLM-L6-v2')`, and the resulting dense vectors are inserted into a local FAISS index. The FAISS store is configured with `allow_dangerous_deserialization=True` to enable loading previously serialized indices from disk, ensuring reproducible experiments.
3. **Prompt Template Constraints**: A prompt template is constructed to constrain Gemini’s inference. The template includes explicit instructions to:
   - Prefer catalog items by matching occasion and style.
   - Respect domain rules from `styling_rules.txt`.
   - Prioritize recommendations that include product name, category, and image path.
   - Avoid hallucinations and limit output to the scope of the provided catalog.
4. **Gemini Parameter Inference**: The system uses `langchain_google_genai` with `ChatGoogleGenerativeAI` configured for `gemini-2.5-flash` and `temperature=0.3`. Low temperature is chosen to reduce stochastic variability and produce stable recommendations. Gemini is given the retrieved context, prompt template, and user query for inference.
5. **Post-Processing Guardrails**: The generated response passes through an advanced response parser designed to:
   - Validate that the output contains one of the catalog item names.
   - Extract `image_path` keywords when present.
   - Map semi-structured text to the canonical fields of the product metadata.
   - Apply domain rules such as footwear logic and occasion matching to reject or adjust outputs that deviate from the target constraints.

This architecture balances retrieval precision with generative flexibility while maintaining strict domain compliance.

### 4.1 Cosine Similarity Formula

The similarity between a query vector and a document vector is computed using cosine similarity:

\[
\text{Sim}(\vec{Q}, \vec{D}_i) = \frac{\vec{Q} \cdot \vec{D}_i}{\|\vec{Q}\| \|\vec{D}_i\|}
\]

This formula ensures that retrieval is based on directional similarity rather than raw magnitude, which is essential for comparing embeddings in the FAISS index.

---

## 5. Experimental Setup & Results Analysis

### 5.1 Evaluation Metrics

The evaluation metrics are designed to measure both semantic fidelity and system reliability:

- **Average BLEU**: Measures n-gram precision between generated recommendations and gold-standard text, reflecting lexical and phrasing alignment.
- **Average ROUGE-L**: Measures longest common subsequence recall, which captures the overlap of essential content in generated text.
- **Context Retrieval Hit Rate**: Reports the percentage of queries for which the correct catalog context was retrieved.
- **Prompt Format Adherence**: Verifies that the output obeys the required response structure defined by the template and post-processing guardrails.

### 5.2 Results Table

| Query                                      | BLEU | ROUGE-L | Hit Rate | Format |
|-------------------------------------------|------|---------|----------|--------|
| University Presentation                   | 0.75 | 0.75    | 100%     | PASS   |
| Suggest me something for playing football... | 1.00 | 1.00    | 100%     | PASS   |
| Going on a casual hangout...              | 1.00 | 1.00    | 100%     | PASS   |
| Can you recommend a recipe for Biryani?    | 1.00 | 1.00    | 100%     | PASS   |

- Average BLEU: 0.94
- Average ROUGE-L: 0.94
- Context Retrieval Hit Rate: 100.00%
- Prompt Format Adherence: 100.00%

### 5.3 Critical Analysis

The experimental results demonstrate that the system achieves near-perfect evaluation metrics across the test set, with the exception of the “University Presentation” scenario. The drop to 0.75 BLEU and ROUGE-L in that case reflects a semantic interpretation issue rather than a retrieval failure. Gemini generated the phrase “Classic Navy Blue Suit,” which is semantically aligned with a formal academic presentation outfit but does not exactly match the canonical catalog item name “Classic Navy Blue Shirt.” From the perspective of lexical evaluation, this mismatch reduces the overlap score. However, the backend post-processing parser successfully resolved the output to the correct item by identifying the underlying formal style and selecting the corresponding image path from the catalog. This shows the importance of robust post-processing when using generative models that may paraphrase or generalize product descriptions.

The “Biryani” query is an important safety test. Although it is out-of-domain for a fashion styling agent, the system still returned a PASS for format adherence because the prompt template and post-processor effectively triggered a safety guardrail. The model recognized the mismatch and the retrieval pipeline prevented it from producing a recipe recommendation. This illustrates a critical design requirement for agentic RAG systems: they must detect and safely handle queries that fall outside the defined domain, rather than attempting to force a fashion answer. The 100% hit rate across all queries confirms that FAISS retrieval with `all-MiniLM-L6-v2` embeddings successfully located the correct catalog context for every prompt, while the prompt format adherence metric validates the effectiveness of the response parser and guardrails.

Overall, the results highlight that semantic retrieval and generative inference can achieve high performance on abstract, occasion-oriented prompts when domain rules and post-processing are integrated tightly with the RAG pipeline. The lower lexical scores in one case should be interpreted as an expected consequence of generative flexibility rather than a system failure.

---

## 6. Conclusion & Future Work

This research demonstrates the feasibility of an occasion-aware multimodal fashion styling agent built on an agentic RAG framework. By combining a structured JSON catalog, FAISS dense vector retrieval, transformer-based HuggingFace embeddings, and Gemini generative inference, the system addresses the dual challenge of semantic prompt interpretation and domain-specific style recommendation. The inclusion of a rule-based styling layer and advanced post-processing ensures that generated outputs remain aligned with fashion logic and catalog constraints. The experimental results confirm strong retrieval accuracy and stable generation under low-temperature inference.

For future work, several multimodal and agentic enhancements are recommended:

- Integrate actual image embeddings alongside textual metadata, enabling true visual-semantic retrieval for outfit coordination.
- Expand the rule base with dynamic personalization signals such as user profile, body shape, and seasonal preferences.
- Incorporate a multi-step agentic reasoning loop in which the model can ask clarifying questions before finalizing a recommendation, improving robustness on ambiguous prompts.
- Add continuous learning from user feedback, allowing the RAG pipeline to refine retrieval weights and adjust prompt templates based on real-world usage.

These enhancements would advance the system from a catalog-grounded recommendation engine to a more interactive, personalized fashion stylist capable of handling complex multimodal interactions.

---

## 7. References

- Reimers, N. and Gurevych, I. “Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks.” In Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing.  
- Johnson, J., Douze, M., and Jégou, H. “Billion-scale similarity search with GPUs.” IEEE Transactions on Big Data, 2021.  
- Google Research. “Gemini: Advances in large language models for conversational and multimodal intelligence.” Google AI blog, 2024.