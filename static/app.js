let chartInstance = null;
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
    timeLeft = 60 * 60;
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
    //console.log("Tüm response verisi:", data);

    document.getElementById("highlightedText").innerHTML = data.highlighted_text;
    document.getElementById("correctedText").innerText = data.corrected_text;

    const section = document.getElementById("correctedSection");
    section.style.display = "block";

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

    document.getElementById("improvedText").innerText = data.improved_text;

    const section = document.getElementById("improvedSection");
    section.style.display = "block";

    section.scrollIntoView({ behavior: "smooth" });
}

async function analyzeEssay() {
    const essayText = document.getElementById("essay").value;

    const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: essayText, task_type: selectedTaskType })
    });

    const data = await response.json();

    // 1. Kelime sayısı ve hata sayısı
    document.getElementById("wordCount").innerText = data.word_count;
    document.getElementById("grammarMistakes").innerText = data.grammar_mistake_count;

    console.log(data.vocab_levels);
    // 2. Tekrarlanan kelimeleri listele
    const list = document.getElementById("vocabRepetitionList");
    list.innerHTML = "";
    data.vocab_repetition.forEach(item => {
        const li = document.createElement("li");
        li.innerText = `${item.word} (${item.count} times)`;
        list.appendChild(li);
    });

    // 3. Vocabulary seviyelerine göre pasta grafiği çiz
    drawVocabChart(data.vocab_levels);
}

function drawVocabChart(data) {
  const ctx = document.getElementById("vocabChart").getContext("2d");

  // Eğer daha önce çizilmişse, önce yok et
  if (window.vocabChart instanceof Chart) {
    window.vocabChart.destroy();
  }

  const vocabComplexityData = data;

  const labels = Object.keys(vocabComplexityData);
  const values = Object.values(vocabComplexityData);

  window.vocabChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Vocabulary Complexity',
        data: values,
        backgroundColor: [
          '#ff6384',
          '#36a2eb',
          '#ffcd56',
          '#4bc0c0',
          '#9966ff'
        ]
      }]
    },
    options: {
      responsive: false
    }
  });
}


