from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.model import evaluate_essay, correct_essay, improve_essay
from app.schemas import EssayRequest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/evaluate")
async def evaluate(request: EssayRequest):
    result = evaluate_essay(request.text, request.task_type)
    return result

@app.post("/correct")
async def correct(request: EssayRequest):
    corrected_text = correct_essay(request.text)
    return {"corrected_text": corrected_text}

@app.post("/improve")
async def improve(request: EssayRequest):
    improved_text = improve_essay(request.text)
    return {"improved_text": improved_text}
