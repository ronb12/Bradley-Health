const form = document.getElementById('bpForm');
const historyTable = document.querySelector('#historyTable tbody');
const feedbackBox = document.getElementById('feedbackBox');

let readings = [];

// Load readings for this user
async function loadBP() {
  if (!currentUser) return;
  const snapshot = await db.collection("bpReadings")
    .where("uid", "==", currentUser.uid)
    .orderBy("timestamp", "desc")
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
    Elevated: ["Cut down on sodium and reduce stress."],
    Stage1: ["Monitor regularly and improve your routine."],
    Stage2: ["Consult a doctor about treatment options."],
    Crisis: ["Seek emergency medical care now!"]
  };
  return tips[status][0];
}

function renderTable() {
  historyTable.innerHTML = "";
  readings.forEach(r => {
    const status = getStatus(r.systolic, r.diastolic);
    const displayTime = new Date(r.timestamp).toLocaleString();
    const row = `<tr>
      <td>${displayTime}</td>
      <td>${r.systolic}/${r.diastolic}</td>
      <td>${r.pulse || "-"}</td>
      <td>${status}</td>
      <td>${r.mood || ""}</td>
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
  const uid = currentUser?.uid;

  if (!uid || isNaN(systolic) || isNaN(diastolic)) {
    alert("Please enter valid readings and ensure you are signed in.");
    return;
  }

  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timestamp = now.toISOString();          // Full ISO datetime

  const status = getStatus(systolic, diastolic);
  const tip = getTips(status);

  feedbackBox.innerHTML = `<strong>Status:</strong> ${status}<br><em>${tip}</em>`;
  feedbackBox.style.display = "block";

  await db.collection("bpReadings").add({
    date,
    timestamp,
    systolic,
    diastolic,
    pulse,
    mood,
    uid
  });

  form.reset();
  loadBP();
});

function updateChart() {
  const labels = readings.map(r => new Date(r.timestamp).toLocaleDateString()).reverse();
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
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

// Firebase auth state listener
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadBP();
  }
});
