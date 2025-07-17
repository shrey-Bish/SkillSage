import spacy
from sentence_transformers import SentenceTransformer, util

nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer("all-MiniLM-L6-v2")

with open("skills_db.txt") as f:
    known_skills = [line.strip() for line in f.readlines()]
    known_embeddings = model.encode(known_skills, convert_to_tensor=True)

def extract_skills(resume_text, threshold=0.6):
    doc = nlp(resume_text)
    phrases = [chunk.text for chunk in doc.noun_chunks]

    matches = set()
    phrase_embeddings = model.encode(phrases, convert_to_tensor=True)

    cosine_scores = util.pytorch_cos_sim(phrase_embeddings, known_embeddings)

    for i, phrase in enumerate(phrases):
        for j, score in enumerate(cosine_scores[i]):
            if score.item() > threshold:
                matches.add(known_skills[j])

    return list(matches)
