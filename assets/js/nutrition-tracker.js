// Nutrition Tracking System with Cholesterol Monitoring
class NutritionTracker {
  constructor() {
    // Wait for Firebase to be ready
    if (window.firebaseServices && window.firebaseServices.db) {
      this.db = window.firebaseServices.db;
      this.currentUser = null;
      this.meals = [];
      this.cholesterolEntries = [];
      this.foodDatabase = this.initializeFoodDatabase();
      this.init();
    } else {
      // Retry after a short delay
      setTimeout(() => {
        if (window.firebaseServices && window.firebaseServices.db) {
          this.db = window.firebaseServices.db;
          this.currentUser = null;
          this.meals = [];
          this.cholesterolEntries = [];
          this.foodDatabase = this.initializeFoodDatabase();
          this.init();
        } else {
          console.error('Firebase not available for nutrition tracker');
        }
      }, 1000);
    }
  }

  initializeFoodDatabase() {
    // Sample food database with cholesterol content (mg per 100g)
    return {
      // Dairy Products
      'whole milk': { cholesterol: 14, calories: 61, fat: 3.3 },
      'skim milk': { cholesterol: 5, calories: 42, fat: 0.1 },
      'cheddar cheese': { cholesterol: 105, calories: 403, fat: 33.1 },
      'eggs': { cholesterol: 373, calories: 155, fat: 11.3 },
      'yogurt': { cholesterol: 13, calories: 59, fat: 0.4 },
      'butter': { cholesterol: 215, calories: 717, fat: 81.1 },
      
      // Meats
      'beef': { cholesterol: 62, calories: 250, fat: 15.4 },
      'pork': { cholesterol: 62, calories: 242, fat: 14.0 },
      'chicken breast': { cholesterol: 73, calories: 165, fat: 3.6 },
      'chicken thigh': { cholesterol: 82, calories: 177, fat: 9.3 },
      'salmon': { cholesterol: 55, calories: 208, fat: 12.4 },
      'tuna': { cholesterol: 38, calories: 144, fat: 0.5 },
      'shrimp': { cholesterol: 195, calories: 99, fat: 0.3 },
      
      // Processed Foods
      'bacon': { cholesterol: 97, calories: 541, fat: 42.0 },
      'sausage': { cholesterol: 80, calories: 296, fat: 26.0 },
      'hot dog': { cholesterol: 77, calories: 290, fat: 26.0 },
      'hamburger': { cholesterol: 66, calories: 295, fat: 12.0 },
      
      // Plant-based (low cholesterol)
      'tofu': { cholesterol: 0, calories: 76, fat: 4.8 },
      'beans': { cholesterol: 0, calories: 88, fat: 0.5 },
      'lentils': { cholesterol: 0, calories: 116, fat: 0.4 },
      'quinoa': { cholesterol: 0, calories: 120, fat: 1.9 },
      
      // Fruits and Vegetables (no cholesterol)
      'apple': { cholesterol: 0, calories: 52, fat: 0.2 },
      'banana': { cholesterol: 0, calories: 89, fat: 0.3 },
      'broccoli': { cholesterol: 0, calories: 34, fat: 0.4 },
      'spinach': { cholesterol: 0, calories: 23, fat: 0.4 },
      'carrots': { cholesterol: 0, calories: 41, fat: 0.2 },
      
      // Grains
      'bread': { cholesterol: 0, calories: 265, fat: 3.2 },
      'rice': { cholesterol: 0, calories: 130, fat: 0.3 },
      'pasta': { cholesterol: 0, calories: 131, fat: 1.1 },
      'oatmeal': { cholesterol: 0, calories: 68, fat: 1.4 }
    };
  }

  // Calculate estimated cholesterol from meal description
  calculateCholesterolFromMeal(mealName, mealNotes) {
    const text = `${mealName} ${mealNotes || ''}`.toLowerCase();
    let totalCholesterol = 0;
    let totalCalories = 0;
    let totalFat = 0;
    let foodsFound = [];
    
    // Search for foods in the database
    for (const [food, nutrition] of Object.entries(this.foodDatabase)) {
      if (text.includes(food)) {
        // Estimate portion size (default 100g)
        let portionSize = 100;
        
        // Try to extract portion size from text
        const portionMatch = text.match(new RegExp(`(\\d+)\\s*(g|gram|grams|oz|ounce|ounces|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons)\\s*${food}`));
        if (portionMatch) {
          const amount = parseFloat(portionMatch[1]);
          const unit = portionMatch[2];
          
          // Convert to grams
          if (unit.includes('oz') || unit.includes('ounce')) {
            portionSize = amount * 28.35; // oz to grams
          } else if (unit.includes('cup')) {
            portionSize = amount * 240; // cup to grams (approximate)
          } else if (unit.includes('tbsp') || unit.includes('tablespoon')) {
            portionSize = amount * 15; // tablespoon to grams
          } else if (unit.includes('tsp') || unit.includes('teaspoon')) {
            portionSize = amount * 5; // teaspoon to grams
          } else {
            portionSize = amount; // already in grams
          }
        }
        
        // Calculate nutrition for this portion
        const cholesterol = (nutrition.cholesterol * portionSize) / 100;
        const calories = (nutrition.calories * portionSize) / 100;
        const fat = (nutrition.fat * portionSize) / 100;
        
        totalCholesterol += cholesterol;
        totalCalories += calories;
        totalFat += fat;
        foodsFound.push({
          food: food,
          portion: portionSize,
          cholesterol: cholesterol,
          calories: calories,
          fat: fat
        });
      }
    }
    
    return {
      estimatedCholesterol: Math.round(totalCholesterol),
      estimatedCalories: Math.round(totalCalories),
      estimatedFat: Math.round(totalFat * 10) / 10,
      foodsFound: foodsFound,
      hasData: foodsFound.length > 0
    };
  }

  // Enhanced meal logging with automatic nutrition calculation
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

    const mealName = formData.get('name');
    const mealNotes = formData.get('notes');
    
    // Calculate estimated nutrition
    const nutrition = this.calculateCholesterolFromMeal(mealName, mealNotes);

    const meal = {
      name: mealName,
      type: formData.get('type'),
      date: date,
      time: time,
      notes: mealNotes,
      timestamp: timestamp,
      userId: this.currentUser.uid,
      // Add calculated nutrition data
      estimatedCholesterol: nutrition.estimatedCholesterol,
      estimatedCalories: nutrition.estimatedCalories,
      estimatedFat: nutrition.estimatedFat,
      foodsFound: nutrition.foodsFound,
      hasNutritionData: nutrition.hasData
    };

    try {
      await this.db.collection('meals').add(meal);
      
      // Show nutrition summary if data was found
      if (nutrition.hasData) {
        this.showToast(`Meal logged! Estimated: ${nutrition.estimatedCalories} cal, ${nutrition.estimatedCholesterol}mg cholesterol`, 'success');
      } else {
        this.showToast('Meal logged successfully', 'success');
      }
      
      e.target.reset();
      this.setDefaultDateTime();
      this.loadNutritionData();
    } catch (error) {
      console.error('Error saving meal:', error);
      this.showToast('Error saving meal', 'error');
    }
  }

  // Calculate daily cholesterol intake from meals
  async calculateDailyCholesterolIntake(date) {
    if (!this.currentUser) return 0;
    
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const mealsSnapshot = await this.db.collection('meals')
        .where('userId', '==', this.currentUser.uid)
        .where('timestamp', '>=', startOfDay)
        .where('timestamp', '<=', endOfDay)
        .get();

      let totalCholesterol = 0;
      let totalCalories = 0;
      let mealsWithData = 0;

      mealsSnapshot.docs.forEach(doc => {
        const meal = doc.data();
        if (meal.hasNutritionData) {
          totalCholesterol += meal.estimatedCholesterol || 0;
          totalCalories += meal.estimatedCalories || 0;
          mealsWithData++;
        }
      });

      return {
        totalCholesterol: totalCholesterol,
        totalCalories: totalCalories,
        mealsWithData: mealsWithData,
        averageCholesterolPerMeal: mealsWithData > 0 ? Math.round(totalCholesterol / mealsWithData) : 0
      };
    } catch (error) {
      console.error('Error calculating daily cholesterol intake:', error);
      return { totalCholesterol: 0, totalCalories: 0, mealsWithData: 0, averageCholesterolPerMeal: 0 };
    }
  }

  // Enhanced nutrition overview with calculated data
  async updateNutritionOverview() {
    const today = new Date().toISOString().split('T')[0];
    const dailyStats = await this.calculateDailyCholesterolIntake(today);
    
    // Update daily calories
    const dailyCalories = document.getElementById('dailyCalories');
    if (dailyCalories) {
      dailyCalories.textContent = dailyStats.totalCalories > 0 ? dailyStats.totalCalories : '--';
    }

    // Update total meals
    const totalMeals = document.getElementById('totalMeals');
    if (totalMeals) {
      totalMeals.textContent = this.meals.length;
    }

    // Update cholesterol level (show estimated intake if available)
    const cholesterolLevel = document.getElementById('cholesterolLevel');
    if (cholesterolLevel) {
      if (this.cholesterolEntries.length > 0) {
        const latestCholesterol = this.cholesterolEntries[0];
        cholesterolLevel.textContent = `${latestCholesterol.value} mg/dL`;
      } else if (dailyStats.totalCholesterol > 0) {
        cholesterolLevel.textContent = `${dailyStats.totalCholesterol} mg (est.)`;
      } else {
        cholesterolLevel.textContent = '--';
      }
    }
  }

  // Enhanced meal history display with nutrition info
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
      
      // Add nutrition information if available
      let nutritionInfo = '';
      if (meal.hasNutritionData) {
        nutritionInfo = `
          <div class="meal-nutrition">
            <span class="nutrition-item">${meal.estimatedCalories} cal</span>
            <span class="nutrition-item">${meal.estimatedCholesterol}mg chol</span>
            <span class="nutrition-item">${meal.estimatedFat}g fat</span>
          </div>
        `;
      }
      
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
            ${nutritionInfo}
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

  getCholesterolStatus(value) {
    if (value < 200) {
      return 'optimal';
    } else if (value < 240) {
      return 'borderline';
    } else {
      return 'high';
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