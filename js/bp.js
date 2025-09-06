const form = document.getElementById('bpForm');
const historyTable = document.getElementById('historyTable').querySelector('tbody');
const feedbackBox = document.getElementById('feedbackBox');

let readings = [];

async function loadBP() {
  const snapshot = await db.collection("bpReadings").orderBy("date", "desc").get();
  readings = [];
  snapshot.forEach(doc => readings.push(doc.data()));
  renderTable();
}

function getStatus(s, d) {
  if (s >= 180 || d >= 120) return "Crisis";
  if (s >= 140 || d >= 90) return "Stage 2";
  if (s >= 130 || d >= 80) return "Stage 1";
  if (s >= 120 && d < 80) return "Elevated";
  return "Normal";
}

function getTips(status) {
  const tips = {
    Normal: ["Great job maintaining a healthy BP!"],
    Elevated: ["Try reducing sodium intake and managing stress."],
    Stage1: ["Monitor your BP and consider seeing a doctor."],
    Stage2: ["Consult a healthcare provider for treatment options."],
    Crisis: ["Seek immediate medical attention!"]
  };
  const options = tips[status];
  return options[Math.floor(Math.random() * options.length)];
}

function renderTable() {
  historyTable.innerHTML = "";
  readings.forEach(r => {
    const status = getStatus(r.systolic, r.diastolic);
    const row = `<tr><td>${r.date}</td><td>${r.systolic}/${r.diastolic}</td><td>${r.pulse}</td><td>${status}</td><td>${r.mood}</td></tr>`;
    historyTable.innerHTML += row;
  });
  updateChart();
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const s = +document.getElementById('systolic').value;
  const d = +document.getElementById('diastolic').value;
  const p = +document.getElementById('pulse').value;
  const m = document.getElementById('mood').value;
  const date = new Date().toISOString().split('T')[0];
  const status = getStatus(s, d);
  const tip = getTips(status);
  feedbackBox.innerHTML = `<strong>Status:</strong> ${status}<br><strong>Tip:</strong> ${tip}`;
  await db.collection("bpReadings").add({ date, systolic: s, diastolic: d, pulse: p, mood: m });
  loadBP();
  form.reset();
});

function updateChart() {
  const labels = readings.map(r => r.date).reverse();
  const systolics = readings.map(r => r.systolic).reverse();
  const diastolics = readings.map(r => r.diastolic).reverse();
  if (window.bpChart) window.bpChart.destroy();
  const ctx = document.getElementById('bpChart').getContext('2d');
  window.bpChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Systolic', data: systolics, borderColor: 'red', fill: false },
        { label: 'Diastolic', data: diastolics, borderColor: 'blue', fill: false }
      ]
    }
  });
}

loadBP();
