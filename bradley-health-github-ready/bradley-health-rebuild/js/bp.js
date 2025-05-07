const form = document.getElementById('bpForm');
const historyTable = document.getElementById('historyTable').querySelector('tbody');
const feedbackBox = document.getElementById('feedbackBox');
let readings = JSON.parse(localStorage.getItem('bpReadings')) || [];

function getStatus(s, d) {
  if (s >= 180 || d >= 120) return "Crisis";
  if (s >= 140 || d >= 90) return "Stage2";
  if (s >= 130 || d >= 80) return "Stage1";
  if (s >= 120 && d < 80) return "Elevated";
  return "Normal";
}

function getTips(status) {
  const tips = {
    Normal: ["Keep it up! Maintain healthy habits."],
    Elevated: ["Watch your sodium and stress levels."],
    Stage1: ["Monitor regularly. Consider talking to your doctor."],
    Stage2: ["Consult your doctor. This is a high reading."],
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

form.addEventListener('submit', e => {
  e.preventDefault();
  const s = +document.getElementById('systolic').value;
  const d = +document.getElementById('diastolic').value;
  const p = +document.getElementById('pulse').value;
  const m = document.getElementById('mood').value;
  const date = new Date().toISOString().split('T')[0];
  const status = getStatus(s, d);
  const tip = getTips(status);
  feedbackBox.innerHTML = `<strong>Status:</strong> ${status}<br><strong>Tip:</strong> ${tip}`;
  readings.unshift({ date, systolic: s, diastolic: d, pulse: p, mood: m });
  localStorage.setItem('bpReadings', JSON.stringify(readings));
  renderTable();
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

renderTable();