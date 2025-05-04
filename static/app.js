async function submitEssay() {
    const essayText = document.getElementById("essay").value;
    const response = await fetch("http://127.0.0.1:8000/evaluate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: essayText })
    });
    const result = await response.json();
    document.getElementById("result").innerText = result.evaluation;
}
