from fastapi import APIRouter, HTTPException
import os
import openai
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/teach/chat", response_model=ChatResponse)
async def french_teacher_chat(request: ChatRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured")
    try:
        openai.api_key = api_key
        prompt = """You are a highly skilled and patient French teacher. Your role is to help students learn French, including grammar, vocabulary, pronunciation, and cultural nuances. 
You must only answer questions related to learning French. If a question is irrelevant or outside the scope of learning French, politely refuse to answer and redirect the user back to French learning. 
Always provide clear, concise, and helpful explanations in your responses.

Student: {message}
Teacher:"""
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt.format(message=request.message)}]
        )
        response_text = response['choices'][0]['message']['content'].strip()
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
