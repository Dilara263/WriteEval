import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel('gemini-1.5-pro-latest')

def evaluate_essay(text: str, task_type: str = "Task 2") -> dict:
    prompt = f"""
You are a certified IELTS examiner.
Evaluate the following {task_type} writing response using the four IELTS criteria:

1. Task Achievement / Task Response
2. Coherence and Cohesion
3. Lexical Resource
4. Grammatical Range and Accuracy

For each category:
- Assign a band score (0 to 9)
- Give a short explanation

Student response:
{text}
"""
    response = model.generate_content(prompt)
    return {"evaluation": response.text}
