from fastapi import APIRouter, HTTPException
import os
import json
from openai import OpenAI
from pydantic import BaseModel

router = APIRouter()

class MoleExercise(BaseModel):
    exercise: str
    words: list[str]
    answer: str
    explanation: str

class MoleExerciseResponse(BaseModel):
    exercise_list: list[MoleExercise]

@router.post("/mole/generate", response_model=MoleExerciseResponse)
async def generate_grammar_exercises():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured")
    try:
        client = OpenAI(api_key=api_key)
        prompt = """Generate a JSON object with 10 French grammar exercises. For each exercise, follow these steps and rules exactly:

1) Start by creating a correct French sentence (no more than 12 words).
2) Create an incorrect version by changing EXACTLY ONE existing word from that correct sentence to a wrong word. The replaced word must make the sentence grammatically or semantically incorrect, but the resulting sentence must still be sensible. Do NOT "trick" the user by replacing the word with a synonym — the changed word must be an incorrect or wrong usage (wrong tense, wrong gender/number/agreement, wrong preposition, wrong article, wrong word choice, etc.), not merely a synonym.
3) The error must be produced by replacing a word that already exists in the correct sentence (no missing words; no added extra words).
4) If you use first person singular (je), avoid contractions (use "je suis", not "j'suis" or "j'ai").
5) Each sentence (correct and modified) must be <= 12 words.
6) There must be EXACTLY ONE error in each final (incorrect) sentence and that error corresponds to exactly one word.

Output format (RETURN ONLY THIS JSON OBJECT, no explanation, no code fences, no extra text):

{
  "exercise_list": [
    {
      "exercise": "the incorrect sentence (with exactly one wrong word)",
      "words": ["list", "of", "all", "words", "appearing", "in", "that", "incorrect", "sentence"],
      "answer": "the_exact_wrong_word_as_it_appears_in_the_sentence",
      "explanation": "Concise explanation why that word is wrong and what the correct form/word should be."
    },
    ... 9 more objects ...
  ]
}

Additional strict rules for the JSON content:
- Return exactly 10 exercises in the "exercise_list" array.
- "exercise" must be the incorrect sentence (the one with the single changed wrong word).
- "words" must be an array of token strings in the same order as they appear in the incorrect sentence. Preserve contractions and punctuation as single tokens if they appear in the sentence (e.g., "j'ai" may be a single token if used, but prefer "je" forms without contraction).
- "answer" must match exactly the token in "words" that is the incorrect word.
- "explanation" must state why the chosen word is wrong and explicitly state the correct replacement or correction.
- Do not include synonyms as the wrong word — the changed word must create an actual grammatical/usage error relative to the original correct sentence.
- Do not include any extra fields or metadata.
- Do not wrap the JSON in triple backticks or any other delimiters. Return raw JSON only.

Generate 10 such exercises now, following all rules exactly."""
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
        return MoleExerciseResponse(**exercises_data)
    
    except json.JSONDecodeError:
        print(response_text)
        print(exercises_data)
        raise HTTPException(status_code=500, detail="Invalid JSON from AI")
    except Exception as e:
        print(response_text)
        print(exercises_data)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/mole/generate_dummy", response_model=MoleExerciseResponse)
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
    return MoleExerciseResponse(**dummy_response)