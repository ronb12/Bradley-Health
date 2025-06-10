// Health Insights & Analytics

// Initialize Insights Database
async function initInsightsDB() {
    const db = await openDB('insightsDB', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('healthScore')) {
                const store = db.createObjectStore('healthScore', { keyPath: 'id' });
                store.createIndex('date', 'date', { unique: true });
            }
            if (!db.objectStoreNames.contains('correlations')) {
                const store = db.createObjectStore('correlations', { keyPath: 'id', autoIncrement: true });
                store.createIndex('type', 'type', { unique: false });
            }
            if (!db.objectStoreNames.contains('recommendations')) {
                const store = db.createObjectStore('recommendations', { keyPath: 'id', autoIncrement: true });
                store.createIndex('category', 'category', { unique: false });
            }
        }
    });
    return db;
}

// Calculate Health Score
async function calculateHealthScore() {
    const bpReadings = await getBPReadings('week');
    const moodEntries = await getMoodEntries('week');
    const medications = await getMedications('week');

    // Calculate individual scores
    const bpScore = calculateBPScore(bpReadings);
    const moodScore = calculateMoodScore(moodEntries);
    const medScore = calculateMedicationScore(medications);

    // Calculate overall score
    const overallScore = Math.round((bpScore + moodScore + medScore) / 3);

    // Save score
    const db = await initInsightsDB();
    const tx = db.transaction('healthScore', 'readwrite');
    const store = tx.objectStore('healthScore');
    
    await store.put({
        id: 'current',
        date: new Date(),
        overall: overallScore,
        components: {
            bloodPressure: bpScore,
            mood: moodScore,
            medication: medScore
        }
    });

    return {
        overall: overallScore,
        components: {
            bloodPressure: bpScore,
            mood: moodScore,
            medication: medScore
        }
    };
}

// Calculate BP Score
function calculateBPScore(readings) {
    if (!readings.length) return 0;
    
    let normalReadings = 0;
    readings.forEach(reading => {
        if (reading.status === 'Normal') normalReadings++;
    });
    
    return Math.round((normalReadings / readings.length) * 100);
}

// Calculate Mood Score
function calculateMoodScore(entries) {
    if (!entries.length) return 0;
    
    const moodValues = {
        'Great': 100,
        'Good': 80,
        'Okay': 60,
        'Poor': 40,
        'Bad': 20
    };
    
    const totalScore = entries.reduce((sum, entry) => sum + (moodValues[entry.moodLevel] || 0), 0);
    return Math.round(totalScore / entries.length);
}

// Calculate Medication Score
function calculateMedicationScore(medications) {
    if (!medications.length) return 0;
    
    let takenCount = 0;
    medications.forEach(med => {
        if (med.status === 'TAKEN') takenCount++;
    });
    
    return Math.round((takenCount / medications.length) * 100);
}

// Update Health Score Display
async function updateHealthScoreDisplay() {
    const score = await calculateHealthScore();
    
    document.querySelector('.score-value').textContent = score.overall;
    document.querySelector('.score-label').textContent = getScoreLabel(score.overall);
    
    // Update factor bars
    const factors = document.querySelectorAll('.score-factor');
    factors.forEach(factor => {
        const label = factor.querySelector('.factor-label').textContent.toLowerCase();
        const progress = factor.querySelector('.factor-progress');
        
        switch (label) {
            case 'blood pressure':
                progress.style.width = `${score.components.bloodPressure}%`;
                break;
            case 'medication adherence':
                progress.style.width = `${score.components.medication}%`;
                break;
            case 'mood':
                progress.style.width = `${score.components.mood}%`;
                break;
        }
    });
}

// Get Score Label
function getScoreLabel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Needs Attention';
}

// Update Trends
async function updateTrends(timeRange = 'week') {
    const bpReadings = await getBPReadings(timeRange);
    const moodEntries = await getMoodEntries(timeRange);
    
    // Update BP Trend Chart
    const bpCtx = document.getElementById('bpTrendChart').getContext('2d');
    new Chart(bpCtx, {
        type: 'line',
        data: {
            labels: bpReadings.map(r => formatDate(r.timestamp)),
            datasets: [{
                label: 'Systolic',
                data: bpReadings.map(r => r.systolic),
                borderColor: '#2B6CB0',
                tension: 0.4
            }, {
                label: 'Diastolic',
                data: bpReadings.map(r => r.diastolic),
                borderColor: '#38A169',
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
    
    // Update Mood Trend Chart
    const moodCtx = document.getElementById('moodTrendChart').getContext('2d');
    new Chart(moodCtx, {
        type: 'line',
        data: {
            labels: moodEntries.map(e => formatDate(e.timestamp)),
            datasets: [{
                label: 'Mood',
                data: moodEntries.map(e => e.moodLevel),
                borderColor: '#ED8936',
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

// Update Correlations
async function updateCorrelations() {
    const bpReadings = await getBPReadings('month');
    const moodEntries = await getMoodEntries('month');
    const medications = await getMedications('month');
    
    // BP vs Mood Correlation
    const bpMoodCtx = document.getElementById('bpMoodCorrelationChart').getContext('2d');
    new Chart(bpMoodCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'BP vs Mood',
                data: bpReadings.map((bp, i) => ({
                    x: bp.systolic,
                    y: moodEntries[i]?.moodLevel || 0
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
    
    // Medication vs BP Correlation
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
                backgroundColor: '#38A169'
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

// Generate Recommendations
async function generateRecommendations() {
    const score = await calculateHealthScore();
    const bpReadings = await getBPReadings('week');
    const moodEntries = await getMoodEntries('week');
    
    const recommendations = [];
    
    // BP-based recommendations
    if (score.components.bloodPressure < 80) {
        recommendations.push({
            icon: '🎯',
            title: 'Morning Exercise',
            text: 'Consider light exercise in the morning to help maintain lower blood pressure throughout the day.'
        });
    }
    
    // Mood-based recommendations
    if (score.components.mood < 70) {
        recommendations.push({
            icon: '🧘',
            title: 'Stress Management',
            text: 'Practice mindfulness exercises to help manage stress levels.'
        });
    }
    
    // General recommendations
    recommendations.push({
        icon: '💧',
        title: 'Hydration',
        text: 'Increase water intake to help maintain optimal blood pressure levels.'
    });
    
    // Update recommendations display
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateHealthScoreDisplay();
    updateTrends();
    updateCorrelations();
    generateRecommendations();
    
    // Handle time range changes
    document.getElementById('trendTimeRange').addEventListener('change', (e) => {
        updateTrends(e.target.value);
    });
    
    // Refresh data every hour
    setInterval(() => {
        updateHealthScoreDisplay();
        updateTrends();
        updateCorrelations();
        generateRecommendations();
    }, 3600000);
}); 