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

    // Determine plan duration based on weight goal timeline
    const planDuration = Math.min(this.weightGoal.weeksToGoal * 7, 30); // Max 30 days for display
    const displayDays = Math.min(planDuration, 7); // Show first 7 days in UI, rest in print

    const mealPlan = {
      dailyCalories: dailyCalories,
      macros: {
        protein: proteinGrams,
        carbs: carbGrams,
        fat: fatGrams
      },
      days: [],
      totalDays: planDuration,
      displayDays: displayDays
    };

    for (let day = 1; day <= planDuration; day++) {
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

    // Calculate total weeks and generate repeating weekly plan
    const totalWeeks = this.weightGoal.weeksToGoal;
    const allExercises = [];
    
    for (let week = 1; week <= totalWeeks; week++) {
      template.exercises.forEach(exercise => {
        allExercises.push({
          ...exercise,
          week: week,
          day: exercise.day + ((week - 1) * 7)
        });
      });
    }

    return {
      weeklyWorkouts: template.weeklyWorkouts,
      focus: template.focus,
      weeklyCaloriesBurned: weeklyCaloriesBurned,
      totalWeeks: totalWeeks,
      totalDays: totalWeeks * 7,
      exercises: allExercises,
      weeklyTemplate: template.exercises
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

    // Add plan duration info
    const planInfoElement = document.getElementById('mealPlanInfo');
    if (planInfoElement) {
      planInfoElement.innerHTML = `
        <div class="plan-duration-info">
          <span class="duration-badge">${mealPlan.totalDays} Days</span>
          <span class="duration-text">Showing first ${mealPlan.displayDays} days</span>
        </div>
      `;
    }

    // Display daily meal plans (show first 7 days in UI)
    const daysToShow = Math.min(mealPlan.displayDays, 7);
    for (let i = 0; i < daysToShow; i++) {
      const dayPlanElement = document.getElementById(`day${i + 1}Plan`);
      if (dayPlanElement && mealPlan.days[i]) {
        const mealsContainer = dayPlanElement.querySelector('.meals-container');
        mealsContainer.innerHTML = Object.entries(mealPlan.days[i].meals).map(([mealType, meal]) => `
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
    }

    mealPlanCard.style.display = 'block';
    
    // Add print button if not already present
    if (!mealPlanCard.querySelector('.print-plan-btn')) {
      const printButton = document.createElement('button');
      printButton.className = 'btn btn-secondary print-plan-btn';
      printButton.innerHTML = '🖨️ Print Full Meal Plan';
      printButton.onclick = () => this.printMealPlan(mealPlan);
      mealPlanCard.appendChild(printButton);
    }
  }

  displayExercisePlan(exercisePlan) {
    const exercisePlanCard = document.getElementById('aiExercisePlanCard');
    if (!exercisePlanCard) return;

    // Update summary metrics
    document.getElementById('weeklyWorkouts').textContent = exercisePlan.weeklyWorkouts;
    document.getElementById('weeklyCaloriesBurned').textContent = exercisePlan.weeklyCaloriesBurned;
    document.getElementById('exerciseFocus').textContent = exercisePlan.focus;

    // Add plan duration info
    const exercisePlanInfoElement = document.getElementById('exercisePlanInfo');
    if (exercisePlanInfoElement) {
      exercisePlanInfoElement.innerHTML = `
        <div class="plan-duration-info">
          <span class="duration-badge">${exercisePlan.totalWeeks} Weeks</span>
          <span class="duration-text">${exercisePlan.totalDays} total days</span>
        </div>
      `;
    }

    // Display weekly exercise template (first week)
    exercisePlan.weeklyTemplate.forEach((exercise, index) => {
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

    // Update current weight (latest entry or goal's current weight)
    const currentWeightElement = document.getElementById('currentWeight');
    if (currentWeightElement) {
      if (this.weightEntries.length > 0) {
        currentWeightElement.textContent = `${this.weightEntries[0].weight} lbs`;
      } else {
        // Use the current weight from the weight goal if no entries exist
        currentWeightElement.textContent = `${this.weightGoal.currentWeight} lbs`;
      }
    }

    // Calculate progress
    const progressElement = document.getElementById('weightProgress');
    if (progressElement) {
      let currentWeight;
      if (this.weightEntries.length > 0) {
        currentWeight = this.weightEntries[0].weight;
      } else {
        currentWeight = this.weightGoal.currentWeight;
      }
      
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

  printMealPlan(mealPlan) {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Weight Loss Meal Plan</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
          .day-plan { margin-bottom: 30px; page-break-inside: avoid; }
          .meal-item { border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px; }
          .meal-header { display: flex; justify-content: space-between; font-weight: bold; }
          .meal-macros { color: #666; font-size: 0.9em; margin-top: 5px; }
          .macro { margin-right: 15px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🤖 AI-Generated Weight Loss Meal Plan</h1>
          <p>Personalized nutrition plan for your weight loss journey</p>
        </div>
        
        <div class="summary">
          <h2>Daily Nutrition Targets</h2>
          <p><strong>Daily Calories:</strong> ${mealPlan.dailyCalories} calories</p>
          <p><strong>Protein:</strong> ${mealPlan.macros.protein}g</p>
          <p><strong>Carbohydrates:</strong> ${mealPlan.macros.carbs}g</p>
          <p><strong>Fat:</strong> ${mealPlan.macros.fat}g</p>
        </div>
        
        ${mealPlan.days.map((day, index) => `
          <div class="day-plan">
            <h2>Day ${index + 1}</h2>
            ${Object.entries(day.meals).map(([mealType, meal]) => `
              <div class="meal-item">
                <div class="meal-header">
                  <span>${mealType.charAt(0).toUpperCase() + mealType.slice(1)}</span>
                  <span>${meal.calories} calories</span>
                </div>
                <div><strong>${meal.name}</strong></div>
                <div class="meal-macros">
                  <span class="macro">Protein: ${meal.protein}g</span>
                  <span class="macro">Carbs: ${meal.carbs}g</span>
                  <span class="macro">Fat: ${meal.fat}g</span>
                  ${meal.cholesterol > 0 ? `<span class="macro">Cholesterol: ${meal.cholesterol}mg</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
        
        ${mealPlan.totalDays > 7 ? `
          <div class="plan-note">
            <p><strong>Note:</strong> This plan continues for ${mealPlan.totalDays} days total. 
            The meal structure and calorie targets remain consistent throughout your weight loss journey.</p>
          </div>
        ` : ''}
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }

  printExercisePlan(exercisePlan) {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Weight Loss Exercise Plan</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
          .exercise-day { margin-bottom: 30px; page-break-inside: avoid; }
          .exercise-item { border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px; }
          .exercise-header { display: flex; justify-content: space-between; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏃‍♂️ AI-Generated Weight Loss Exercise Plan</h1>
          <p>Personalized fitness plan for your weight loss journey</p>
        </div>
        
        <div class="summary">
          <h2>Weekly Exercise Summary</h2>
          <p><strong>Weekly Workouts:</strong> ${exercisePlan.weeklyWorkouts}</p>
          <p><strong>Weekly Calories Burned:</strong> ${exercisePlan.weeklyCaloriesBurned}</p>
          <p><strong>Focus Areas:</strong> ${exercisePlan.focus}</p>
        </div>
        
        <h2>Weekly Exercise Template</h2>
        ${exercisePlan.weeklyTemplate.map((exercise, index) => `
          <div class="exercise-day">
            <h3>Day ${index + 1}</h3>
            <div class="exercise-item">
              <div class="exercise-header">
                <span>${exercise.type}</span>
                <span>${exercise.calories} calories</span>
              </div>
              <div><strong>${exercise.name}</strong></div>
              <div><em>Duration: ${exercise.duration}</em></div>
            </div>
          </div>
        `).join('')}
        
        ${exercisePlan.totalWeeks > 1 ? `
          <div class="plan-note">
            <h2>Complete Exercise Plan</h2>
            <p><strong>Duration:</strong> ${exercisePlan.totalWeeks} weeks (${exercisePlan.totalDays} days total)</p>
            <p><strong>Structure:</strong> This weekly template repeats for ${exercisePlan.totalWeeks} weeks.</p>
            <p><strong>Progression:</strong> As you get stronger, you can increase intensity, duration, or add more challenging variations.</p>
          </div>
        ` : ''}
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }

  printFullWeightLossPlan() {
    if (!this.weightGoal || !this.mealPlan || !this.exercisePlan) {
      this.showToast('Please generate a weight loss plan first', 'error');
      return;
    }

    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Complete Weight Loss Plan</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .goal-summary { background: #e3f2fd; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .meal-item, .exercise-item { border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px; }
          .meal-header, .exercise-header { display: flex; justify-content: space-between; font-weight: bold; }
          .meal-macros { color: #666; font-size: 0.9em; margin-top: 5px; }
          .macro { margin-right: 15px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎯 Complete Weight Loss Journey Plan</h1>
          <p>Your personalized AI-generated weight loss strategy</p>
        </div>
        
        <div class="goal-summary">
          <h2>Your Weight Loss Goal</h2>
          <p><strong>Starting Weight:</strong> ${this.weightGoal.currentWeight} lbs</p>
          <p><strong>Goal Weight:</strong> ${this.weightGoal.goalWeight} lbs</p>
          <p><strong>Weight to Lose:</strong> ${this.weightGoal.weightToLose} lbs</p>
          <p><strong>Weekly Loss Rate:</strong> ${this.weightGoal.weeklyRate} lbs/week</p>
          <p><strong>Timeline:</strong> ${this.weightGoal.weeksToGoal} weeks</p>
          <p><strong>Activity Level:</strong> ${this.weightGoal.activityLevel}</p>
          ${this.weightGoal.restrictions ? `<p><strong>Dietary Restrictions:</strong> ${this.weightGoal.restrictions}</p>` : ''}
        </div>
        
        <div class="section">
          <h2>🤖 Daily Nutrition Plan</h2>
          <p><strong>Daily Calories:</strong> ${this.mealPlan.dailyCalories} calories</p>
          <p><strong>Protein:</strong> ${this.mealPlan.macros.protein}g | <strong>Carbs:</strong> ${this.mealPlan.macros.carbs}g | <strong>Fat:</strong> ${this.mealPlan.macros.fat}g</p>
          
          ${this.mealPlan.days.slice(0, 7).map((day, index) => `
            <h3>Day ${index + 1}</h3>
            ${Object.entries(day.meals).map(([mealType, meal]) => `
              <div class="meal-item">
                <div class="meal-header">
                  <span>${mealType.charAt(0).toUpperCase() + mealType.slice(1)}</span>
                  <span>${meal.calories} calories</span>
                </div>
                <div><strong>${meal.name}</strong></div>
                <div class="meal-macros">
                  <span class="macro">Protein: ${meal.protein}g</span>
                  <span class="macro">Carbs: ${meal.carbs}g</span>
                  <span class="macro">Fat: ${meal.fat}g</span>
                  ${meal.cholesterol > 0 ? `<span class="macro">Cholesterol: ${meal.cholesterol}mg</span>` : ''}
                </div>
              </div>
            `).join('')}
          `).join('')}
          
          ${this.mealPlan.totalDays > 7 ? `
            <div class="plan-note">
              <p><strong>Note:</strong> This meal plan continues for ${this.mealPlan.totalDays} days total. 
              The meal structure and calorie targets remain consistent throughout your weight loss journey.</p>
            </div>
          ` : ''}
        </div>
        
        <div class="section">
          <h2>🏃‍♂️ Weekly Exercise Plan</h2>
          <p><strong>Weekly Workouts:</strong> ${this.exercisePlan.weeklyWorkouts}</p>
          <p><strong>Weekly Calories Burned:</strong> ${this.exercisePlan.weeklyCaloriesBurned}</p>
          <p><strong>Focus Areas:</strong> ${this.exercisePlan.focus}</p>
          
          <h3>Weekly Exercise Template</h3>
          ${this.exercisePlan.weeklyTemplate.map((exercise, index) => `
            <div class="exercise-item">
              <div class="exercise-header">
                <span>Day ${index + 1} - ${exercise.type}</span>
                <span>${exercise.calories} calories</span>
              </div>
              <div><strong>${exercise.name}</strong></div>
              <div><em>Duration: ${exercise.duration}</em></div>
            </div>
          `).join('')}
          
          ${this.exercisePlan.totalWeeks > 1 ? `
            <div class="plan-note">
              <p><strong>Complete Plan:</strong> This weekly template repeats for ${this.exercisePlan.totalWeeks} weeks (${this.exercisePlan.totalDays} days total).</p>
              <p><strong>Progression:</strong> As you get stronger, increase intensity, duration, or add more challenging variations.</p>
            </div>
          ` : ''}
        </div>
        
        <div class="section">
          <h2>📝 Tips for Success</h2>
          <ul>
            <li>Track your weight weekly to monitor progress</li>
            <li>Stay consistent with your meal and exercise plan</li>
            <li>Drink plenty of water throughout the day</li>
            <li>Get adequate sleep (7-9 hours per night)</li>
            <li>Be patient - sustainable weight loss takes time</li>
            <li>Adjust the plan if needed based on your progress</li>
          </ul>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }
}

// Initialize Weight Loss Manager
window.weightLossManager = new WeightLossManager(); 