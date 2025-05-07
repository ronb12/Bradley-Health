const form = document.getElementById('bpForm');
const historyTable = document.querySelector('#historyTable tbody');
const feedbackBox = document.getElementById('feedbackBox');

let readings = [];

// Load readings for this user
async function loadBP() {
  if (!currentUser) return;
  const snapshot = await db.collection("bpReadings")
    .where("uid", "==", currentUser.uid)
    .orderBy("date", "desc")
    .get();

  readings = snapshot.docs.map(doc => doc.data());
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
    Normal: ["Keep up the healthy lifestyle!"],
    Elevated: ["Consider reducing salt intake and increasing activity."],
    Stage1: ["Monitor regularly and consider seeing a provider."],
    Stage2: ["High BP detected — consult a doctor."],
    Crisis: ["Immediate medical attention is needed!"]
  };
  return tips[status][0];
}

function renderTable() {
  historyTable.innerHTML = "";
  readings.forEach(r => {
    const status = getStatus(r.systolic, r.diastolic);
    const row = `<tr>
      <td>${r.date}</td>
      <td>${r.systolic}/${r.diastolic}</td>
      <td>${r.pulse}</td>
      <td>${status}</td>
      <td>${r.mood}</td>
    </tr>`;
    historyTable.innerHTML += row;
  });
  updateChart();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const systolic = +document.getElementById('systolic').value;
  const diastolic = +document.getElementById('diastolic').value;
  const pulse = +document.getElementById('pulse').value;
  const mood = document.getElementById('mood').value;
  const date = new Date().toISOString().split('T')[0];
  const uid = currentUser?.uid;

  if (!uid) {
    alert("User not authenticated. Please refresh.");
    return;
  }

  const status = getStatus(systolic, diastolic);
  const tip = getTips(status);

  feedbackBox.innerHTML = `<strong>Status:</strong> ${status}<br><em>${tip}</em>`;
  feedbackBox.style.display = "block";

  await db.collection("bpReadings").add({
    date, systolic, diastolic, pulse, mood, uid
  });

  form.reset();
  loadBP();
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
    },
    options: { responsive: true }
  });
}

// Wait for auth before loading data
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadBP();
  }
});
