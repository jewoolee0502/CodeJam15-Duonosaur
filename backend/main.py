from fastapi import FastAPI
from dotenv import load_dotenv
from dino import router as dino_router

load_dotenv()

app = FastAPI()
app.include_router(dino_router)

@app.get("/")
async def root():
    return {"message": "French Vocabulary Exercise Generator API"}
