let totalDistance = 0,
    lastPosition = null,
    watchId = null,
    autoSaveInterval = null,
    distanceLog = [],
    startTime = null,
    eightHourCheck = null;

// Convert degrees to radians
function toRad(x) {
  return x * Math.PI / 180;
}

// Compute distance between two GPS coordinates using Haversine formula
function computeDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Start GPS tracking
async function startTracking() {
  document.getElementById('status').innerText = "Tracking...";
  startTime = Date.now();

  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(pos => {
      if (lastPosition) {
        const dist = computeDistance(
          lastPosition.coords.latitude,
          lastPosition.coords.longitude,
          pos.coords.latitude,
          pos.coords.longitude
        );

        // Ignore small inaccurate movement
        if (dist > 2) {
          totalDistance += dist;
          document.getElementById('distance').innerText =
            "Distance: " + totalDistance.toFixed(2) + " meters";
          updateCalories();
        }
      }
      lastPosition = pos;
    }, err => {
      console.error("Geolocation error:", err);
    }, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000
    });
  }

  // Auto-save every 10 minutes
  autoSaveInterval = setInterval(() => {
    if (totalDistance > 0) {
      logDistance(totalDistance, false);
      totalDistance = 0;
    }
  }, 10 * 60 * 1000);

  // Stop tracking after 8 hours and auto-log
  eightHourCheck = setInterval(() => {
    if (!startTime) return;
    const elapsed = Date.now() - startTime;
    if (elapsed >= 8 * 60 * 60 * 1000) {
      if (totalDistance > 0) {
        logDistance(totalDistance);
        totalDistance = 0;
        alert("8 hours of tracking completed. Distance auto-logged.");
      }
      clearInterval(eightHourCheck);
    }
  }, 60 * 1000);
}

// Stop tracking and save final distance
function stopTracking() {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  clearInterval(autoSaveInterval);
  clearInterval(eightHourCheck);
  startTime = null;

  if (totalDistance > 0) {
    logDistance(totalDistance);
  }

  totalDistance = 0;
  lastPosition = null;
  document.getElementById('status').innerText = "Not tracking";
  document.getElementById('distance').innerText = "Distance: 0.00 meters";
  document.getElementById('calories').innerText = "Calories: 0.0";
}

// Add manual distance entry
function addManualEntry() {
  const value = parseFloat(document.getElementById('manualDistance').value);
  if (!isNaN(value) && value > 0) {
    logDistance(value);
    document.getElementById('manualDistance').value = "";
  }
}

// Estimate calories burned
function updateCalories() {
  const weight = 80; // Replace with dynamic user profile data if needed
  const MET = 2.5;
  const hours = (totalDistance / 1000) / 3.2;
  const cals = MET * weight * hours;
  document.getElementById('calories').innerText = "Calories: " + cals.toFixed(1);
}

// Save distance to Firestore
async function logDistance(dist, show = true) {
  const date = new Date().toISOString().split('T')[0];
  await db.collection("rollDistances").add({
    date,
    distance: parseFloat(dist.toFixed(2)),
    uid: currentUser?.uid || ""
  });
  if (show) loadLog();
}

// Load recent log from Firestore
async function loadLog() {
  const snapshot = await db.collection("rollDistances")
    .where("uid", "==", currentUser?.uid)
    .orderBy("date", "desc")
    .get();

  distanceLog = snapshot.docs.map(doc => doc.data());
  renderLog();
}

// Render data to table
function renderLog() {
  const tbody = document.getElementById('distanceLog');
  tbody.innerHTML = "";
  distanceLog.forEach(entry => {
    tbody.innerHTML += `<tr><td>${entry.date}</td><td>${entry.distance}</td></tr>`;
  });
}

// Wait for Firebase auth and load data
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadLog();
  } else {
    firebase.auth().signInAnonymously().catch(console.error);
  }
});
