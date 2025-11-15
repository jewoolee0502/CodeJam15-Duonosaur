from fastapi import FastAPI
from dotenv import load_dotenv

from dino import router as dino_router
from mole import router as mole_router

load_dotenv()

app = FastAPI()
app.include_router(dino_router)
app.include_router(mole_router)

@app.get("/")
async def root():
    return {"message": "French Vocabulary Exercise Generator API"}
