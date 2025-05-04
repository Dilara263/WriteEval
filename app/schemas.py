from pydantic import BaseModel

class EssayRequest(BaseModel):
    text: str
