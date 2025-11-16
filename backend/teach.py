from fastapi import APIRouter, HTTPException
import os
from openai import OpenAI
from pydantic import BaseModel
from typing import Optional
import json

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    translation: Optional[str] = None
    audioText: Optional[str] = None

@router.post("/teach/chat", response_model=ChatResponse)
async def french_teacher_chat(request: ChatRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured")
    try:
        client = OpenAI(api_key=api_key)

        # System instruction requests a strict JSON response with useful fields.
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a patient and clear French teacher assistant. "
                    "When given a student message, respond only with a JSON object in the following exact format:\n"
                    "{\n"
                    "  \"response\": \"<teacher reply in natural French or English, concise>\",\n"
                    "  \"translation\": \"<optional short English translation or explanation>\",\n"
                    "  \"audioText\": \"<optional French text suitable for TTS>\"\n"
                    "}\n"
                    "If some fields are not applicable, set them to null or omit them. "
                    "Always keep the JSON valid. Do not include any extra commentary outside the JSON."
                )
            },
            {"role": "user", "content": request.message}
        ]

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=800
        )

        response_text = response.choices[0].message.content.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()

        # Try to parse JSON; if parsing fails, return the full text as 'response'.
        try:
            parsed = json.loads(response_text)
            # Normalize keys
            resp_text = parsed.get("response") if parsed.get("response") is not None else str(parsed)
            translation = parsed.get("translation")
            audio_text = parsed.get("audioText") or parsed.get("audio_text")
            return ChatResponse(response=resp_text, translation=translation, audioText=audio_text)
        except Exception:
            # Fallback: return raw content as response
            return ChatResponse(response=response_text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
