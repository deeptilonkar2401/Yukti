from sqlalchemy.orm import Session

from app.ai.embeddings import cosine_similarity
from app.models.problem import Problem

DUPLICATE_SIMILARITY_THRESHOLD = 0.82  # tune after seeing real submissions
MAX_DUPLICATES_RETURNED = 5


def find_similar_problems(db: Session, problem: Problem) -> list[tuple[Problem, float]]:
    """
    Brute-force cosine similarity against other problems in the same domain
    (same-domain filter first — cheap, and keeps the comparison meaningful;
    a "water crisis" report shouldn't be flagged as a duplicate of an
    "education" report just because both mention "urgent help needed").
    Fine at prototype scale (hundreds–low thousands of problems). If this
    becomes a bottleneck, move to pgvector + an ANN index instead of
    comparing every row in Python.
    """
    if not problem.embedding:
        return []

    candidates = (
        db.query(Problem)
        .filter(Problem.domain == problem.domain, Problem.id != problem.id, Problem.embedding.isnot(None))
        .all()
    )

    scored = [
        (candidate, cosine_similarity(problem.embedding, candidate.embedding))
        for candidate in candidates
    ]
    similar = [(c, score) for c, score in scored if score >= DUPLICATE_SIMILARITY_THRESHOLD]
    similar.sort(key=lambda pair: pair[1], reverse=True)
    return similar[:MAX_DUPLICATES_RETURNED]
