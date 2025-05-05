from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.model import evaluate_essay, correct_essay, improve_essay
from app.schemas import EssayRequest
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/evaluate")
async def evaluate(request: EssayRequest):
    result = await evaluate_essay(request.text, request.task_type)
    return result

@app.post("/correct")
async def correct(request: EssayRequest):
    result = await correct_essay(request.text)
    return {
        "highlighted_text": result["highlighted_text"],
        "corrected_text": result["corrected_text"]
    }

@app.post("/improve")
async def improve(request: EssayRequest):
    improved_text = await improve_essay(request.text)
    return {"improved_text": improved_text}
