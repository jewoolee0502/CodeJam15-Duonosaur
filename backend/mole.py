from fastapi import APIRouter, HTTPException
import os
import json
from openai import OpenAI
from pydantic import BaseModel

router = APIRouter()

class MoleExcercise(BaseModel):
    exercise: str
    words: list[str]
    answer: str
    explanation: str

class MoleExcerciseResponse(BaseModel):
    exercise_list: list[MoleExcercise]

@router.post("/mole/generate", response_model=MoleExcerciseResponse)
async def generate_grammar_exercises():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured")
    try:
        client = OpenAI(api_key=api_key)
        prompt = """Generate a JSON object with 10 French grammar exercises. Each exercise contains: a French sentence with exactly one grammar error, a list that contains all words appearing in the sentence, the answer indicating the wrong word, and an explanation of why using that word is wrong.
Rules:
- Each sentence should be no longer than 12 words.
- There MUST be EXACTLY ONE grammar error that corresponds to exactly one word.
- The error must not be missing a word; it should be an incorrect usage of a present word.
- Whenever use the first person singular (je), avoid contractions (e.g., use "je suis" instead of "j'suis").

Format:
{
    "exercise_list": [
        {
            "exercise": "some sentence with exactly one error", 
            "words": ["wordA", "wordB"], 
            "answer": "ansWord", 
            "explanation": "why it is wrong"
        },
        {
            "exercise": "another sentence with exactly one error", 
            "words": ["wordC", "wordD"], 
            "answer": "answer", 
            "explanation": "why it is wrong"
        }
    ]
}

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
        return MoleExcerciseResponse(**exercises_data)
    
    except json.JSONDecodeError:
        print(response_text)
        print(exercises_data)
        raise HTTPException(status_code=500, detail="Invalid JSON from AI")
    except Exception as e:
        print(response_text)
        print(exercises_data)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/mole/generate_dummy", response_model=MoleExcerciseResponse)
async def generate_dummy_grammar_exercises():
    dummy_response = {
        "exercice_list": [
            {
                "exercise": "Il est aller à l'école.",
                "words": ["Il", "est", "aller", "à", "l'école"],
                "answer": "aller",
                "explanation": "The verb 'aller' should be conjugated as 'allé' to agree with the subject."
            },
            {
                "exercise": "Elle a mange une pomme.",
                "words": ["Elle", "a", "mange", "une", "pomme"],
                "answer": "mange",
                "explanation": "The verb 'mange' should be 'mangé' to correctly form the past tense."
            },
            {
                "exercise": "Nous sommes contentes de vous voir.",
                "words": ["Nous", "sommes", "contentes", "de", "vous", "voir"],
                "answer": "contentes",
                "explanation": "The adjective 'contentes' should agree in gender with the subject 'nous' if it refers to males or a mixed group."
            },
            {
                "exercise": "Ils ont fini leurs devoir.",
                "words": ["Ils", "ont", "fini", "leurs", "devoir"],
                "answer": "devoir",
                "explanation": "The noun 'devoir' should be pluralized as 'devoirs' to match the context."
            },
            {
                "exercise": "Tu as pris ta clés.",
                "words": ["Tu", "as", "pris", "ta", "clés"],
                "answer": "ta",
                "explanation": "The possessive 'ta' should be 'tes' to agree with the plural noun 'clés'."
            },
            {
                "exercise": "Je suis allé à la maison hier soir.",
                "words": ["Je", "suis", "allé", "à", "la", "maison", "hier", "soir"],
                "answer": "allé",
                "explanation": "The verb 'allé' should be 'allée' to agree with the feminine subject 'je' if it refers to a female."
            },
            {
                "exercise": "Les enfant jouent dans le parc.",
                "words": ["Les", "enfant", "jouent", "dans", "le", "parc"],
                "answer": "enfant",
                "explanation": "The noun 'enfant' should be pluralized as 'enfants' to match the plural subject."
            },
            {
                "exercise": "Vous avez oublier vos clés.",
                "words": ["Vous", "avez", "oublier", "vos", "clés"],
                "answer": "oublier",
                "explanation": "The verb 'oublier' should be 'oublié' to correctly form the past tense."
            },
            {
                "exercise": "Il a vu ses amis hier soir.",
                "words": ["Il", "a", "vu", "ses", "amis", "hier", "soir"],
                "answer": "ses",
                "explanation": "The possessive 'ses' is correct, but 'son' would be incorrect in this context."
            },
            {
                "exercise": "La fille que j'ai vu hier est gentille.",
                "words": ["La", "fille", "que", "j'ai", "vu", "hier", "est", "gentille"],
                "answer": "vu",
                "explanation": "The verb 'vu' should be 'vue' to agree with the feminine direct object 'fille'."
            }
        ]
    }
    return MoleExcerciseResponse(**dummy_response)