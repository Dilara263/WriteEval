from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.model import evaluate_essay
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
    result = evaluate_essay(request.text)
    return result
