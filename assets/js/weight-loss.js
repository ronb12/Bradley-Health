// AI-Powered Weight Loss System
class WeightLossManager {
  constructor() {
    this.db = null;
    this.currentUser = null;
    this.weightEntries = [];
    this.weightGoal = null;
    this.mealPlan = null;
    this.exercisePlan = null;
    this.initialized = false;
    
    // Wait for Firebase to be ready
    this.waitForFirebase();
  }

  waitForFirebase() {
    if (window.firebaseServices && window.firebaseServices.db) {
      this.db = window.firebaseServices.db;
      this.init();
    } else {
      // Retry after a short delay
      setTimeout(() => this.waitForFirebase(), 500);
    }
  }

  init() {
    console.log('Weight Loss Manager: Initializing...');
    
    // Wait for authentication
    if (window.authManager) {
      console.log('Weight Loss Manager: Auth manager found, setting up auth listener');
      window.authManager.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        if (user) {
          console.log('Weight Loss Manager: User authenticated, loading data');
          this.loadWeightLossData();
          this.setupEventListeners();
        } else {
          console.log('Weight Loss Manager: User signed out, clearing data...');
          this.weightEntries = [];
          this.weightGoal = null;
          this.mealPlan = null;
          this.exercisePlan = null;
          this.renderWeightHistory();
        }
      });
    } else {
      console.log('Weight Loss Manager: Auth manager not found, will retry');
      // Retry after a short delay
      setTimeout(() => this.init(), 1000);
    }
  }

  setupEventListeners() {
    console.log('Weight Loss Manager: Setting up event listeners');
    
    // Weight goal form
    const weightGoalForm = document.getElementById('weightGoalForm');
    console.log('Weight Loss Manager: weightGoalForm found:', !!weightGoalForm);
    if (weightGoalForm) {
      weightGoalForm.addEventListener('submit', (e) => this.setWeightGoal(e));
      console.log('Weight Loss Manager: Event listener added to weightGoalForm');
    }

    // Weight tracking form
    const weightTrackingForm = document.getElementById('weightTrackingForm');
    console.log('Weight Loss Manager: weightTrackingForm found:', !!weightTrackingForm);
    if (weightTrackingForm) {
      weightTrackingForm.addEventListener('submit', (e) => this.logWeight(e));
      console.log('Weight Loss Manager: Event listener added to weightTrackingForm');
    }

    // Set default date
    this.setDefaultDate();
  }

  setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    const weightDate = document.getElementById('weightDate');
    if (weightDate) {
      weightDate.value = today;
    }
  }

  async loadWeightLossData() {
    if (!this.currentUser) return;

    try {
      console.log('Weight Loss Manager: Loading weight loss data');
      
      // Load weight entries
      const weightSnapshot = await this.db.collection('weightEntries')
        .where('userId', '==', this.currentUser.uid)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

      this.weightEntries = weightSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load weight goal
      const goalSnapshot = await this.db.collection('weightGoals')
        .where('userId', '==', this.currentUser.uid)
        .limit(1)
        .get();

      if (!goalSnapshot.empty) {
        this.weightGoal = goalSnapshot.docs[0].data();
      }

      console.log('Weight Loss Manager: Loaded', this.weightEntries.length, 'weight entries');

      this.renderWeightHistory();
      this.updateWeightLossOverview();

    } catch (error) {
      console.error('Error loading weight loss data:', error);
      this.showToast('Error loading weight loss data', 'error');
    }
  }

  async setWeightGoal(e) {
    e.preventDefault();
    
    console.log('Weight Loss Manager: setWeightGoal called');
    
    if (!this.db) {
      console.error('Weight Loss Manager: Database not available');
      this.showToast('System not ready. Please try again.', 'error');
      return;
    }
    
    if (!this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to set weight goals', 'error');
      return;
    }

    const formData = new FormData(e.target);
    
    const currentWeight = parseFloat(formData.get('currentWeight'));
    const goalWeight = parseFloat(formData.get('goalWeight'));
    const weeklyRate = parseFloat(formData.get('rate'));
    const activityLevel = formData.get('activity');
    const restrictions = formData.get('restrictions');

    if (goalWeight >= currentWeight) {
      this.showToast('Goal weight should be less than current weight', 'error');
      return;
    }

    const weightToLose = currentWeight - goalWeight;
    const weeksToGoal = Math.ceil(weightToLose / weeklyRate);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (weeksToGoal * 7));

    this.weightGoal = {
      currentWeight: currentWeight,
      goalWeight: goalWeight,
      weightToLose: weightToLose,
      weeklyRate: weeklyRate,
      activityLevel: activityLevel,
      restrictions: restrictions,
      targetDate: targetDate,
      weeksToGoal: weeksToGoal,
      timestamp: new Date(),
      userId: this.currentUser.uid
    };

    try {
      // Save weight goal
      await this.db.collection('weightGoals').add(this.weightGoal);
      
      // Generate AI meal and exercise plans
      await this.generateAIPlans();
      
      this.showToast('Weight goal set successfully! AI plans generated.', 'success');
      this.updateWeightLossOverview();
      
    } catch (error) {
      console.error('Error saving weight goal:', error);
      this.showToast('Error saving weight goal', 'error');
    }
  }

  async generateAIPlans() {
    if (!this.weightGoal) return;

    console.log('Generating AI meal and exercise plans...');

    // Calculate daily calorie needs
    const dailyCalories = this.calculateDailyCalories();
    const mealPlan = this.generateMealPlan(dailyCalories);
    const exercisePlan = this.generateExercisePlan();

    this.mealPlan = mealPlan;
    this.exercisePlan = exercisePlan;

    // Display the plans
    this.displayMealPlan(mealPlan);
    this.displayExercisePlan(exercisePlan);

    // Save plans to database
    try {
      await this.db.collection('weightLossPlans').add({
        userId: this.currentUser.uid,
        mealPlan: mealPlan,
        exercisePlan: exercisePlan,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving plans:', error);
    }
  }

  calculateDailyCalories() {
    if (!this.weightGoal) return 2000;

    const { currentWeight, goalWeight, activityLevel, weeklyRate } = this.weightGoal;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    // Assuming average height and age for simplicity
    const height = 67; // inches (5'7")
    const age = 35; // average age
    const gender = 'male'; // default, could be made configurable
    
    let bmr;
    if (gender === 'male') {
      bmr = 10 * currentWeight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * currentWeight + 6.25 * height - 5 * age - 161;
    }

    // Apply activity multiplier
    const activityMultipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'athlete': 1.9
    };

    const tdee = bmr * activityMultipliers[activityLevel];
    
    // Calculate calorie deficit for weight loss
    const weeklyDeficit = weeklyRate * 500; // 1 lb = 3500 calories, so 1 lb/week = 500 cal/day deficit
    const dailyCalories = Math.round(tdee - weeklyDeficit);

    return Math.max(dailyCalories, 1200); // Minimum safe calorie intake
  }

  generateMealPlan(dailyCalories) {
    const proteinRatio = 0.3; // 30% protein
    const carbRatio = 0.45; // 45% carbs
    const fatRatio = 0.25; // 25% fat

    const proteinGrams = Math.round((dailyCalories * proteinRatio) / 4);
    const carbGrams = Math.round((dailyCalories * carbRatio) / 4);
    const fatGrams = Math.round((dailyCalories * fatRatio) / 9);

    // Generate 3 days of meals
    const mealPlan = {
      dailyCalories: dailyCalories,
      macros: {
        protein: proteinGrams,
        carbs: carbGrams,
        fat: fatGrams
      },
      days: []
    };

    for (let day = 1; day <= 3; day++) {
      const dayPlan = {
        day: day,
        meals: {
          breakfast: this.generateMeal('breakfast', dailyCalories * 0.25, this.weightGoal.restrictions),
          lunch: this.generateMeal('lunch', dailyCalories * 0.35, this.weightGoal.restrictions),
          dinner: this.generateMeal('dinner', dailyCalories * 0.35, this.weightGoal.restrictions),
          snack: this.generateMeal('snack', dailyCalories * 0.05, this.weightGoal.restrictions)
        }
      };
      mealPlan.days.push(dayPlan);
    }

    return mealPlan;
  }

  generateMeal(mealType, targetCalories, restrictions) {
    const lowCholesterol = restrictions && restrictions.toLowerCase().includes('cholesterol');
    
    const mealTemplates = {
      breakfast: {
        lowCholesterol: [
          { name: 'Oatmeal with Berries', calories: 250, protein: 8, carbs: 45, fat: 4, cholesterol: 0 },
          { name: 'Greek Yogurt with Nuts', calories: 200, protein: 15, carbs: 12, fat: 8, cholesterol: 5 },
          { name: 'Egg White Scramble', calories: 180, protein: 20, carbs: 5, fat: 6, cholesterol: 0 },
          { name: 'Smoothie Bowl', calories: 220, protein: 12, carbs: 35, fat: 3, cholesterol: 0 }
        ],
        regular: [
          { name: 'Scrambled Eggs with Toast', calories: 300, protein: 15, carbs: 25, fat: 15, cholesterol: 373 },
          { name: 'Pancakes with Syrup', calories: 350, protein: 8, carbs: 55, fat: 12, cholesterol: 50 },
          { name: 'Bacon and Eggs', calories: 400, protein: 20, carbs: 5, fat: 30, cholesterol: 470 }
        ]
      },
      lunch: {
        lowCholesterol: [
          { name: 'Grilled Chicken Salad', calories: 280, protein: 25, carbs: 15, fat: 12, cholesterol: 25 },
          { name: 'Quinoa Bowl with Vegetables', calories: 320, protein: 12, carbs: 45, fat: 8, cholesterol: 0 },
          { name: 'Tuna Salad (Light Mayo)', calories: 250, protein: 20, carbs: 8, fat: 12, cholesterol: 38 },
          { name: 'Vegetarian Wrap', calories: 300, protein: 10, carbs: 40, fat: 10, cholesterol: 0 }
        ],
        regular: [
          { name: 'Turkey Sandwich', calories: 350, protein: 20, carbs: 35, fat: 15, cholesterol: 45 },
          { name: 'Chicken Caesar Salad', calories: 400, protein: 25, carbs: 20, fat: 25, cholesterol: 80 },
          { name: 'Beef Burger', calories: 450, protein: 25, carbs: 30, fat: 25, cholesterol: 66 }
        ]
      },
      dinner: {
        lowCholesterol: [
          { name: 'Salmon with Brown Rice', calories: 380, protein: 30, carbs: 35, fat: 15, cholesterol: 55 },
          { name: 'Tofu Stir Fry', calories: 320, protein: 18, carbs: 40, fat: 8, cholesterol: 0 },
          { name: 'Grilled Fish with Vegetables', calories: 300, protein: 25, carbs: 20, fat: 12, cholesterol: 45 },
          { name: 'Lentil Curry', calories: 350, protein: 15, carbs: 50, fat: 8, cholesterol: 0 }
        ],
        regular: [
          { name: 'Grilled Chicken with Pasta', calories: 450, protein: 30, carbs: 45, fat: 18, cholesterol: 73 },
          { name: 'Steak with Potatoes', calories: 500, protein: 35, carbs: 30, fat: 25, cholesterol: 62 },
          { name: 'Pork Chops with Rice', calories: 420, protein: 28, carbs: 35, fat: 20, cholesterol: 62 }
        ]
      },
      snack: {
        lowCholesterol: [
          { name: 'Apple with Almonds', calories: 150, protein: 4, carbs: 20, fat: 8, cholesterol: 0 },
          { name: 'Carrot Sticks with Hummus', calories: 120, protein: 3, carbs: 15, fat: 6, cholesterol: 0 },
          { name: 'Greek Yogurt', calories: 100, protein: 12, carbs: 8, fat: 2, cholesterol: 5 }
        ],
        regular: [
          { name: 'Mixed Nuts', calories: 180, protein: 6, carbs: 8, fat: 16, cholesterol: 0 },
          { name: 'Cheese and Crackers', calories: 200, protein: 8, carbs: 15, fat: 12, cholesterol: 25 },
          { name: 'Trail Mix', calories: 160, protein: 4, carbs: 18, fat: 8, cholesterol: 0 }
        ]
      }
    };

    const templates = mealTemplates[mealType][lowCholesterol ? 'lowCholesterol' : 'regular'];
    const selectedMeal = templates[Math.floor(Math.random() * templates.length)];
    
    // Adjust portion size to match target calories
    const calorieRatio = targetCalories / selectedMeal.calories;
    return {
      name: selectedMeal.name,
      calories: Math.round(selectedMeal.calories * calorieRatio),
      protein: Math.round(selectedMeal.protein * calorieRatio),
      carbs: Math.round(selectedMeal.carbs * calorieRatio),
      fat: Math.round(selectedMeal.fat * calorieRatio),
      cholesterol: Math.round(selectedMeal.cholesterol * calorieRatio)
    };
  }

  generateExercisePlan() {
    const { activityLevel, weeklyRate } = this.weightGoal;
    
    const exerciseTemplates = {
      sedentary: {
        weeklyWorkouts: 3,
        focus: 'Cardio & Strength',
        exercises: [
          { day: 1, type: 'Cardio', name: 'Walking', duration: '30 minutes', calories: 150 },
          { day: 2, type: 'Strength', name: 'Bodyweight Exercises', duration: '20 minutes', calories: 100 },
          { day: 3, type: 'Cardio', name: 'Cycling', duration: '25 minutes', calories: 180 }
        ]
      },
      light: {
        weeklyWorkouts: 4,
        focus: 'Cardio & Toning',
        exercises: [
          { day: 1, type: 'Cardio', name: 'Jogging', duration: '30 minutes', calories: 250 },
          { day: 2, type: 'Strength', name: 'Light Weights', duration: '30 minutes', calories: 150 },
          { day: 3, type: 'Cardio', name: 'Swimming', duration: '25 minutes', calories: 200 },
          { day: 4, type: 'Flexibility', name: 'Yoga', duration: '45 minutes', calories: 120 }
        ]
      },
      moderate: {
        weeklyWorkouts: 5,
        focus: 'Strength & Cardio',
        exercises: [
          { day: 1, type: 'Strength', name: 'Upper Body', duration: '45 minutes', calories: 200 },
          { day: 2, type: 'Cardio', name: 'Running', duration: '35 minutes', calories: 350 },
          { day: 3, type: 'Strength', name: 'Lower Body', duration: '45 minutes', calories: 200 },
          { day: 4, type: 'Cardio', name: 'HIIT', duration: '25 minutes', calories: 300 },
          { day: 5, type: 'Recovery', name: 'Stretching', duration: '30 minutes', calories: 80 }
        ]
      },
      active: {
        weeklyWorkouts: 6,
        focus: 'Performance & Endurance',
        exercises: [
          { day: 1, type: 'Strength', name: 'Full Body', duration: '60 minutes', calories: 300 },
          { day: 2, type: 'Cardio', name: 'Long Distance Run', duration: '45 minutes', calories: 450 },
          { day: 3, type: 'Strength', name: 'Power Lifting', duration: '50 minutes', calories: 250 },
          { day: 4, type: 'Cardio', name: 'Interval Training', duration: '30 minutes', calories: 400 },
          { day: 5, type: 'Strength', name: 'Functional Training', duration: '45 minutes', calories: 280 },
          { day: 6, type: 'Recovery', name: 'Active Recovery', duration: '40 minutes', calories: 150 }
        ]
      }
    };

    const template = exerciseTemplates[activityLevel] || exerciseTemplates.moderate;
    const weeklyCaloriesBurned = template.exercises.reduce((total, exercise) => total + exercise.calories, 0);

    return {
      weeklyWorkouts: template.weeklyWorkouts,
      focus: template.focus,
      weeklyCaloriesBurned: weeklyCaloriesBurned,
      exercises: template.exercises
    };
  }

  displayMealPlan(mealPlan) {
    const mealPlanCard = document.getElementById('aiMealPlanCard');
    if (!mealPlanCard) return;

    // Update summary metrics
    document.getElementById('dailyCalorieTarget').textContent = mealPlan.dailyCalories;
    document.getElementById('proteinTarget').textContent = mealPlan.macros.protein;
    document.getElementById('carbsTarget').textContent = mealPlan.macros.carbs;
    document.getElementById('fatTarget').textContent = mealPlan.macros.fat;

    // Display daily meal plans
    mealPlan.days.forEach((day, index) => {
      const dayPlanElement = document.getElementById(`day${index + 1}Plan`);
      if (dayPlanElement) {
        const mealsContainer = dayPlanElement.querySelector('.meals-container');
        mealsContainer.innerHTML = Object.entries(day.meals).map(([mealType, meal]) => `
          <div class="meal-item">
            <div class="meal-header">
              <span class="meal-type">${mealType.charAt(0).toUpperCase() + mealType.slice(1)}</span>
              <span class="meal-calories">${meal.calories} cal</span>
            </div>
            <div class="meal-name">${meal.name}</div>
            <div class="meal-macros">
              <span class="macro">P: ${meal.protein}g</span>
              <span class="macro">C: ${meal.carbs}g</span>
              <span class="macro">F: ${meal.fat}g</span>
              ${meal.cholesterol > 0 ? `<span class="macro cholesterol">Chol: ${meal.cholesterol}mg</span>` : ''}
            </div>
          </div>
        `).join('');
      }
    });

    mealPlanCard.style.display = 'block';
  }

  displayExercisePlan(exercisePlan) {
    const exercisePlanCard = document.getElementById('aiExercisePlanCard');
    if (!exercisePlanCard) return;

    // Update summary metrics
    document.getElementById('weeklyWorkouts').textContent = exercisePlan.weeklyWorkouts;
    document.getElementById('weeklyCaloriesBurned').textContent = exercisePlan.weeklyCaloriesBurned;
    document.getElementById('exerciseFocus').textContent = exercisePlan.focus;

    // Display exercise schedule
    exercisePlan.exercises.forEach((exercise, index) => {
      const exerciseDayElement = document.getElementById(`exerciseDay${index + 1}`);
      if (exerciseDayElement) {
        const exercisesContainer = exerciseDayElement.querySelector('.exercises-container');
        exercisesContainer.innerHTML = `
          <div class="exercise-item">
            <div class="exercise-header">
              <span class="exercise-type">${exercise.type}</span>
              <span class="exercise-calories">${exercise.calories} cal</span>
            </div>
            <div class="exercise-name">${exercise.name}</div>
            <div class="exercise-duration">${exercise.duration}</div>
          </div>
        `;
      }
    });

    exercisePlanCard.style.display = 'block';
  }

  async logWeight(e) {
    e.preventDefault();
    
    if (!this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to log weight', 'error');
      return;
    }

    const formData = new FormData(e.target);
    
    const date = formData.get('date');
    const weight = parseFloat(formData.get('weight'));
    const notes = formData.get('notes');
    const timestamp = new Date(`${date}T00:00:00`);

    const weightEntry = {
      weight: weight,
      date: date,
      notes: notes,
      timestamp: timestamp,
      userId: this.currentUser.uid
    };

    try {
      await this.db.collection('weightEntries').add(weightEntry);
      this.showToast('Weight logged successfully', 'success');
      e.target.reset();
      this.setDefaultDate();
      this.loadWeightLossData();
    } catch (error) {
      console.error('Error saving weight entry:', error);
      this.showToast('Error saving weight entry', 'error');
    }
  }

  updateWeightLossOverview() {
    if (!this.weightGoal) return;

    // Update goal weight
    const goalWeightElement = document.getElementById('goalWeight');
    if (goalWeightElement) {
      goalWeightElement.textContent = `${this.weightGoal.goalWeight} lbs`;
    }

    // Update current weight (latest entry)
    const currentWeightElement = document.getElementById('currentWeight');
    if (currentWeightElement && this.weightEntries.length > 0) {
      currentWeightElement.textContent = `${this.weightEntries[0].weight} lbs`;
    }

    // Calculate progress
    const progressElement = document.getElementById('weightProgress');
    if (progressElement && this.weightEntries.length > 0) {
      const currentWeight = this.weightEntries[0].weight;
      const weightLost = this.weightGoal.currentWeight - currentWeight;
      const progressPercent = Math.round((weightLost / this.weightGoal.weightToLose) * 100);
      progressElement.textContent = `${Math.max(0, progressPercent)}%`;
    }

    // Update timeline
    const timelineElement = document.getElementById('weightTimeline');
    if (timelineElement) {
      timelineElement.textContent = `${this.weightGoal.weeksToGoal} weeks`;
    }
  }

  renderWeightHistory() {
    const weightHistoryList = document.getElementById('weightHistoryList');
    if (!weightHistoryList) return;

    if (this.weightEntries.length === 0) {
      weightHistoryList.innerHTML = `
        <div class="no-data">
          <p>No weight entries logged yet. Start tracking your progress!</p>
        </div>
      `;
      return;
    }

    weightHistoryList.innerHTML = this.weightEntries.map(entry => {
      const date = this.formatDate(entry.timestamp);
      
      return `
        <div class="history-item weight-entry">
          <div class="history-header">
            <div class="history-type">
              <span class="weight-icon">⚖️</span>
              <span class="weight-value">${entry.weight} lbs</span>
            </div>
            <span class="history-date">${date}</span>
          </div>
          ${entry.notes ? `<div class="history-content"><p>${entry.notes}</p></div>` : ''}
        </div>
      `;
    }).join('');
  }

  formatDate(timestamp) {
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
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

// Initialize Weight Loss Manager
window.weightLossManager = new WeightLossManager(); 