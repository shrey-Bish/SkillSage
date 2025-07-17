import json
import os
from openai import OpenAI
from difflib import SequenceMatcher
from dotenv import load_dotenv
load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
#print("API Key:", os.getenv("OPENAI_API_KEY"))
# Load static roadmaps
with open("static_roadmaps.json", "r") as f:
    STATIC_ROADMAPS = json.load(f)

def jaccard_similarity(a, b):
    a_set = set(a.lower().split())
    b_set = set(b.lower().split())
    return len(a_set & b_set) / len(a_set | b_set)

def match_skills(resume_skills, target_skills):
    matched = []
    for skill in target_skills:
        for r in resume_skills:
            if jaccard_similarity(r, skill) > 0.5:
                matched.append(skill)
                break
    return matched

def get_missing_skills(target_role, resume_skills):
    roadmap = STATIC_ROADMAPS.get(target_role, [])
    all_skills = [s["skill"] for s in roadmap]
    matched = match_skills(resume_skills, all_skills)
    return [step for step in roadmap if step["skill"] not in matched]

def generate_with_openai(role, resume_skills):
    if not openai_api_key:
        return None
    client = OpenAI(api_key=openai_api_key)
    try:
        prompt = f"""I'm building a personalized learning assistant.
Given that a user knows these skills: {', '.join(resume_skills)},
generate a 5-step learning roadmap for becoming a {role}.
Each step must include:
- skill
- short description
- resource (url)
- level (beginner/intermediate/advanced)

Respond in JSON array format."""
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print("OpenAI fallback error:", e)
        return None

def generate_roadmap(role, resume_skills):
    ai_roadmap = generate_with_openai(role, resume_skills)
    if ai_roadmap:
        return ai_roadmap
    return get_missing_skills(role, resume_skills)
