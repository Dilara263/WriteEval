let chartInstance = null;

let selectedTaskType = "";

function setTaskType(taskType) {
    selectedTaskType = taskType;  // Task 1 veya Task 2'yi ayarlıyoruz
}

async function submitEssay() {
    if (!selectedTaskType) {
        alert("Please select Task 1 or Task 2 for evaluation.");
        return;
    }
    const essayText = document.getElementById("essay").value;
    const response = await fetch("http://127.0.0.1:8000/evaluate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: essayText, task_type: selectedTaskType })
    });

    const result = await response.json();
    const evaluation = result.evaluation;

    document.getElementById("result").innerText = evaluation;

    // Puanları metinden ayıkla
    const scores = {
        task: parseFloat(extractBandScore(evaluation, ["Task Achievement", "Task Response"])),
        coherence: parseFloat(extractBandScore(evaluation, ["Coherence and Cohesion"])),
        lexical: parseFloat(extractBandScore(evaluation, ["Lexical Resource"])),
        grammar: parseFloat(extractBandScore(evaluation, ["Grammatical Range and Accuracy"])),
        overall: parseFloat(extractBandScore(evaluation, ["Overall Band Score"]))
    };

    // Grafik çiz
    drawChart(scores);
}

async function correctEssay() {
    const essayText = document.getElementById("essay").value;
    const response = await fetch("http://127.0.0.1:8000/correct", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: essayText, task_type: selectedTaskType })
    });

    const data = await response.json();

    // Sonucu göster
    document.getElementById("correctedText").innerText = data.corrected_text;

    // correctedSection'ı görünür yap
    const section = document.getElementById("correctedSection");
    section.style.display = "block";

    // sayfayı o bölüme kaydır
    section.scrollIntoView({ behavior: "smooth" });
}


async function improveEssay() {
    const essayText = document.getElementById("essay").value;
    const response = await fetch("http://127.0.0.1:8000/improve", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: essayText, task_type: selectedTaskType })
    });

    const data = await response.json();

    // Sonucu göster
    document.getElementById("improvedText").innerText = data.improved_text;

    // improvedSection'ı görünür yap
    const section = document.getElementById("improvedSection");
    section.style.display = "block";

    // sayfayı o bölüme kaydır
    section.scrollIntoView({ behavior: "smooth" });
}


// Değerlendirme metninden puanları çeken yardımcı fonksiyon
function extractBandScore(text, possibleTitles) {
    for (const title of possibleTitles) {
        // Hem numaralı hem numarasız başlıkları yakalayacak regex
        const regex = new RegExp(`\\*\\*${title} \\(Band ([0-9\\.]+)\\):?\\*\\*`, "i");
        const match = text.match(regex);
        if (match) return match[1];
    }
    return null;
}
// Chart.js ile grafik çizimi
function drawChart(scores) {
    const ctx = document.getElementById("scoreChart").getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [
                "Task Response",
                "Coherence & Cohesion",
                "Lexical Resource",
                "Grammar",
                "Overall"
            ],
            datasets: [{
                label: "Band Score",
                data: [
                    scores.task,
                    scores.coherence,
                    scores.lexical,
                    scores.grammar,
                    scores.overall
                ],
                backgroundColor: [
                    "#4e73df",
                    "#1cc88a",
                    "#36b9cc",
                    "#f6c23e",
                    "#e74a3b"
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 9
                }
            }
        }
    });
}

let timerInterval;
let timeLeft = 60 * 60; // 60 dakika = 3600 saniye

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    display.textContent = formatTime(timeLeft);
}

function startTimer() {
    clearInterval(timerInterval); // Önceki sayaç varsa durdur
    timeLeft = 60 * 60; // 60 dakika
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("⏰ Your time is up! Please send your essay.");
        }
    }, 1000);
}
