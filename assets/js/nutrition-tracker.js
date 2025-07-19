// Nutrition Tracking System with Cholesterol Monitoring
class NutritionTracker {
  constructor() {
    // Wait for Firebase to be ready
    if (window.firebaseServices && window.firebaseServices.db) {
      this.db = window.firebaseServices.db;
      this.currentUser = null;
      this.meals = [];
      this.cholesterolEntries = [];
      this.init();
    } else {
      // Retry after a short delay
      setTimeout(() => {
        if (window.firebaseServices && window.firebaseServices.db) {
          this.db = window.firebaseServices.db;
          this.currentUser = null;
          this.meals = [];
          this.cholesterolEntries = [];
          this.init();
        } else {
          console.error('Firebase not available for nutrition tracker');
        }
      }, 1000);
    }
  }

  init() {
    // Wait for authentication
    if (window.authManager) {
      window.authManager.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        if (user) {
          console.log('Nutrition Tracker: User authenticated, loading data');
          this.loadNutritionData();
          this.setupEventListeners();
        } else {
          console.log('Nutrition Tracker: User signed out, clearing data...');
          this.meals = [];
          this.cholesterolEntries = [];
          this.renderMealHistory();
          this.renderCholesterolHistory();
        }
      });
    }
  }

  setupEventListeners() {
    // Add meal form
    const addMealForm = document.getElementById('addMealForm');
    if (addMealForm) {
      addMealForm.addEventListener('submit', (e) => this.addMeal(e));
    }

    // Cholesterol form
    const cholesterolForm = document.getElementById('cholesterolForm');
    if (cholesterolForm) {
      cholesterolForm.addEventListener('submit', (e) => this.addCholesterolEntry(e));
    }

    // Set default date and time
    this.setDefaultDateTime();
  }

  setDefaultDateTime() {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);

    // Set default date for meal form
    const mealDate = document.getElementById('mealDate');
    if (mealDate) {
      mealDate.value = today;
    }

    const mealTime = document.getElementById('mealTime');
    if (mealTime) {
      mealTime.value = currentTime;
    }

    // Set default date for cholesterol form
    const cholesterolDate = document.getElementById('cholesterolDate');
    if (cholesterolDate) {
      cholesterolDate.value = today;
    }

    const cholesterolTime = document.getElementById('cholesterolTime');
    if (cholesterolTime) {
      cholesterolTime.value = currentTime;
    }
  }

  async loadNutritionData() {
    if (!this.currentUser) return;

    try {
      console.log('Nutrition Tracker: Loading nutrition data');
      
      // Load meals
      const mealsSnapshot = await this.db.collection('meals')
        .where('userId', '==', this.currentUser.uid)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

      this.meals = mealsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load cholesterol entries
      const cholesterolSnapshot = await this.db.collection('cholesterolEntries')
        .where('userId', '==', this.currentUser.uid)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

      this.cholesterolEntries = cholesterolSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('Nutrition Tracker: Loaded', this.meals.length, 'meals and', this.cholesterolEntries.length, 'cholesterol entries');

      this.renderMealHistory();
      this.renderCholesterolHistory();
      this.updateNutritionOverview();

    } catch (error) {
      console.error('Error loading nutrition data:', error);
      this.showToast('Error loading nutrition data', 'error');
    }
  }

  async addMeal(e) {
    e.preventDefault();
    
    if (!this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to save meals', 'error');
      return;
    }

    const formData = new FormData(e.target);
    
    // Create timestamp from date and time
    const date = formData.get('date');
    const time = formData.get('time');
    const timestamp = new Date(`${date}T${time}`);

    const meal = {
      name: formData.get('name'),
      type: formData.get('type'),
      date: date,
      time: time,
      notes: formData.get('notes'),
      timestamp: timestamp,
      userId: this.currentUser.uid
    };

    try {
      await this.db.collection('meals').add(meal);
      this.showToast('Meal logged successfully', 'success');
      e.target.reset();
      this.setDefaultDateTime();
      this.loadNutritionData();
    } catch (error) {
      console.error('Error saving meal:', error);
      this.showToast('Error saving meal', 'error');
    }
  }

  async addCholesterolEntry(e) {
    e.preventDefault();
    
    if (!this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to log cholesterol', 'error');
      return;
    }

    const formData = new FormData(e.target);
    
    // Create timestamp from date and time
    const date = formData.get('date');
    const time = formData.get('time');
    const timestamp = new Date(`${date}T${time}`);

    const cholesterolValue = parseFloat(formData.get('value'));
    const status = this.getCholesterolStatus(cholesterolValue);

    const cholesterolEntry = {
      value: cholesterolValue,
      date: date,
      time: time,
      notes: formData.get('notes'),
      status: status,
      timestamp: timestamp,
      userId: this.currentUser.uid
    };

    try {
      await this.db.collection('cholesterolEntries').add(cholesterolEntry);
      this.showToast('Cholesterol level logged successfully', 'success');
      e.target.reset();
      this.setDefaultDateTime();
      this.loadNutritionData();
    } catch (error) {
      console.error('Error saving cholesterol entry:', error);
      this.showToast('Error saving cholesterol entry', 'error');
    }
  }

  getCholesterolStatus(value) {
    if (value < 200) {
      return 'optimal';
    } else if (value < 240) {
      return 'borderline';
    } else {
      return 'high';
    }
  }

  renderMealHistory() {
    const mealHistoryList = document.getElementById('mealHistoryList');
    if (!mealHistoryList) return;

    if (this.meals.length === 0) {
      mealHistoryList.innerHTML = `
        <div class="no-data">
          <p>No meals logged yet. Start by adding your first meal!</p>
        </div>
      `;
      return;
    }

    mealHistoryList.innerHTML = this.meals.map(meal => {
      const timestamp = this.formatTimestamp(meal.timestamp);
      const mealTypeIcon = this.getMealTypeIcon(meal.type);
      
      return `
        <div class="history-item meal-entry">
          <div class="history-header">
            <div class="history-type">
              <span class="meal-type-icon">${mealTypeIcon}</span>
              <span class="meal-type">${meal.type}</span>
            </div>
            <span class="history-date">${timestamp}</span>
          </div>
          <div class="history-content">
            <h4>${meal.name}</h4>
            ${meal.notes ? `<p>${meal.notes}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  renderCholesterolHistory() {
    const cholesterolEntriesList = document.getElementById('cholesterolEntriesList');
    if (!cholesterolEntriesList) return;

    if (this.cholesterolEntries.length === 0) {
      cholesterolEntriesList.innerHTML = `
        <div class="no-data">
          <p>No cholesterol readings logged yet. Start monitoring your cholesterol levels!</p>
        </div>
      `;
      return;
    }

    cholesterolEntriesList.innerHTML = this.cholesterolEntries.map(entry => {
      const timestamp = this.formatTimestamp(entry.timestamp);
      const statusClass = entry.status;
      const statusText = entry.status.charAt(0).toUpperCase() + entry.status.slice(1);
      
      return `
        <div class="history-item cholesterol-entry ${statusClass}">
          <div class="history-header">
            <div class="history-type">
              <span class="cholesterol-icon">🧀</span>
              <span class="cholesterol-value">${entry.value} mg/dL</span>
            </div>
            <span class="history-date">${timestamp}</span>
          </div>
          <div class="history-content">
            <div class="cholesterol-status ${statusClass}">
              <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            ${entry.notes ? `<p>${entry.notes}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  updateNutritionOverview() {
    // Update daily calories (placeholder - would need food database integration)
    const dailyCalories = document.getElementById('dailyCalories');
    if (dailyCalories) {
      dailyCalories.textContent = '--'; // Would calculate from meals
    }

    // Update total meals
    const totalMeals = document.getElementById('totalMeals');
    if (totalMeals) {
      totalMeals.textContent = this.meals.length;
    }

    // Update latest cholesterol level
    const cholesterolLevel = document.getElementById('cholesterolLevel');
    if (cholesterolLevel && this.cholesterolEntries.length > 0) {
      const latestCholesterol = this.cholesterolEntries[0];
      cholesterolLevel.textContent = `${latestCholesterol.value} mg/dL`;
    } else if (cholesterolLevel) {
      cholesterolLevel.textContent = '--';
    }
  }

  getMealTypeIcon(type) {
    const icons = {
      'breakfast': '🌅',
      'lunch': '🌞',
      'dinner': '🌙',
      'snack': '🍎',
      'drink': '🥤'
    };
    return icons[type] || '🍽️';
  }

  formatTimestamp(timestamp) {
    let date;
    if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      // JavaScript Date
      date = timestamp;
    } else {
      // Fallback
      date = new Date(timestamp);
    }

    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  showToast(message, type = 'info') {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}

// Initialize Nutrition Tracker
window.nutritionTracker = new NutritionTracker(); 