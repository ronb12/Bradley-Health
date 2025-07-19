// Mood Tracking System
class MoodTracker {
  constructor() {
    this.db = firebase.firestore();
    this.currentUser = null;
    this.moodEntries = [];
    this.moodFactors = [];
    this.init();
  }

  init() {
    // Get current user from auth manager
    if (window.authManager) {
      this.currentUser = window.authManager.getCurrentUser();
      if (this.currentUser) {
        this.loadMoodEntries();
        this.loadMoodFactors();
      }
    }

    this.setupEventListeners();
    this.setupMoodChart();
    
    // Listen for authentication state changes
    this.setupAuthListener();
  }

  setupAuthListener() {
    // Listen for auth state changes
    firebase.auth().onAuthStateChanged((user) => {
      this.currentUser = user;
      if (user) {
        console.log('MoodTracker: User authenticated, loading data...');
        this.loadMoodEntries();
        this.loadMoodFactors();
      } else {
        console.log('MoodTracker: User signed out, clearing data...');
        this.moodEntries = [];
        this.moodFactors = [];
        this.renderMoodEntries();
        this.renderMoodFactors();
      }
    });
  }

  setupEventListeners() {
    // Add mood entry form
    const moodForm = document.getElementById('moodEntryForm');
    if (moodForm) {
      moodForm.addEventListener('submit', (e) => this.addMoodEntry(e));
    }

    // Quick mood buttons
    const quickMoodBtns = document.querySelectorAll('.mood-btn');
    quickMoodBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.quickMoodEntry(e));
    });

    // Mood factors form
    const factorsForm = document.getElementById('moodFactorsForm');
    if (factorsForm) {
      factorsForm.addEventListener('submit', (e) => this.addMoodFactor(e));
    }

    // Range input event listeners for real-time value updates
    this.setupRangeInputs();
  }

  setupRangeInputs() {
    // Mood level
    const moodLevel = document.getElementById('moodLevel');
    const moodValue = document.getElementById('moodValue');
    if (moodLevel && moodValue) {
      moodLevel.addEventListener('input', (e) => {
        moodValue.textContent = e.target.value;
      });
    }

    // Energy level
    const energyLevel = document.getElementById('energyLevel');
    const energyValue = document.getElementById('energyValue');
    if (energyLevel && energyValue) {
      energyLevel.addEventListener('input', (e) => {
        energyValue.textContent = e.target.value;
      });
    }

    // Stress level
    const stressLevel = document.getElementById('stressLevel');
    const stressValue = document.getElementById('stressValue');
    if (stressLevel && stressValue) {
      stressLevel.addEventListener('input', (e) => {
        stressValue.textContent = e.target.value;
      });
    }

    // Sleep level
    const sleepLevel = document.getElementById('sleepLevel');
    const sleepValue = document.getElementById('sleepValue');
    if (sleepLevel && sleepValue) {
      sleepLevel.addEventListener('input', (e) => {
        sleepValue.textContent = e.target.value;
      });
    }
  }

  async addMoodEntry(e) {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to save mood entries', 'error');
      return;
    }
    
    const formData = new FormData(e.target);
    
    const moodEntry = {
      mood: parseInt(formData.get('mood')),
      energy: parseInt(formData.get('energy')),
      stress: parseInt(formData.get('stress')),
      sleep: parseInt(formData.get('sleep')),
      activities: formData.getAll('activities'),
      notes: formData.get('notes'),
      factors: formData.getAll('factors'),
      timestamp: new Date(),
      userId: this.currentUser.uid
    };

    // Debug logging to verify all values are captured
    console.log('Mood entry data:', {
      mood: moodEntry.mood,
      energy: moodEntry.energy,
      stress: moodEntry.stress,
      sleep: moodEntry.sleep,
      notes: moodEntry.notes,
      timestamp: moodEntry.timestamp
    });

    try {
      this.showLoading('Saving mood entry...');
      await this.db.collection('moodEntries').add(moodEntry);
      this.showToast('Mood entry saved successfully!', 'success');
      this.loadMoodEntries();
      e.target.reset();
    } catch (error) {
      console.error('Error saving mood entry:', error);
      this.showToast('Error saving mood entry', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async quickMoodEntry(e) {
    // Check if user is authenticated
    if (!this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to save mood entries', 'error');
      return;
    }
    
    // Remove previous selection
    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    // Add selection to clicked button
    e.target.classList.add('selected');
    
    const mood = parseInt(e.target.dataset.mood);
    const moodEntry = {
      mood,
      energy: 5,
      stress: 5,
      sleep: 5,
      activities: [],
      notes: 'Quick mood entry',
      factors: [],
      timestamp: new Date(),
      userId: this.currentUser.uid
    };

    try {
      this.showLoading('Saving mood...');
      await this.db.collection('moodEntries').add(moodEntry);
      this.showToast('Mood saved!', 'success');
      this.loadMoodEntries();
      
      // Remove selection after a short delay
      setTimeout(() => {
        e.target.classList.remove('selected');
      }, 2000);
    } catch (error) {
      this.showToast('Error saving mood entry', 'error');
      e.target.classList.remove('selected');
    } finally {
      this.hideLoading();
    }
  }

  async loadMoodEntries() {
    try {
      // Check if user is authenticated
      if (!this.currentUser || !this.currentUser.uid) {
        console.log('User not authenticated yet, skipping mood entries load');
        return;
      }

      const snapshot = await this.db
        .collection('moodEntries')
        .where('userId', '==', this.currentUser.uid)
        .orderBy('timestamp', 'desc')
        .limit(30)
        .get();

      this.moodEntries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.renderMoodEntries();
      this.updateMoodChart();
      this.calculateMoodStats();
    } catch (error) {
      console.error('Error loading mood entries:', error);
    }
  }

  renderMoodEntries() {
    const moodList = document.getElementById('moodEntriesList');
    if (!moodList) return;

    if (this.moodEntries.length === 0) {
      moodList.innerHTML = '<p class="no-data">No mood entries yet. Start tracking your mood!</p>';
      return;
    }

    moodList.innerHTML = this.moodEntries.map(entry => {
      // Handle different timestamp formats (Firestore Timestamp vs JavaScript Date)
      let timestamp;
      if (entry.timestamp && entry.timestamp.toDate) {
        // Firestore Timestamp
        timestamp = entry.timestamp.toDate();
      } else if (entry.timestamp) {
        // JavaScript Date or timestamp number
        timestamp = new Date(entry.timestamp);
      } else {
        // Fallback to current time
        timestamp = new Date();
      }

      // Validate the timestamp
      if (isNaN(timestamp.getTime())) {
        console.warn('Invalid timestamp for mood entry:', entry.id, entry.timestamp);
        timestamp = new Date(); // Fallback to current time
      }

      return `
        <div class="mood-entry-item" data-id="${entry.id}">
          <div class="mood-header">
            <div class="mood-score">
              <span class="mood-emoji">${this.getMoodEmoji(entry.mood)}</span>
              <span class="mood-value">${entry.mood}/10</span>
            </div>
            <div class="mood-date">
              ${timestamp.toLocaleDateString()}
            </div>
          </div>
          <div class="mood-metrics">
            <div class="metric">
              <span class="metric-label">Energy:</span>
              <span class="metric-value">${entry.energy}/10</span>
            </div>
            <div class="metric">
              <span class="metric-label">Stress:</span>
              <span class="metric-value">${entry.stress}/10</span>
            </div>
            <div class="metric">
              <span class="metric-label">Sleep:</span>
              <span class="metric-value">${entry.sleep}/10</span>
            </div>
          </div>
          ${entry.activities.length > 0 ? `
            <div class="mood-activities">
              <strong>Activities:</strong> ${entry.activities.join(', ')}
            </div>
          ` : ''}
          ${entry.notes ? `
            <div class="mood-notes">
              <strong>Notes:</strong> ${entry.notes}
            </div>
          ` : ''}
          <div class="mood-actions">
            <button class="btn btn-small" onclick="moodTracker.editMoodEntry('${entry.id}')">Edit</button>
            <button class="btn btn-small btn-danger" onclick="moodTracker.deleteMoodEntry('${entry.id}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }

  getMoodEmoji(mood) {
    if (mood >= 8) return '😊';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    if (mood >= 2) return '😔';
    return '😢';
  }

  setupMoodChart() {
    const chartCanvas = document.getElementById('moodChart');
    if (!chartCanvas) return;

    this.moodChart = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Mood',
          data: [],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4
        }, {
          label: 'Energy',
          data: [],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        }, {
          label: 'Stress',
          data: [],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 10
          }
        },
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }

  updateMoodChart() {
    if (!this.moodChart) return;

    const recentEntries = this.moodEntries.slice(0, 7).reverse();
    
    this.moodChart.data.labels = recentEntries.map(entry => {
      // Handle different timestamp formats (Firestore Timestamp vs JavaScript Date)
      let timestamp;
      if (entry.timestamp && entry.timestamp.toDate) {
        // Firestore Timestamp
        timestamp = entry.timestamp.toDate();
      } else if (entry.timestamp) {
        // JavaScript Date or timestamp number
        timestamp = new Date(entry.timestamp);
      } else {
        // Fallback to current time
        timestamp = new Date();
      }

      // Validate the timestamp
      if (isNaN(timestamp.getTime())) {
        console.warn('Invalid timestamp for mood chart entry:', entry.id, entry.timestamp);
        timestamp = new Date(); // Fallback to current time
      }

      return timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    this.moodChart.data.datasets[0].data = recentEntries.map(entry => entry.mood);
    this.moodChart.data.datasets[1].data = recentEntries.map(entry => entry.energy);
    this.moodChart.data.datasets[2].data = recentEntries.map(entry => entry.stress);
    
    this.moodChart.update();
  }

  calculateMoodStats() {
    if (this.moodEntries.length === 0) return;

    const recentEntries = this.moodEntries.slice(0, 7);
    const avgMood = recentEntries.reduce((sum, entry) => sum + entry.mood, 0) / recentEntries.length;
    const avgEnergy = recentEntries.reduce((sum, entry) => sum + entry.energy, 0) / recentEntries.length;
    const avgStress = recentEntries.reduce((sum, entry) => sum + entry.stress, 0) / recentEntries.length;

    // Update stats display
    const moodAvg = document.getElementById('moodAverage');
    const energyAvg = document.getElementById('energyAverage');
    const stressAvg = document.getElementById('stressAverage');

    if (moodAvg) moodAvg.textContent = avgMood.toFixed(1);
    if (energyAvg) energyAvg.textContent = energyAvg.toFixed(1);
    if (stressAvg) stressAvg.textContent = stressAvg.toFixed(1);

    // Generate insights
    this.generateMoodInsights(avgMood, avgEnergy, avgStress);
  }

  generateMoodInsights(avgMood, avgEnergy, avgStress) {
    const insightsContainer = document.getElementById('moodInsights');
    if (!insightsContainer) return;

    const insights = [];

    if (avgMood >= 7) {
      insights.push('Your mood has been positive lately. Keep up the great work!');
    } else if (avgMood <= 4) {
      insights.push('Your mood has been low. Consider talking to someone or seeking support.');
    }

    if (avgEnergy <= 4) {
      insights.push('Your energy levels are low. Try to get more sleep or exercise.');
    }

    if (avgStress >= 7) {
      insights.push('Your stress levels are high. Consider stress management techniques.');
    }

    if (insights.length === 0) {
      insights.push('Your mood patterns are stable. Continue monitoring for any changes.');
    }

    insightsContainer.innerHTML = insights.map(insight => 
      `<div class="insight-item">${insight}</div>`
    ).join('');
  }

  async deleteMoodEntry(entryId) {
    if (!confirm('Are you sure you want to delete this mood entry?')) return;

    try {
      this.showLoading('Deleting mood entry...');
      await this.db.collection('moodEntries').doc(entryId).delete();
      this.showToast('Mood entry deleted successfully!', 'success');
      this.loadMoodEntries();
    } catch (error) {
      this.showToast('Error deleting mood entry', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async editMoodEntry(entryId) {
    const entry = this.moodEntries.find(e => e.id === entryId);
    if (!entry) return;

    // Populate edit form
    const form = document.getElementById('editMoodEntryForm');
    if (form) {
      form.querySelector('[name="mood"]').value = entry.mood;
      form.querySelector('[name="energy"]').value = entry.energy;
      form.querySelector('[name="stress"]').value = entry.stress;
      form.querySelector('[name="sleep"]').value = entry.sleep;
      form.querySelector('[name="notes"]').value = entry.notes || '';

      // Set activities
      entry.activities.forEach(activity => {
        const checkbox = form.querySelector(`[name="activities"][value="${activity}"]`);
        if (checkbox) checkbox.checked = true;
      });

      // Set factors
      entry.factors.forEach(factor => {
        const checkbox = form.querySelector(`[name="factors"][value="${factor}"]`);
        if (checkbox) checkbox.checked = true;
      });

      // Show edit modal
      const modal = document.getElementById('editMoodEntryModal');
      if (modal) modal.style.display = 'block';
    }
  }

  async updateMoodEntry(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const entryId = formData.get('entryId');
    
    const updateData = {
      mood: parseInt(formData.get('mood')),
      energy: parseInt(formData.get('energy')),
      stress: parseInt(formData.get('stress')),
      sleep: parseInt(formData.get('sleep')),
      activities: formData.getAll('activities'),
      notes: formData.get('notes'),
      factors: formData.getAll('factors'),
      updatedAt: new Date()
    };

    try {
      this.showLoading('Updating mood entry...');
      await this.db.collection('moodEntries').doc(entryId).update(updateData);
      this.showToast('Mood entry updated successfully!', 'success');
      this.loadMoodEntries();
      this.closeEditModal();
    } catch (error) {
      this.showToast('Error updating mood entry', 'error');
    } finally {
      this.hideLoading();
    }
  }

  closeEditModal() {
    const modal = document.getElementById('editMoodEntryModal');
    if (modal) modal.style.display = 'none';
  }

  async addMoodFactor(e) {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to save mood factors', 'error');
      return;
    }
    
    const formData = new FormData(e.target);
    
    const factor = {
      name: formData.get('name'),
      category: formData.get('category'),
      impact: formData.get('impact'),
      description: formData.get('description'),
      createdAt: new Date(),
      userId: this.currentUser.uid
    };

    try {
      this.showLoading('Adding mood factor...');
      await this.db.collection('moodFactors').add(factor);
      this.showToast('Mood factor added successfully!', 'success');
      this.loadMoodFactors();
      e.target.reset();
    } catch (error) {
      this.showToast('Error adding mood factor', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async loadMoodFactors() {
    try {
      // Check if user is authenticated
      if (!this.currentUser || !this.currentUser.uid) {
        console.log('User not authenticated yet, skipping mood factors load');
        return;
      }
      
      const snapshot = await this.db
        .collection('moodFactors')
        .where('userId', '==', this.currentUser.uid)
        .get();

      this.moodFactors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        // Sort by createdAt in descending order (newest first)
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });

      this.renderMoodFactors();
    } catch (error) {
      console.error('Error loading mood factors:', error);
    }
  }

  renderMoodFactors() {
    const factorsList = document.getElementById('moodFactorsList');
    if (!factorsList) return;

    if (this.moodFactors.length === 0) {
      factorsList.innerHTML = '<p class="no-data">No mood factors added yet.</p>';
      return;
    }

    factorsList.innerHTML = this.moodFactors.map(factor => `
      <div class="mood-factor-item" data-id="${factor.id}">
        <div class="factor-header">
          <h4>${factor.name}</h4>
          <span class="factor-category">${factor.category}</span>
        </div>
        <div class="factor-impact">
          <span class="impact-label">Impact:</span>
          <span class="impact-value ${factor.impact}">${factor.impact}</span>
        </div>
        ${factor.description ? `<p class="factor-description">${factor.description}</p>` : ''}
        <div class="factor-actions">
          <button class="btn btn-small btn-danger" onclick="moodTracker.deleteMoodFactor('${factor.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  }

  async deleteMoodFactor(factorId) {
    if (!confirm('Are you sure you want to delete this mood factor?')) return;

    try {
      this.showLoading('Deleting mood factor...');
      await this.db.collection('moodFactors').doc(factorId).delete();
      this.showToast('Mood factor deleted successfully!', 'success');
      this.loadMoodFactors();
    } catch (error) {
      this.showToast('Error deleting mood factor', 'error');
    } finally {
      this.hideLoading();
    }
  }

  showLoading(message) {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.textContent = message;
      loadingEl.style.display = 'block';
    }
  }

  hideLoading() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
  }

  showToast(message, type = 'info') {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}

// Initialize mood tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.moodTracker = new MoodTracker();
}); 