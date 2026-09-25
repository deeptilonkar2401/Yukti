"""
Wraps text embedding logic. Uses Sentence Transformers if available,
or a lightweight, fast, normalized hash vectorizer fallback if not installed,
ensuring zero dependencies on heavy ML/CUDA packages.
"""
import hashlib
from functools import lru_cache
import numpy as np

_MODEL_NAME = "all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def _get_model():
    try:
        from sentence_transformers import SentenceTransformer
        return SentenceTransformer(_MODEL_NAME)
    except Exception:
        return None


def embed_text(text: str) -> list[float]:
    """Returns a 384-dim normalized embedding as a plain list."""
    model = _get_model()
    if model is not None:
        try:
            vector = model.encode(text, normalize_embeddings=True)
            return vector.tolist()
        except Exception:
            pass

    # Lightweight fast hash vectorizer (384-dim normalized)
    words = text.lower().split()
    vec = np.zeros(384, dtype=np.float32)
    for w in words:
        idx = int(hashlib.md5(w.encode("utf-8")).hexdigest(), 16) % 384
        vec[idx] += 1.0
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Calculates cosine similarity between two normalized vectors."""
    va, vb = np.array(a), np.array(b)
    denom = (np.linalg.norm(va) * np.linalg.norm(vb)) or 1e-8
    return float(np.dot(va, vb) / denom)
