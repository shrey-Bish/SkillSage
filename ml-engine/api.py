from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from skill_data import ROLE_SKILL_MAP, SKILL_ROADMAP
import re
from fastapi import FastAPI, File, UploadFile, Request

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # update this if needed
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class ExtractSkillsRequest(BaseModel):
    text: str

class SkillGapInput(BaseModel):
    user_skills: List[str]
    target_role: str

# Response models
class SkillGapResponse(BaseModel):
    missing_skills: List[str]
    roadmap: Optional[Dict[str, List[str]]] = None

@app.post("/api/extract-skills")
async def extract_skills(data: ExtractSkillsRequest):
    text = data.text

    # Simple skill extraction using regex to find capitalized words (demo)
    # You can replace this with your LLM or other logic
    raw_skills = re.findall(r"\b[A-Z][a-zA-Z+\-#]*\b", text)

    # Normalize and dedupe
    skills = sorted(set(skill.strip() for skill in raw_skills))

    return {"skills": skills}

@app.post("/api/skill-gap", response_model=SkillGapResponse)
async def get_skill_gap(data: SkillGapInput):
    role = data.target_role
    user_skills = set(skill.strip().lower() for skill in data.user_skills)

    if role not in ROLE_SKILL_MAP:
        raise HTTPException(status_code=404, detail="Role not found")

    required_skills = set(skill.lower() for skill in ROLE_SKILL_MAP[role])
    missing_skills = list(required_skills - user_skills)

    roadmap = {}
    for skill in missing_skills:
        skill_key = skill.capitalize()
        if skill_key in SKILL_ROADMAP:
            roadmap[skill_key] = SKILL_ROADMAP[skill_key]

    return {"missing_skills": missing_skills, "roadmap": roadmap if roadmap else None}

@app.post("/api/extract-pdf")
async def extract_pdf(file: UploadFile = File(...)):
    contents = await file.read()
    pdf_text = extract_text(BytesIO(contents))  # use pdfminer, PyMuPDF, or similar
    return {"text": pdf_text}
