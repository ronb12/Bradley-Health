// Constants
const HEALTH_SCORE_WEIGHTS = {
    bloodPressure: 0.4,
    medicationAdherence: 0.4,
    mood: 0.2
};

// Initialize insights database
async function initInsightsDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('insightsDB', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores
            if (!db.objectStoreNames.contains('healthScore')) {
                db.createObjectStore('healthScore', { keyPath: 'date' });
            }
            if (!db.objectStoreNames.contains('correlations')) {
                db.createObjectStore('correlations', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('recommendations')) {
                db.createObjectStore('recommendations', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// Calculate overall health score
async function calculateHealthScore() {
    const bpScore = await calculateBPScore();
    const medicationScore = await calculateMedicationScore();
    const moodScore = await calculateMoodScore();

    const overallScore = Math.round(
        bpScore * HEALTH_SCORE_WEIGHTS.bloodPressure +
        medicationScore * HEALTH_SCORE_WEIGHTS.medicationAdherence +
        moodScore * HEALTH_SCORE_WEIGHTS.mood
    );

    // Save score to database
    const db = await initInsightsDB();
    const transaction = db.transaction(['healthScore'], 'readwrite');
    const store = transaction.objectStore('healthScore');

    await store.put({
        date: new Date().toISOString().split('T')[0],
        score: overallScore,
        components: {
            bloodPressure: bpScore,
            medicationAdherence: medicationScore,
            mood: moodScore
        }
    });

    return overallScore;
}

// Calculate blood pressure score
async function calculateBPScore() {
    const readings = await getBPReadings('week');
    if (!readings.length) return 0;

    let score = 0;
    readings.forEach(reading => {
        const systolic = reading.systolic;
        const diastolic = reading.diastolic;

        // Score based on normal ranges
        if (systolic >= 90 && systolic <= 120 && diastolic >= 60 && diastolic <= 80) {
            score += 100;
        } else if (systolic >= 120 && systolic <= 140 && diastolic >= 80 && diastolic <= 90) {
            score += 80;
        } else {
            score += 60;
        }
    });

    return Math.round(score / readings.length);
}

// Calculate medication adherence score
async function calculateMedicationScore() {
    const medications = await getMedications('week');
    if (!medications.length) return 0;

    let totalDoses = 0;
    let takenDoses = 0;

    medications.forEach(med => {
        if (med.status === 'TAKEN') takenDoses++;
        totalDoses++;
    });

    return totalDoses ? Math.round((takenDoses / totalDoses) * 100) : 0;
}

// Calculate mood score
async function calculateMoodScore() {
    const moods = await getMoodEntries('week');
    if (!moods.length) return 0;

    let totalScore = 0;
    moods.forEach(mood => {
        totalScore += mood.level;
    });

    return Math.round((totalScore / (moods.length * 5)) * 100);
}

// Update health score display
async function updateHealthScoreDisplay() {
    const score = await calculateHealthScore();
    const scoreValue = document.querySelector('.score-value');
    const scoreLabel = document.querySelector('.score-label');
    const factorBars = document.querySelectorAll('.factor-progress');

    scoreValue.textContent = score;
    scoreLabel.textContent = getScoreLabel(score);

    // Update factor bars
    const components = await getLatestHealthScore();
    if (components) {
        factorBars[0].style.width = `${components.bloodPressure}%`;
        factorBars[1].style.width = `${components.medicationAdherence}%`;
        factorBars[2].style.width = `${components.mood}%`;
    }
}

// Get score label
function getScoreLabel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Needs Attention';
}

// Update trends
async function updateTrends(timeRange) {
    const bpReadings = await getBPReadings(timeRange);
    const moodEntries = await getMoodEntries(timeRange);

    // Update BP trend chart
    const bpCtx = document.getElementById('bpTrendChart').getContext('2d');
    new Chart(bpCtx, {
        type: 'line',
        data: {
            labels: bpReadings.map(r => new Date(r.timestamp).toLocaleDateString()),
            datasets: [{
                label: 'Systolic',
                data: bpReadings.map(r => r.systolic),
                borderColor: '#2B6CB0',
                tension: 0.4
            }, {
                label: 'Diastolic',
                data: bpReadings.map(r => r.diastolic),
                borderColor: '#4299E1',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Update mood trend chart
    const moodCtx = document.getElementById('moodTrendChart').getContext('2d');
    new Chart(moodCtx, {
        type: 'line',
        data: {
            labels: moodEntries.map(m => new Date(m.timestamp).toLocaleDateString()),
            datasets: [{
                label: 'Mood Level',
                data: moodEntries.map(m => m.level),
                borderColor: '#48BB78',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update correlations
async function updateCorrelations() {
    const bpReadings = await getBPReadings('month');
    const moodEntries = await getMoodEntries('month');
    const medications = await getMedications('month');

    // BP vs Mood correlation
    const bpMoodCtx = document.getElementById('bpMoodCorrelationChart').getContext('2d');
    new Chart(bpMoodCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'BP vs Mood',
                data: bpReadings.map((bp, i) => ({
                    x: bp.systolic,
                    y: moodEntries[i]?.level || 0
                })),
                backgroundColor: '#2B6CB0'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Medication vs BP correlation
    const medBpCtx = document.getElementById('medBpCorrelationChart').getContext('2d');
    new Chart(medBpCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Medication vs BP',
                data: medications.map((med, i) => ({
                    x: med.status === 'TAKEN' ? 1 : 0,
                    y: bpReadings[i]?.systolic || 0
                })),
                backgroundColor: '#48BB78'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Generate recommendations
async function generateRecommendations() {
    const score = await calculateHealthScore();
    const components = await getLatestHealthScore();
    const recommendations = [];

    if (components.bloodPressure < 80) {
        recommendations.push({
            icon: '🎯',
            title: 'Morning Exercise',
            text: 'Consider light exercise in the morning to help maintain lower blood pressure throughout the day.'
        });
    }

    if (components.medicationAdherence < 90) {
        recommendations.push({
            icon: '⏰',
            title: 'Medication Reminders',
            text: 'Set up additional reminders to improve medication adherence.'
        });
    }

    if (components.mood < 70) {
        recommendations.push({
            icon: '🧘',
            title: 'Stress Management',
            text: 'Practice mindfulness exercises to help manage stress levels.'
        });
    }

    return recommendations;
}

// Initialize display
async function initDisplay() {
    await updateHealthScoreDisplay();
    await updateTrends('week');
    await updateCorrelations();
    
    const recommendations = await generateRecommendations();
    const recommendationsList = document.querySelector('.recommendations-list');
    recommendationsList.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <div class="recommendation-icon">${rec.icon}</div>
            <div class="recommendation-content">
                <h3>${rec.title}</h3>
                <p>${rec.text}</p>
            </div>
        </div>
    `).join('');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initDisplay();

    // Update trends when time range changes
    document.getElementById('trendTimeRange').addEventListener('change', (e) => {
        updateTrends(e.target.value);
    });
});

// Helper function to get latest health score
async function getLatestHealthScore() {
    const db = await initInsightsDB();
    const transaction = db.transaction(['healthScore'], 'readonly');
    const store = transaction.objectStore('healthScore');
    const request = store.openCursor(null, 'prev');

    return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                resolve(cursor.value.components);
            } else {
                resolve(null);
            }
        };
        request.onerror = () => reject(request.error);
    });
} 