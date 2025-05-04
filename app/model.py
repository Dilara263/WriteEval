import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel('gemini-1.5-pro-latest')

def evaluate_essay(text: str, task_type: str) -> dict:
    prompt = f"""
You are a certified IELTS examiner.
Evaluate the following {task_type} writing response using the four IELTS criteria:

-Task Achievement or Task Response
-Coherence and Cohesion
-Lexical Resource
-Grammatical Range and Accuracy

For each category:
- Assign a band score (0 to 9)
- Give Overall Band Score as **Overall Band Score (Band ...)**
- Give a short explanation

Student response:
{text}
"""
    response = model.generate_content(prompt)
    return {"evaluation": response.text}

def correct_essay(text: str) -> str:
    prompt = f"""
You are an English writing assistant. The student has written the following text. Your task is to correct all grammatical, spelling, punctuation, and structural mistakes.

- Do **not** change the original meaning.
- Use natural, academic English.
- Return only the corrected version. Do not explain.

Student's original text:
{text}
"""
    response = model.generate_content(prompt)
    return response.text

def improve_essay(text: str) -> str:
    prompt = f"""
You are an academic writing coach. Improve the following IELTS writing response to sound more fluent, cohesive, and sophisticated.

- Use better vocabulary and sentence structures.
- Make it sound like a high Band 9 IELTS essay.
- Keep the original ideas, but enhance the expression.
- Return only the improved version. Do not explain.

Original text:
{text}
"""
    response = model.generate_content(prompt)
    return response.text