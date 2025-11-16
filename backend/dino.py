import os
import json
from typing import Optional
from fastapi import HTTPException, APIRouter
from pydantic import BaseModel
from openai import OpenAI

router = APIRouter()

class DinoExerciseRequest(BaseModel):
    theme: Optional[str] = "general vocabulary"


class DinoExercise(BaseModel):
    english_word: str
    right_translation: str
    wrong_translation: str


class DinoExerciseResponse(BaseModel):
    exercice_list: list[DinoExercise]


@router.post("/dino/generate", response_model=DinoExerciseResponse)
async def generate_dino_exercises(request: DinoExerciseRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured")
    
    try:
        client = OpenAI(api_key=api_key)
        
        prompt = f"""Generate a JSON object with 10 French vocabulary exercises about {request.theme}. Each exercise contains an English word, its correct French translation, and an incorrect French translation from the same semantic category but clearly distinguishable.

Rules:
- Wrong translation must be thematically related (same category/domain) but NOT a valid alternative translation
- Avoid ambiguous pairs where both could be correct (e.g., "bread" → "pain" vs "baguette" is bad because both are breads)
- Use common, everyday vocabulary within the {request.theme} domain
- Ensure wrong translation is clearly incorrect but plausible enough to test understanding

Format:
{{"exercice_list": [{{"english_word": "Computer","right_translation": "Ordinateur","wrong_translation": "Clavier"}}]}}

Generate exactly 10 exercises following this structure. Return ONLY the JSON object, no additional text."""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1200
        )
        response_text = response.choices[0].message.content.strip()
        
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        exercises_data = json.loads(response_text)
        return DinoExerciseResponse(**exercises_data)
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON from AI: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating exercises: {str(e)}")
    
    
@router.post("/dino/generate_dummy", response_model=DinoExerciseResponse)
async def generate_dino_dummy(request: DinoExerciseRequest):
    # Dummy response for testing purposes
    dummy_response = {
        "exercice_list": [
            {"english_word": "Computer", "right_translation": "Ordinateur", "wrong_translation": "Clavier"},
            {"english_word": "Table", "right_translation": "Table", "wrong_translation": "Chaise"},
            {"english_word": "Book", "right_translation": "Livre", "wrong_translation": "Cahier"},
            {"english_word": "Car", "right_translation": "Voiture", "wrong_translation": "Bicyclette"},
            {"english_word": "Dog", "right_translation": "Chien", "wrong_translation": "Chat"},
            {"english_word": "House", "right_translation": "Maison", "wrong_translation": "Appartement"},
            {"english_word": "Water", "right_translation": "Eau", "wrong_translation": "Lait"},
            {"english_word": "Sun", "right_translation": "Soleil", "wrong_translation": "Lune"},
            {"english_word": "Tree", "right_translation": "Arbre", "wrong_translation": "Buisson"},
            {"english_word": "Chair", "right_translation": "Chaise", "wrong_translation": "Canapé"}
        ]
    }
    return DinoExerciseResponse(**dummy_response)