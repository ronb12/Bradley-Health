let totalDistance = 0, lastPosition = null, watchId = null;
let autoSaveInterval = null;
let distanceLog = [];

function toRad(x) { return x * Math.PI / 180; }

function computeDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function startTracking() {
  document.getElementById('status').innerText = "Tracking...";
  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(pos => {
      if (lastPosition) {
        const dist = computeDistance(lastPosition.coords.latitude, lastPosition.coords.longitude, pos.coords.latitude, pos.coords.longitude);
        totalDistance += dist;
        document.getElementById('distance').innerText = "Distance: " + totalDistance.toFixed(2) + " meters";
        updateCalories();
      }
      lastPosition = pos;
    });
  }
  autoSaveInterval = setInterval(() => {
    if (totalDistance > 0) {
      logDistance(totalDistance, false);
      totalDistance = 0;
    }
  }, 10000);
}

function stopTracking() {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  clearInterval(autoSaveInterval);
  if (totalDistance > 0) logDistance(totalDistance);
  totalDistance = 0;
  lastPosition = null;
  document.getElementById('status').innerText = "Not tracking";
  document.getElementById('distance').innerText = "Distance: 0.00 meters";
  document.getElementById('calories').innerText = "Calories: 0.0";
}

function addManualEntry() {
  const value = parseFloat(document.getElementById('manualDistance').value);
  if (!isNaN(value) && value > 0) {
    logDistance(value);
    document.getElementById('manualDistance').value = "";
  }
}

function updateCalories() {
  const weight = 80, MET = 2.5;
  const hours = (totalDistance / 1000) / 3.2;
  const cals = MET * weight * hours;
  document.getElementById('calories').innerText = "Calories: " + cals.toFixed(1);
}

async function logDistance(dist, show = true) {
  const date = new Date().toISOString().split('T')[0];
  await db.collection("rollDistances").add({ date, distance: dist.toFixed(2) });
  if (show) loadLog();
}

async function loadLog() {
  const snapshot = await db.collection("rollDistances").orderBy("date", "desc").get();
  distanceLog = [];
  snapshot.forEach(doc => distanceLog.push(doc.data()));
  renderLog();
}

function renderLog() {
  const tbody = document.getElementById('distanceLog');
  tbody.innerHTML = "";
  distanceLog.forEach(entry => {
    tbody.innerHTML += `<tr><td>${entry.date}</td><td>${entry.distance}</td></tr>`;
  });
}

loadLog();
