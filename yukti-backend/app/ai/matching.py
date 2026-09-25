"""
Splits the scoring the way the tech-stack doc recommends: Sentence
Transformers for semantic (meaning-level) closeness, scikit-learn's
TF-IDF for keyword-level overlap with faculty expertise, and a plain
deterministic number (the capability score already in the DB) — then
combines them with fixed weights. Nothing here is a trained/learned
model; "classical ML" here means TF-IDF + cosine similarity, which is
enough to justify without overfitting a beginner-team prototype.
"""
from app.ai.embeddings import embed_text, cosine_similarity
from app.models.problem import Problem
from app.models.university import University
from app.models.industry import Industry

# Weights must sum to 1.0 for each formula.
UNIVERSITY_WEIGHTS = {"capability": 0.40, "semantic": 0.35, "keyword": 0.25}
INDUSTRY_WEIGHTS = {"semantic": 0.7, "keyword": 0.3}

FACULTY_MATCH_THRESHOLD = 0.35  # cosine similarity above which a faculty member counts as "matched"


def _tfidf_similarity(query: str, documents: list[str]) -> list[float]:
    """Returns one similarity score per document, in [0, 1]. Empty documents list -> []."""
    if not documents:
        return []
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity as sk_cosine_similarity

        vectorizer = TfidfVectorizer(stop_words="english")
        matrix = vectorizer.fit_transform([query, *documents])
        scores = sk_cosine_similarity(matrix[0:1], matrix[1:])[0]
        return scores.tolist()
    except Exception:
        # Fast, pure Python keyword overlap fallback (zero heavy ML dependencies)
        q_words = set(query.lower().split())
        scores = []
        for doc in documents:
            d_words = set(doc.lower().split())
            if not q_words or not d_words:
                scores.append(0.0)
            else:
                intersection = q_words.intersection(d_words)
                union = q_words.union(d_words)
                scores.append(len(intersection) / len(union) if union else 0.0)
        return scores


def score_university_for_problem(problem: Problem, university: University) -> dict:
    problem_text = f"{problem.title}. {problem.description}"

    capability = next((c for c in university.capabilities if c.domain == problem.domain), None)
    capability_score = capability.score if capability else 0

    faculty_texts = [
        f"{f.specialization or ''} {f.designation or ''}".strip()
        for f in university.faculty
        if (f.specialization or f.designation)
    ]

    semantic_score = 0.0
    if faculty_texts:
        faculty_embeddings = [embed_text(t) for t in faculty_texts]
        problem_embedding = problem.embedding or embed_text(problem_text)
        sims = [cosine_similarity(problem_embedding, fe) for fe in faculty_embeddings]
        semantic_score = max(sims) if sims else 0.0

    keyword_sims = _tfidf_similarity(problem_text, faculty_texts)

    matched_skills = [
        university.faculty[i].specialization
        for i, sim in enumerate(keyword_sims)
        if sim >= FACULTY_MATCH_THRESHOLD and university.faculty[i].specialization
    ]

    keyword_score = max(keyword_sims) if keyword_sims else 0.0

    combined = (
        UNIVERSITY_WEIGHTS["capability"] * capability_score
        + UNIVERSITY_WEIGHTS["semantic"] * (semantic_score * 100)
        + UNIVERSITY_WEIGHTS["keyword"] * (keyword_score * 100)
    )

    why_matched = []
    if capability_score >= 60:
        why_matched.append(f"Strong department capability in {problem.domain} ({capability_score}/100)")
    if semantic_score >= 0.5:
        why_matched.append("Faculty research focus closely matches the problem description")
    if matched_skills:
        why_matched.append(f"Faculty expertise overlaps: {', '.join(matched_skills[:3])}")
    if not why_matched:
        why_matched.append("Weak match — consider only if no stronger option is available")

    return {
        "match_score": round(combined),
        "match_breakdown": {
            "capability_score": capability_score,
            "semantic_score": round(semantic_score * 100),
            "keyword_score": round(keyword_score * 100),
        },
        "matched_skills": matched_skills,
        "why_matched": why_matched,
    }


def score_industry_for_problem(problem: Problem, industry: Industry) -> dict:
    problem_text = f"{problem.title}. {problem.description}"
    industry_text = f"{industry.sector or ''} {industry.csr_focus_area or ''}".strip()

    semantic_score = 0.0
    if industry_text:
        semantic_score = cosine_similarity(embed_text(problem_text), embed_text(industry_text))

    keyword_score = 0.0
    if industry_text:
        sims = _tfidf_similarity(problem_text, [industry_text])
        keyword_score = sims[0] if sims else 0.0

    combined = (
        INDUSTRY_WEIGHTS["semantic"] * (semantic_score * 100)
        + INDUSTRY_WEIGHTS["keyword"] * (keyword_score * 100)
    )

    why_matched = []
    if semantic_score >= 0.5:
        why_matched.append(f"CSR focus area / sector aligns with {problem.domain}")
    if not why_matched:
        why_matched.append("Weak match — consider only if no stronger option is available")

    matched_skills = [industry.csr_focus_area] if industry.csr_focus_area and semantic_score >= 0.4 else []

    return {
        "match_score": round(combined),
        "match_breakdown": {
            "semantic_score": round(semantic_score * 100),
            "keyword_score": round(keyword_score * 100),
        },
        "matched_skills": matched_skills,
        "why_matched": why_matched,
    }
