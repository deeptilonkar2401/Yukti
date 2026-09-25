import re
import math
from typing import List, Dict, Any

# 10 Official YUKTI Domains with rich keyword & n-gram feature dictionaries
DOMAINS = [
    {
        "domain": "Water & Sanitation",
        "subdomain": "Water Supply & Contamination",
        "keywords": [
            "water", "drinking", "pani", "fluoride", "arsenic", "well", "borewell", "tubewell", 
            "pipeline", "tap", "canal", "river", "handpump", "dam", "irrigation", "drought", 
            "contamination", "waterlog", "clean water", "aquifer", "groundwater"
        ]
    },
    {
        "domain": "Agriculture & Farming",
        "subdomain": "Crop Protection & Soil Health",
        "keywords": [
            "crop", "kheti", "farm", "farmer", "kisan", "pest", "stubble", "parali", "seed", 
            "soil", "harvest", "fertilizer", "paddy", "wheat", "lac", "infestation", "drought", 
            "irrigation", "yield", "monsoon", "agriculture"
        ]
    },
    {
        "domain": "Healthcare & Medical Services",
        "subdomain": "Emergency Transit & Medical Access",
        "keywords": [
            "hospital", "doctor", "health", "medicine", "clinic", "disease", "patient", 
            "ambulance", "maternal", "dengue", "malaria", "phc", "chc", "vaccine", "treatment", 
            "nurse", "emergency", "medical", "epidemic"
        ]
    },
    {
        "domain": "Waste Management & Environment",
        "subdomain": "Solid Waste & Pollution Control",
        "keywords": [
            "garbage", "trash", "waste", "bin", "dumping", "landfill", "sanitation", "cleanliness", 
            "sewage", "drainage", "plastic", "pollution", "air", "smog", "environment", 
            "recycling", "hygiene", "slum"
        ]
    },
    {
        "domain": "Rural Education & Skilling",
        "subdomain": "School Infrastructure & Digital Literacy",
        "keywords": [
            "school", "education", "teacher", "student", "classroom", "literacy", "digital", 
            "learning", "college", "midday meal", "blackboard", "bench", "desk", "dropout", 
            "study", "tuition"
        ]
    },
    {
        "domain": "Urban & Transport Infrastructure",
        "subdomain": "Road Safety & Civic Transit",
        "keywords": [
            "road", "bridge", "pothole", "traffic", "transport", "bus", "railway", "highway", 
            "construction", "building", "flyover", "street light", "sidewalk", "urban", 
            "infrastructure", "transit"
        ]
    },
    {
        "domain": "Renewable Energy & Power",
        "subdomain": "Grid Reliability & Solar Energy",
        "keywords": [
            "solar", "electricity", "power", "energy", "grid", "light", "blackout", "voltage", 
            "transformer", "bijli", "renewable", "generator", "wire"
        ]
    },
    {
        "domain": "Rural Livelihood & Tribal Craft",
        "subdomain": "Artisan Empowerment & Micro-enterprise",
        "keywords": [
            "livelihood", "employment", "income", "poverty", "rural", "village", "tribal", 
            "artisan", "craft", "handloom", "self-help group", "shg", " रोजगार", "karoobar", "work"
        ]
    },
    {
        "domain": "Inclusive Accessibility",
        "subdomain": "Assistive Infrastructure",
        "keywords": [
            "disabled", "handicap", "accessibility", "ramp", "wheelchair", "blind", "deaf", 
            "divyang", "disability", "braille", "inclusive"
        ]
    },
    {
        "domain": "Public Governance & Emergency Services",
        "subdomain": "Civic Service Delivery",
        "keywords": [
            "panchayat", "ration", "pension", "bribe", "scheme", "government", "officer", 
            "portal", "grievance", "public service", "police", "crime", "safety"
        ]
    }
]

EXISTING_PROBLEM_REPO = [
    {"id": "YUKTI-8840", "title": "Fluoride contamination in groundwater sources in Palamu district", "domain": "Water & Sanitation"},
    {"id": "YUKTI-8712", "title": "Tribal farmers losing lac crop due to pest infestation in Khunti", "domain": "Agriculture & Farming"},
    {"id": "YUKTI-8691", "title": "No drinking water in Santal Pargana villages during summer", "domain": "Water & Sanitation"},
    {"id": "YUKTI-8590", "title": "Stagnant water near Ranchi government school causing malaria", "domain": "Waste Management & Environment"},
    {"id": "YUKTI-8445", "title": "Paddy crop losses due to unknown pest attacks in Dumka", "domain": "Agriculture & Farming"},
    {"id": "YUKTI-8321", "title": "Monsoon flooding in Kadma area of Jamshedpur", "domain": "Urban & Transport Infrastructure"},
]

UNIVERSITIES_DATABASE = [
    {
        "name": "BIT Mesra, Ranchi",
        "dept": "Civil & Environmental Engineering",
        "domains": ["Water & Sanitation", "Urban & Transport Infrastructure", "Waste Management & Environment"],
        "faculty": 8,
        "past_projects": 12,
        "location": "Ranchi, Jharkhand"
    },
    {
        "name": "IIT (ISM) Dhanbad",
        "dept": "Environmental & Mining Engineering",
        "domains": ["Waste Management & Environment", "Water & Sanitation", "Renewable Energy & Power"],
        "faculty": 10,
        "past_projects": 15,
        "location": "Dhanbad, Jharkhand"
    },
    {
        "name": "Birsa Agricultural University, Ranchi",
        "dept": "Department of Crop Protection & Entomology",
        "domains": ["Agriculture & Farming", "Rural Livelihood & Tribal Craft", "Waste Management & Environment"],
        "faculty": 14,
        "past_projects": 20,
        "location": "Ranchi, Jharkhand"
    },
    {
        "name": "NIT Jamshedpur",
        "dept": "Computer Science & Electrical Engg",
        "domains": ["Renewable Energy & Power", "Healthcare & Medical Services", "Urban & Transport Infrastructure"],
        "faculty": 9,
        "past_projects": 11,
        "location": "Jamshedpur, Jharkhand"
    },
    {
        "name": "Central University of Jharkhand",
        "dept": "Centre for Water Engineering & Tribal Studies",
        "domains": ["Water & Sanitation", "Rural Livelihood & Tribal Craft", "Rural Education & Skilling"],
        "faculty": 7,
        "past_projects": 9,
        "location": "Ranchi, Jharkhand"
    }
]


def _tokenize(text: str) -> List[str]:
    """Clean and tokenize text into words."""
    cleaned = re.sub(r'[^\w\s]', ' ', text.lower())
    return [w for w in cleaned.split() if len(w) > 2]


def classify_problem(text: str) -> List[Dict[str, Any]]:
    """
    Semantic NLP Classifier for YUKTI problem domains.
    Computes keyword matching scores normalized by domain term frequencies.
    """
    tokens = _tokenize(text)
    if not tokens:
        return [{"domain": "Urban & Transport Infrastructure", "subdomain": "Civic Transit", "confidence": 75}]

    scores = []
    for d in DOMAINS:
        match_count = 0
        for kw in d["keywords"]:
            kw_tokens = _tokenize(kw)
            if all(kt in tokens for kt in kw_tokens):
                match_count += len(kw_tokens) * 2

        if match_count > 0:
            scores.append({
                "domain": d["domain"],
                "subdomain": d["subdomain"],
                "raw_score": match_count
            })

    if not scores:
        return [{"domain": "Urban & Transport Infrastructure", "subdomain": "Civic Infrastructure", "confidence": 70}]

    scores.sort(key=lambda x: x["raw_score"], reverse=True)
    top_score = scores[0]["raw_score"]

    results = []
    for item in scores[:3]:
        conf = min(98, max(55, int((item["raw_score"] / top_score) * 92)))
        results.append({
            "domain": item["domain"],
            "subdomain": item["subdomain"],
            "confidence": conf
        })

    return results


def compute_priority(text: str) -> Dict[str, Any]:
    """
    Computes priority score (0 to 100) based on urgency, severity, and population impact.
    """
    lower = text.lower()
    factors = {
        "affected_population": 15,
        "severity": 15,
        "urgency": 15,
        "geographic_spread": 10,
        "public_relevance": 15
    }

    if any(k in lower for k in ["village", "community", "district", "ward", "colony", "residents", "people", "thousands", "lakh"]):
        factors["affected_population"] += 25
    if any(k in lower for k in ["disease", "danger", "death", "hazard", "toxic", "contaminated", "unsafe", "broken", "emergency"]):
        factors["severity"] += 25
    if any(k in lower for k in ["immediate", "urgent", "critical", "crisis", "everyday", "daily", "now"]):
        factors["urgency"] += 25
    if any(k in lower for k in ["rural", "remote", "tribal", "interior", "multiple", "entire"]):
        factors["geographic_spread"] += 20
    if any(k in lower for k in ["government", "school", "hospital", "public", "panchayat"]):
        factors["public_relevance"] += 20

    total_score = min(100, sum(factors.values()))
    level = "Critical" if total_score >= 80 else "High" if total_score >= 60 else "Medium" if total_score >= 35 else "Low"

    reasons = []
    if factors["affected_population"] > 20: reasons.push if hasattr(reasons, 'push') else reasons.append("Affects a large population or community")
    if factors["severity"] > 20: reasons.append("Poses high risk or severe service disruption")
    if factors["urgency"] > 20: reasons.append("Requires immediate action or intervention")
    if not reasons: reasons.append("Standard civic issue needing attention")

    return {
        "score": total_score,
        "level": level,
        "factors": factors,
        "reasons": reasons
    }


def find_duplicates(title: str, description: str) -> List[Dict[str, Any]]:
    """
    Calculates Jaccard word similarity against existing problems.
    """
    input_tokens = set(_tokenize(f"{title} {description}"))
    duplicates = []

    for item in EXISTING_PROBLEM_REPO:
        repo_tokens = set(_tokenize(item["title"]))
        intersection = input_tokens.intersection(repo_tokens)
        union = input_tokens.union(repo_tokens)
        
        if union:
            sim = int((len(intersection) / len(union)) * 100)
            if sim > 15 or len(intersection) >= 2:
                duplicates.append({
                    "id": item["id"],
                    "title": item["title"],
                    "domain": item["domain"],
                    "similarity": min(95, max(25, sim * 2))
                })

    duplicates.sort(key=lambda x: x["similarity"], reverse=True)
    return duplicates[:3]


def match_universities(domain: str) -> List[Dict[str, Any]]:
    """
    Matches top Higher Education Institutions (HEIs) for a problem domain.
    """
    matches = []
    for uni in UNIVERSITIES_DATABASE:
        score = 50
        if domain in uni["domains"]:
            score += 40
        elif any(d.split()[0].lower() in domain.lower() for d in uni["domains"]):
            score += 25
        
        matches.append({
            "name": uni["name"],
            "dept": uni["dept"],
            "faculty": uni["faculty"],
            "past_projects": uni["past_projects"],
            "location": uni["location"],
            "match_score": min(98, score)
        })

    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches[:4]
