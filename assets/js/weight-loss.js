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
    // Optimized macro ratios for weight loss
    const proteinRatio = 0.35; // 35% protein (higher for satiety and muscle preservation)
    const carbRatio = 0.40; // 40% carbs (moderate for energy)
    const fatRatio = 0.25; // 25% fat (healthy fats for satiety)

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
      // Vary meal types to include smoothies and different combinations
      const includeSmoothie = Math.random() < 0.3; // 30% chance of smoothie
      const smoothieMeal = Math.random() < 0.5 ? 'breakfast' : 'snack'; // Smoothie for breakfast or snack
      
      const dayPlan = {
        day: day,
        meals: {}
      };

      // Generate meals with varied calorie distribution
      if (includeSmoothie && smoothieMeal === 'breakfast') {
        dayPlan.meals.breakfast = this.generateMeal('smoothie', dailyCalories * 0.20, this.weightGoal.restrictions);
        dayPlan.meals.lunch = this.generateMeal('lunch', dailyCalories * 0.35, this.weightGoal.restrictions);
        dayPlan.meals.dinner = this.generateMeal('dinner', dailyCalories * 0.35, this.weightGoal.restrictions);
        dayPlan.meals.snack = this.generateMeal('snack', dailyCalories * 0.10, this.weightGoal.restrictions);
      } else if (includeSmoothie && smoothieMeal === 'snack') {
        dayPlan.meals.breakfast = this.generateMeal('breakfast', dailyCalories * 0.25, this.weightGoal.restrictions);
        dayPlan.meals.lunch = this.generateMeal('lunch', dailyCalories * 0.35, this.weightGoal.restrictions);
        dayPlan.meals.dinner = this.generateMeal('dinner', dailyCalories * 0.30, this.weightGoal.restrictions);
        dayPlan.meals.snack = this.generateMeal('smoothie', dailyCalories * 0.10, this.weightGoal.restrictions);
      } else {
        // Standard meal distribution
        dayPlan.meals.breakfast = this.generateMeal('breakfast', dailyCalories * 0.25, this.weightGoal.restrictions);
        dayPlan.meals.lunch = this.generateMeal('lunch', dailyCalories * 0.35, this.weightGoal.restrictions);
        dayPlan.meals.dinner = this.generateMeal('dinner', dailyCalories * 0.30, this.weightGoal.restrictions);
        dayPlan.meals.snack = this.generateMeal('snack', dailyCalories * 0.10, this.weightGoal.restrictions);
      }

      mealPlan.days.push(dayPlan);
    }

    return mealPlan;
  }

  generateMeal(mealType, targetCalories, restrictions) {
    const lowCholesterol = restrictions && restrictions.toLowerCase().includes('cholesterol');
    const isVegan = restrictions && restrictions.toLowerCase().includes('vegan');
    const isVegetarian = restrictions && restrictions.toLowerCase().includes('vegetarian');
    
    const mealTemplates = {
      breakfast: {
        lowCholesterol: [
          { name: 'Oatmeal with Berries & Almonds', calories: 280, protein: 10, carbs: 48, fat: 8, cholesterol: 0 },
          { name: 'Greek Yogurt Parfait with Granola', calories: 240, protein: 18, carbs: 28, fat: 6, cholesterol: 8 },
          { name: 'Egg White Omelette with Spinach', calories: 200, protein: 22, carbs: 6, fat: 8, cholesterol: 0 },
          { name: 'Protein Smoothie Bowl', calories: 260, protein: 20, carbs: 32, fat: 4, cholesterol: 0 },
          { name: 'Whole Grain Toast with Avocado', calories: 220, protein: 8, carbs: 28, fat: 10, cholesterol: 0 },
          { name: 'Chia Pudding with Berries', calories: 180, protein: 6, carbs: 24, fat: 8, cholesterol: 0 },
          { name: 'Quinoa Breakfast Bowl', calories: 250, protein: 12, carbs: 38, fat: 6, cholesterol: 0 },
          { name: 'Almond Butter Banana Toast', calories: 240, protein: 8, carbs: 32, fat: 10, cholesterol: 0 },
          { name: 'Coconut Yogurt with Mango', calories: 200, protein: 6, carbs: 26, fat: 8, cholesterol: 0 },
          { name: 'Protein Oatmeal with Cinnamon', calories: 260, protein: 16, carbs: 36, fat: 6, cholesterol: 0 },
          { name: 'Avocado Toast with Microgreens', calories: 230, protein: 8, carbs: 24, fat: 12, cholesterol: 0 },
          { name: 'Berry Protein Bowl', calories: 220, protein: 14, carbs: 28, fat: 6, cholesterol: 0 },
          { name: 'Sweet Potato Toast', calories: 200, protein: 6, carbs: 32, fat: 6, cholesterol: 0 },
          { name: 'Coconut Chia Pudding', calories: 190, protein: 8, carbs: 22, fat: 8, cholesterol: 0 },
          { name: 'Protein Waffles with Berries', calories: 270, protein: 18, carbs: 32, fat: 8, cholesterol: 0 },
          { name: 'Almond Milk Oatmeal', calories: 210, protein: 8, carbs: 34, fat: 6, cholesterol: 0 },
          { name: 'Greek Yogurt with Honey', calories: 180, protein: 16, carbs: 20, fat: 4, cholesterol: 8 },
          { name: 'Protein Granola Bowl', calories: 240, protein: 12, carbs: 30, fat: 8, cholesterol: 0 },
          { name: 'Banana Nut Oatmeal', calories: 230, protein: 8, carbs: 36, fat: 8, cholesterol: 0 },
          { name: 'Coconut Protein Bowl', calories: 200, protein: 10, carbs: 24, fat: 8, cholesterol: 0 },
          { name: 'Berry Almond Toast', calories: 220, protein: 6, carbs: 28, fat: 10, cholesterol: 0 },
          { name: 'Protein Rice Bowl', calories: 250, protein: 14, carbs: 36, fat: 6, cholesterol: 0 },
          { name: 'Avocado Protein Toast', calories: 240, protein: 10, carbs: 26, fat: 12, cholesterol: 0 },
          { name: 'Cinnamon Apple Oatmeal', calories: 210, protein: 6, carbs: 32, fat: 6, cholesterol: 0 },
          { name: 'Protein Muesli Bowl', calories: 230, protein: 12, carbs: 28, fat: 8, cholesterol: 0 },
          { name: 'Almond Butter Protein Toast', calories: 250, protein: 12, carbs: 30, fat: 10, cholesterol: 0 },
          { name: 'Berry Coconut Bowl', calories: 200, protein: 8, carbs: 26, fat: 8, cholesterol: 0 },
          { name: 'Protein Quinoa Bowl', calories: 240, protein: 14, carbs: 32, fat: 6, cholesterol: 0 },
          { name: 'Honey Almond Toast', calories: 220, protein: 6, carbs: 28, fat: 10, cholesterol: 0 },
          { name: 'Coconut Protein Pudding', calories: 190, protein: 10, carbs: 24, fat: 6, cholesterol: 0 },
          { name: 'Berry Protein Toast', calories: 230, protein: 8, carbs: 30, fat: 8, cholesterol: 0 },
          { name: 'Almond Milk Protein Bowl', calories: 210, protein: 12, carbs: 26, fat: 6, cholesterol: 0 }
        ],
        regular: [
          { name: 'Scrambled Eggs with Whole Grain Toast', calories: 320, protein: 18, carbs: 28, fat: 16, cholesterol: 380 },
          { name: 'Protein Pancakes with Berries', calories: 340, protein: 16, carbs: 42, fat: 10, cholesterol: 45 },
          { name: 'Breakfast Burrito with Turkey', calories: 380, protein: 22, carbs: 32, fat: 18, cholesterol: 120 },
          { name: 'Cottage Cheese with Fruit', calories: 200, protein: 20, carbs: 18, fat: 4, cholesterol: 15 },
          { name: 'Protein Smoothie', calories: 240, protein: 24, carbs: 22, fat: 4, cholesterol: 0 },
          { name: 'Bacon & Egg Sandwich', calories: 360, protein: 20, carbs: 26, fat: 20, cholesterol: 420 },
          { name: 'French Toast with Syrup', calories: 320, protein: 12, carbs: 44, fat: 12, cholesterol: 180 },
          { name: 'Sausage & Egg Muffin', calories: 340, protein: 18, carbs: 24, fat: 22, cholesterol: 380 },
          { name: 'Breakfast Quesadilla', calories: 400, protein: 24, carbs: 28, fat: 24, cholesterol: 280 },
          { name: 'Ham & Cheese Omelette', calories: 320, protein: 22, carbs: 8, fat: 24, cholesterol: 420 },
          { name: 'Protein French Toast', calories: 300, protein: 20, carbs: 32, fat: 12, cholesterol: 120 },
          { name: 'Breakfast Sandwich with Bacon', calories: 380, protein: 24, carbs: 28, fat: 22, cholesterol: 360 },
          { name: 'Protein Waffles with Butter', calories: 320, protein: 18, carbs: 36, fat: 12, cholesterol: 60 },
          { name: 'Sausage & Potato Hash', calories: 360, protein: 16, carbs: 24, fat: 26, cholesterol: 280 },
          { name: 'Breakfast Pizza', calories: 420, protein: 20, carbs: 32, fat: 28, cholesterol: 240 },
          { name: 'Protein Pancakes with Syrup', calories: 340, protein: 20, carbs: 38, fat: 10, cholesterol: 45 },
          { name: 'Bacon & Egg Bowl', calories: 320, protein: 18, carbs: 12, fat: 24, cholesterol: 380 },
          { name: 'Breakfast Tacos', calories: 380, protein: 22, carbs: 30, fat: 20, cholesterol: 320 },
          { name: 'Protein French Toast Sticks', calories: 300, protein: 16, carbs: 34, fat: 10, cholesterol: 90 },
          { name: 'Sausage & Egg Casserole', calories: 340, protein: 20, carbs: 16, fat: 24, cholesterol: 280 },
          { name: 'Breakfast Burrito Supreme', calories: 420, protein: 26, carbs: 36, fat: 22, cholesterol: 360 },
          { name: 'Protein Waffles with Berries', calories: 320, protein: 18, carbs: 34, fat: 10, cholesterol: 45 },
          { name: 'Bacon & Egg Muffin', calories: 360, protein: 20, carbs: 26, fat: 22, cholesterol: 380 },
          { name: 'Breakfast Quesadilla Supreme', calories: 440, protein: 28, carbs: 32, fat: 26, cholesterol: 320 },
          { name: 'Ham & Cheese Breakfast Bowl', calories: 340, protein: 24, carbs: 12, fat: 26, cholesterol: 420 },
          { name: 'Protein French Toast with Berries', calories: 320, protein: 20, carbs: 36, fat: 10, cholesterol: 90 },
          { name: 'Sausage & Egg Sandwich', calories: 400, protein: 26, carbs: 30, fat: 24, cholesterol: 360 },
          { name: 'Breakfast Pizza Supreme', calories: 460, protein: 24, carbs: 36, fat: 30, cholesterol: 280 },
          { name: 'Protein Pancakes with Butter', calories: 360, protein: 22, carbs: 40, fat: 12, cholesterol: 60 },
          { name: 'Bacon & Egg Hash', calories: 380, protein: 20, carbs: 16, fat: 28, cholesterol: 420 },
          { name: 'Breakfast Tacos Supreme', calories: 420, protein: 26, carbs: 34, fat: 22, cholesterol: 360 },
          { name: 'Protein French Toast with Syrup', calories: 340, protein: 18, carbs: 38, fat: 10, cholesterol: 90 },
          { name: 'Sausage & Egg Burrito', calories: 440, protein: 28, carbs: 38, fat: 24, cholesterol: 380 },
          { name: 'Breakfast Quesadilla Deluxe', calories: 480, protein: 30, carbs: 36, fat: 28, cholesterol: 360 },
          { name: 'Ham & Cheese Breakfast Sandwich', calories: 380, protein: 26, carbs: 28, fat: 22, cholesterol: 420 },
          { name: 'Protein Waffles with Syrup', calories: 340, protein: 20, carbs: 36, fat: 10, cholesterol: 60 },
          { name: 'Bacon & Egg Breakfast Bowl', calories: 360, protein: 22, carbs: 14, fat: 26, cholesterol: 380 },
          { name: 'Breakfast Pizza Deluxe', calories: 500, protein: 26, carbs: 40, fat: 32, cholesterol: 320 },
          { name: 'Protein Pancakes Deluxe', calories: 380, protein: 24, carbs: 42, fat: 12, cholesterol: 75 },
          { name: 'Sausage & Egg Supreme', calories: 420, protein: 28, carbs: 20, fat: 30, cholesterol: 420 }
        ]
      },
      lunch: {
        lowCholesterol: [
          { name: 'Grilled Chicken Caesar Salad', calories: 320, protein: 28, carbs: 18, fat: 14, cholesterol: 35 },
          { name: 'Quinoa Buddha Bowl', calories: 360, protein: 14, carbs: 52, fat: 10, cholesterol: 0 },
          { name: 'Tuna Salad with Mixed Greens', calories: 280, protein: 24, carbs: 12, fat: 14, cholesterol: 42 },
          { name: 'Mediterranean Wrap', calories: 340, protein: 12, carbs: 44, fat: 12, cholesterol: 0 },
          { name: 'Lentil Soup with Whole Grain Bread', calories: 300, protein: 16, carbs: 48, fat: 6, cholesterol: 0 },
          { name: 'Grilled Fish Tacos', calories: 320, protein: 26, carbs: 28, fat: 12, cholesterol: 48 },
          { name: 'Avocado Chickpea Salad', calories: 280, protein: 12, carbs: 32, fat: 14, cholesterol: 0 },
          { name: 'Black Bean Quinoa Bowl', calories: 340, protein: 16, carbs: 48, fat: 8, cholesterol: 0 },
          { name: 'Grilled Salmon Salad', calories: 300, protein: 26, carbs: 16, fat: 16, cholesterol: 55 },
          { name: 'Vegetarian Sushi Roll', calories: 260, protein: 8, carbs: 44, fat: 6, cholesterol: 0 },
          { name: 'Tofu Stir-Fry Bowl', calories: 320, protein: 18, carbs: 36, fat: 12, cholesterol: 0 },
          { name: 'Greek Salad with Falafel', calories: 340, protein: 14, carbs: 38, fat: 14, cholesterol: 0 },
          { name: 'Sweet Potato Black Bean Bowl', calories: 360, protein: 12, carbs: 52, fat: 10, cholesterol: 0 },
          { name: 'Grilled Chicken Avocado Wrap', calories: 320, protein: 24, carbs: 28, fat: 14, cholesterol: 35 },
          { name: 'Lentil Curry Bowl', calories: 300, protein: 16, carbs: 44, fat: 8, cholesterol: 0 },
          { name: 'Mediterranean Quinoa Salad', calories: 280, protein: 10, carbs: 36, fat: 12, cholesterol: 0 },
          { name: 'Grilled Fish with Brown Rice', calories: 340, protein: 28, carbs: 32, fat: 12, cholesterol: 48 },
          { name: 'Chickpea Spinach Salad', calories: 260, protein: 12, carbs: 28, fat: 10, cholesterol: 0 },
          { name: 'Black Bean Sweet Potato Bowl', calories: 320, protein: 14, carbs: 46, fat: 8, cholesterol: 0 },
          { name: 'Grilled Salmon Quinoa Bowl', calories: 360, protein: 26, carbs: 34, fat: 14, cholesterol: 55 },
          { name: 'Vegetarian Buddha Bowl', calories: 300, protein: 12, carbs: 40, fat: 10, cholesterol: 0 },
          { name: 'Tofu Mediterranean Bowl', calories: 280, protein: 16, carbs: 32, fat: 10, cholesterol: 0 },
          { name: 'Greek Chickpea Salad', calories: 240, protein: 10, carbs: 26, fat: 10, cholesterol: 0 },
          { name: 'Sweet Potato Lentil Bowl', calories: 340, protein: 14, carbs: 48, fat: 8, cholesterol: 0 },
          { name: 'Grilled Chicken Quinoa Bowl', calories: 320, protein: 24, carbs: 30, fat: 12, cholesterol: 35 },
          { name: 'Lentil Avocado Bowl', calories: 280, protein: 12, carbs: 36, fat: 10, cholesterol: 0 },
          { name: 'Mediterranean Fish Bowl', calories: 300, protein: 22, carbs: 28, fat: 12, cholesterol: 42 },
          { name: 'Chickpea Quinoa Bowl', calories: 260, protein: 10, carbs: 32, fat: 8, cholesterol: 0 },
          { name: 'Black Bean Mediterranean Bowl', calories: 320, protein: 14, carbs: 42, fat: 10, cholesterol: 0 },
          { name: 'Grilled Salmon Sweet Potato Bowl', calories: 340, protein: 24, carbs: 30, fat: 14, cholesterol: 55 },
          { name: 'Vegetarian Quinoa Bowl', calories: 280, protein: 12, carbs: 38, fat: 8, cholesterol: 0 },
          { name: 'Tofu Buddha Bowl', calories: 300, protein: 16, carbs: 34, fat: 10, cholesterol: 0 },
          { name: 'Greek Lentil Bowl', calories: 260, protein: 12, carbs: 30, fat: 8, cholesterol: 0 },
          { name: 'Sweet Potato Chickpea Bowl', calories: 320, protein: 10, carbs: 44, fat: 10, cholesterol: 0 },
          { name: 'Grilled Chicken Mediterranean Bowl', calories: 300, protein: 22, carbs: 26, fat: 12, cholesterol: 35 }
        ],
        regular: [
          { name: 'Turkey & Avocado Sandwich', calories: 380, protein: 24, carbs: 38, fat: 16, cholesterol: 50 },
          { name: 'Chicken & Rice Bowl', calories: 420, protein: 28, carbs: 42, fat: 18, cholesterol: 85 },
          { name: 'Lean Beef Burger with Sweet Potato Fries', calories: 460, protein: 30, carbs: 38, fat: 22, cholesterol: 70 },
          { name: 'Salmon Salad with Mixed Greens', calories: 340, protein: 26, carbs: 16, fat: 18, cholesterol: 55 },
          { name: 'Protein Bowl with Quinoa', calories: 400, protein: 22, carbs: 46, fat: 14, cholesterol: 0 },
          { name: 'Grilled Chicken Club Sandwich', calories: 440, protein: 32, carbs: 42, fat: 20, cholesterol: 85 },
          { name: 'Beef & Broccoli Stir-Fry', calories: 480, protein: 34, carbs: 44, fat: 24, cholesterol: 75 },
          { name: 'Tuna Melt with Fries', calories: 420, protein: 28, carbs: 38, fat: 18, cholesterol: 65 },
          { name: 'Pork Chop with Mashed Potatoes', calories: 460, protein: 30, carbs: 36, fat: 26, cholesterol: 80 },
          { name: 'Shrimp Pasta Primavera', calories: 400, protein: 24, carbs: 48, fat: 16, cholesterol: 90 },
          { name: 'Chicken Caesar Wrap', calories: 380, protein: 26, carbs: 34, fat: 18, cholesterol: 60 },
          { name: 'Beef Tacos with Rice', calories: 440, protein: 32, carbs: 40, fat: 20, cholesterol: 70 },
          { name: 'Salmon Burger with Fries', calories: 420, protein: 28, carbs: 36, fat: 22, cholesterol: 65 },
          { name: 'Turkey Meatball Sub', calories: 460, protein: 30, carbs: 44, fat: 20, cholesterol: 75 },
          { name: 'Chicken Quesadilla', calories: 400, protein: 24, carbs: 38, fat: 18, cholesterol: 55 },
          { name: 'Beef & Rice Bowl', calories: 480, protein: 34, carbs: 46, fat: 22, cholesterol: 80 },
          { name: 'Tuna Salad Sandwich', calories: 360, protein: 26, carbs: 32, fat: 16, cholesterol: 60 },
          { name: 'Pork Tenderloin Sandwich', calories: 420, protein: 28, carbs: 36, fat: 20, cholesterol: 70 },
          { name: 'Shrimp Fried Rice', calories: 440, protein: 26, carbs: 48, fat: 18, cholesterol: 85 },
          { name: 'Chicken Parmesan', calories: 460, protein: 32, carbs: 40, fat: 24, cholesterol: 90 },
          { name: 'Beef Stir-Fry with Noodles', calories: 500, protein: 36, carbs: 50, fat: 24, cholesterol: 75 },
          { name: 'Tuna Melt with Chips', calories: 400, protein: 24, carbs: 34, fat: 20, cholesterol: 65 },
          { name: 'Pork Chop Sandwich', calories: 440, protein: 30, carbs: 38, fat: 22, cholesterol: 80 },
          { name: 'Shrimp Tacos', calories: 380, protein: 22, carbs: 36, fat: 16, cholesterol: 90 },
          { name: 'Chicken Fried Rice', calories: 420, protein: 28, carbs: 44, fat: 18, cholesterol: 85 },
          { name: 'Beef & Broccoli Bowl', calories: 460, protein: 32, carbs: 42, fat: 22, cholesterol: 75 },
          { name: 'Tuna Pasta Salad', calories: 360, protein: 26, carbs: 30, fat: 16, cholesterol: 60 },
          { name: 'Pork & Rice Bowl', calories: 480, protein: 34, carbs: 48, fat: 24, cholesterol: 80 },
          { name: 'Shrimp Stir-Fry', calories: 400, protein: 24, carbs: 40, fat: 18, cholesterol: 85 },
          { name: 'Chicken & Broccoli Bowl', calories: 440, protein: 30, carbs: 40, fat: 20, cholesterol: 85 },
          { name: 'Beef Tacos Supreme', calories: 480, protein: 36, carbs: 44, fat: 24, cholesterol: 80 },
          { name: 'Tuna Rice Bowl', calories: 380, protein: 28, carbs: 34, fat: 16, cholesterol: 65 },
          { name: 'Pork & Noodles', calories: 460, protein: 32, carbs: 46, fat: 22, cholesterol: 80 },
          { name: 'Shrimp Rice Bowl', calories: 420, protein: 26, carbs: 44, fat: 18, cholesterol: 90 },
          { name: 'Chicken & Noodles', calories: 400, protein: 28, carbs: 38, fat: 18, cholesterol: 85 },
          { name: 'Beef & Rice Supreme', calories: 520, protein: 38, carbs: 50, fat: 26, cholesterol: 85 },
          { name: 'Tuna & Rice Bowl', calories: 360, protein: 26, carbs: 32, fat: 14, cholesterol: 60 },
          { name: 'Pork & Broccoli Bowl', calories: 440, protein: 30, carbs: 40, fat: 22, cholesterol: 80 },
          { name: 'Shrimp & Broccoli Bowl', calories: 380, protein: 24, carbs: 36, fat: 16, cholesterol: 90 },
          { name: 'Chicken & Broccoli Supreme', calories: 480, protein: 34, carbs: 44, fat: 24, cholesterol: 90 }
        ]
      },
      dinner: {
        lowCholesterol: [
          { name: 'Grilled Salmon with Brown Rice & Vegetables', calories: 420, protein: 32, carbs: 38, fat: 18, cholesterol: 58 },
          { name: 'Tofu Stir-Fry with Quinoa', calories: 380, protein: 20, carbs: 44, fat: 12, cholesterol: 0 },
          { name: 'Baked Cod with Sweet Potato', calories: 360, protein: 28, carbs: 32, fat: 14, cholesterol: 48 },
          { name: 'Lentil Curry with Brown Rice', calories: 400, protein: 18, carbs: 56, fat: 10, cholesterol: 0 },
          { name: 'Grilled Chicken with Roasted Vegetables', calories: 380, protein: 30, carbs: 28, fat: 16, cholesterol: 75 },
          { name: 'Vegetarian Chili with Cornbread', calories: 340, protein: 14, carbs: 48, fat: 8, cholesterol: 0 },
          { name: 'Grilled Fish with Quinoa', calories: 400, protein: 30, carbs: 36, fat: 16, cholesterol: 55 },
          { name: 'Chickpea Curry with Brown Rice', calories: 360, protein: 16, carbs: 52, fat: 8, cholesterol: 0 },
          { name: 'Baked Salmon with Sweet Potato', calories: 440, protein: 34, carbs: 34, fat: 20, cholesterol: 65 },
          { name: 'Lentil Soup with Whole Grain Bread', calories: 320, protein: 18, carbs: 44, fat: 6, cholesterol: 0 },
          { name: 'Grilled Chicken with Quinoa', calories: 400, protein: 32, carbs: 30, fat: 18, cholesterol: 80 },
          { name: 'Vegetarian Stir-Fry with Brown Rice', calories: 340, protein: 12, carbs: 46, fat: 10, cholesterol: 0 },
          { name: 'Grilled Fish with Vegetables', calories: 380, protein: 28, carbs: 32, fat: 14, cholesterol: 50 },
          { name: 'Black Bean Curry with Quinoa', calories: 360, protein: 14, carbs: 48, fat: 8, cholesterol: 0 },
          { name: 'Baked Cod with Brown Rice', calories: 400, protein: 30, carbs: 36, fat: 16, cholesterol: 55 },
          { name: 'Lentil Stew with Sweet Potato', calories: 320, protein: 16, carbs: 42, fat: 6, cholesterol: 0 },
          { name: 'Grilled Chicken with Brown Rice', calories: 420, protein: 34, carbs: 32, fat: 20, cholesterol: 85 },
          { name: 'Vegetarian Chili with Quinoa', calories: 340, protein: 14, carbs: 44, fat: 8, cholesterol: 0 },
          { name: 'Grilled Fish with Quinoa Bowl', calories: 400, protein: 30, carbs: 34, fat: 16, cholesterol: 55 },
          { name: 'Chickpea Stew with Brown Rice', calories: 360, protein: 16, carbs: 50, fat: 8, cholesterol: 0 },
          { name: 'Baked Salmon with Vegetables', calories: 440, protein: 34, carbs: 32, fat: 20, cholesterol: 65 },
          { name: 'Lentil Curry with Quinoa', calories: 320, protein: 18, carbs: 40, fat: 6, cholesterol: 0 },
          { name: 'Grilled Chicken with Sweet Potato', calories: 400, protein: 32, carbs: 30, fat: 18, cholesterol: 80 },
          { name: 'Vegetarian Soup with Brown Rice', calories: 340, protein: 12, carbs: 48, fat: 6, cholesterol: 0 },
          { name: 'Grilled Fish with Brown Rice Bowl', calories: 380, protein: 28, carbs: 34, fat: 14, cholesterol: 50 },
          { name: 'Black Bean Stew with Quinoa', calories: 360, protein: 14, carbs: 46, fat: 8, cholesterol: 0 },
          { name: 'Baked Cod with Quinoa', calories: 400, protein: 30, carbs: 36, fat: 16, cholesterol: 55 },
          { name: 'Lentil Chili with Sweet Potato', calories: 320, protein: 16, carbs: 40, fat: 6, cholesterol: 0 },
          { name: 'Grilled Chicken with Vegetables Bowl', calories: 420, protein: 34, carbs: 30, fat: 20, cholesterol: 85 },
          { name: 'Vegetarian Curry with Brown Rice', calories: 340, protein: 14, carbs: 42, fat: 8, cholesterol: 0 },
          { name: 'Grilled Fish with Sweet Potato Bowl', calories: 400, protein: 30, carbs: 32, fat: 16, cholesterol: 55 },
          { name: 'Chickpea Curry with Quinoa', calories: 360, protein: 16, carbs: 48, fat: 8, cholesterol: 0 },
          { name: 'Baked Salmon with Brown Rice Bowl', calories: 440, protein: 34, carbs: 34, fat: 20, cholesterol: 65 },
          { name: 'Lentil Soup with Quinoa', calories: 320, protein: 18, carbs: 38, fat: 6, cholesterol: 0 },
          { name: 'Grilled Chicken with Quinoa Bowl', calories: 400, protein: 32, carbs: 28, fat: 18, cholesterol: 80 },
          { name: 'Vegetarian Stew with Sweet Potato', calories: 340, protein: 12, carbs: 44, fat: 6, cholesterol: 0 },
          { name: 'Grilled Fish with Vegetables Bowl', calories: 380, protein: 28, carbs: 30, fat: 14, cholesterol: 50 },
          { name: 'Black Bean Curry with Brown Rice', calories: 360, protein: 14, carbs: 44, fat: 8, cholesterol: 0 },
          { name: 'Baked Cod with Sweet Potato Bowl', calories: 400, protein: 30, carbs: 34, fat: 16, cholesterol: 55 },
          { name: 'Lentil Curry with Vegetables', calories: 320, protein: 16, carbs: 36, fat: 6, cholesterol: 0 },
          { name: 'Grilled Chicken with Brown Rice Bowl', calories: 420, protein: 34, carbs: 28, fat: 20, cholesterol: 85 },
          { name: 'Vegetarian Chili with Quinoa Bowl', calories: 340, protein: 14, carbs: 40, fat: 8, cholesterol: 0 }
        ],
        regular: [
          { name: 'Grilled Chicken with Pasta Primavera', calories: 480, protein: 32, carbs: 48, fat: 20, cholesterol: 78 },
          { name: 'Lean Beef Steak with Mashed Potatoes', calories: 520, protein: 38, carbs: 34, fat: 28, cholesterol: 65 },
          { name: 'Pork Tenderloin with Roasted Vegetables', calories: 440, protein: 30, carbs: 32, fat: 22, cholesterol: 68 },
          { name: 'Shrimp Scampi with Whole Grain Pasta', calories: 460, protein: 26, carbs: 44, fat: 20, cholesterol: 85 },
          { name: 'Turkey Meatballs with Spaghetti', calories: 420, protein: 28, carbs: 42, fat: 18, cholesterol: 72 },
          { name: 'Grilled Salmon with Rice Pilaf', calories: 500, protein: 34, carbs: 46, fat: 22, cholesterol: 75 },
          { name: 'Beef Stir-Fry with Noodles', calories: 540, protein: 40, carbs: 52, fat: 26, cholesterol: 70 },
          { name: 'Chicken Parmesan with Pasta', calories: 520, protein: 36, carbs: 50, fat: 24, cholesterol: 85 },
          { name: 'Pork Chops with Mashed Potatoes', calories: 480, protein: 32, carbs: 38, fat: 26, cholesterol: 75 },
          { name: 'Shrimp Fried Rice', calories: 460, protein: 28, carbs: 48, fat: 18, cholesterol: 90 },
          { name: 'Beef Tacos with Rice', calories: 500, protein: 36, carbs: 44, fat: 24, cholesterol: 75 },
          { name: 'Chicken Alfredo with Pasta', calories: 540, protein: 34, carbs: 54, fat: 26, cholesterol: 80 },
          { name: 'Pork Tenderloin with Rice', calories: 460, protein: 30, carbs: 36, fat: 22, cholesterol: 70 },
          { name: 'Shrimp Tacos with Rice', calories: 420, protein: 24, carbs: 40, fat: 16, cholesterol: 95 },
          { name: 'Beef & Broccoli with Rice', calories: 480, protein: 34, carbs: 46, fat: 22, cholesterol: 70 },
          { name: 'Chicken Stir-Fry with Noodles', calories: 500, protein: 32, carbs: 50, fat: 20, cholesterol: 75 },
          { name: 'Pork Chops with Vegetables', calories: 440, protein: 28, carbs: 34, fat: 24, cholesterol: 70 },
          { name: 'Shrimp Scampi with Rice', calories: 480, protein: 26, carbs: 48, fat: 20, cholesterol: 85 },
          { name: 'Beef Steak with Potatoes', calories: 560, protein: 40, carbs: 38, fat: 30, cholesterol: 75 },
          { name: 'Chicken Fried Rice', calories: 460, protein: 30, carbs: 44, fat: 18, cholesterol: 80 },
          { name: 'Pork Tenderloin with Pasta', calories: 500, protein: 32, carbs: 46, fat: 24, cholesterol: 70 },
          { name: 'Shrimp & Broccoli with Rice', calories: 420, protein: 24, carbs: 40, fat: 16, cholesterol: 90 },
          { name: 'Beef & Rice Bowl', calories: 520, protein: 38, carbs: 48, fat: 26, cholesterol: 75 },
          { name: 'Chicken & Broccoli with Rice', calories: 480, protein: 34, carbs: 44, fat: 22, cholesterol: 80 },
          { name: 'Pork Chops with Rice', calories: 460, protein: 30, carbs: 38, fat: 24, cholesterol: 70 },
          { name: 'Shrimp Stir-Fry with Noodles', calories: 440, protein: 26, carbs: 42, fat: 18, cholesterol: 85 },
          { name: 'Beef & Noodles', calories: 540, protein: 40, carbs: 50, fat: 28, cholesterol: 75 },
          { name: 'Chicken & Rice Bowl', calories: 500, protein: 36, carbs: 46, fat: 24, cholesterol: 80 },
          { name: 'Pork & Broccoli with Rice', calories: 480, protein: 32, carbs: 42, fat: 24, cholesterol: 70 },
          { name: 'Shrimp & Rice Bowl', calories: 460, protein: 28, carbs: 44, fat: 18, cholesterol: 90 },
          { name: 'Beef & Broccoli Bowl', calories: 520, protein: 38, carbs: 46, fat: 26, cholesterol: 75 },
          { name: 'Chicken & Noodles', calories: 480, protein: 34, carbs: 42, fat: 20, cholesterol: 80 },
          { name: 'Pork & Rice Bowl', calories: 500, protein: 34, carbs: 48, fat: 26, cholesterol: 75 },
          { name: 'Shrimp & Broccoli Bowl', calories: 440, protein: 26, carbs: 40, fat: 16, cholesterol: 90 },
          { name: 'Beef & Rice Supreme', calories: 560, protein: 42, carbs: 50, fat: 30, cholesterol: 80 },
          { name: 'Chicken & Broccoli Supreme', calories: 520, protein: 38, carbs: 46, fat: 26, cholesterol: 85 },
          { name: 'Pork & Broccoli Supreme', calories: 500, protein: 36, carbs: 44, fat: 24, cholesterol: 75 },
          { name: 'Shrimp & Rice Supreme', calories: 480, protein: 30, carbs: 46, fat: 20, cholesterol: 95 }
        ]
      },
      snack: {
        lowCholesterol: [
          { name: 'Apple with Almond Butter', calories: 160, protein: 4, carbs: 22, fat: 8, cholesterol: 0 },
          { name: 'Carrot Sticks with Hummus', calories: 140, protein: 4, carbs: 18, fat: 6, cholesterol: 0 },
          { name: 'Greek Yogurt with Berries', calories: 120, protein: 14, carbs: 10, fat: 3, cholesterol: 6 },
          { name: 'Mixed Nuts & Dried Fruit', calories: 180, protein: 6, carbs: 16, fat: 12, cholesterol: 0 },
          { name: 'Protein Smoothie', calories: 160, protein: 16, carbs: 14, fat: 4, cholesterol: 0 },
          { name: 'Rice Cakes with Peanut Butter', calories: 140, protein: 4, carbs: 18, fat: 6, cholesterol: 0 },
          { name: 'Banana with Almond Butter', calories: 180, protein: 6, carbs: 24, fat: 8, cholesterol: 0 },
          { name: 'Celery Sticks with Hummus', calories: 120, protein: 4, carbs: 16, fat: 6, cholesterol: 0 },
          { name: 'Coconut Yogurt with Berries', calories: 140, protein: 8, carbs: 12, fat: 6, cholesterol: 0 },
          { name: 'Almonds & Dried Cranberries', calories: 200, protein: 8, carbs: 18, fat: 14, cholesterol: 0 },
          { name: 'Protein Shake', calories: 180, protein: 18, carbs: 16, fat: 4, cholesterol: 0 },
          { name: 'Rice Cakes with Almond Butter', calories: 160, protein: 6, carbs: 20, fat: 8, cholesterol: 0 },
          { name: 'Pear with Peanut Butter', calories: 170, protein: 5, carbs: 23, fat: 8, cholesterol: 0 },
          { name: 'Cucumber Slices with Hummus', calories: 110, protein: 3, carbs: 14, fat: 5, cholesterol: 0 },
          { name: 'Almond Yogurt with Berries', calories: 130, protein: 6, carbs: 11, fat: 6, cholesterol: 0 },
          { name: 'Walnuts & Dried Apricots', calories: 190, protein: 7, carbs: 17, fat: 13, cholesterol: 0 },
          { name: 'Protein Bar', calories: 200, protein: 20, carbs: 18, fat: 8, cholesterol: 0 },
          { name: 'Rice Cakes with Cashew Butter', calories: 150, protein: 5, carbs: 19, fat: 7, cholesterol: 0 },
          { name: 'Orange with Almond Butter', calories: 170, protein: 5, carbs: 25, fat: 8, cholesterol: 0 },
          { name: 'Bell Pepper with Hummus', calories: 130, protein: 4, carbs: 17, fat: 6, cholesterol: 0 },
          { name: 'Cashew Yogurt with Berries', calories: 150, protein: 7, carbs: 13, fat: 7, cholesterol: 0 },
          { name: 'Pistachios & Dried Mango', calories: 210, protein: 8, carbs: 19, fat: 15, cholesterol: 0 },
          { name: 'Protein Smoothie Bowl', calories: 220, protein: 22, carbs: 20, fat: 6, cholesterol: 0 },
          { name: 'Rice Cakes with Sunflower Butter', calories: 140, protein: 4, carbs: 18, fat: 6, cholesterol: 0 },
          { name: 'Grapes with Almond Butter', calories: 160, protein: 4, carbs: 22, fat: 8, cholesterol: 0 },
          { name: 'Cherry Tomatoes with Hummus', calories: 120, protein: 3, carbs: 15, fat: 5, cholesterol: 0 },
          { name: 'Soy Yogurt with Berries', calories: 140, protein: 8, carbs: 12, fat: 6, cholesterol: 0 },
          { name: 'Cashews & Dried Pineapple', calories: 200, protein: 7, carbs: 18, fat: 14, cholesterol: 0 },
          { name: 'Protein Drink', calories: 160, protein: 16, carbs: 14, fat: 4, cholesterol: 0 },
          { name: 'Rice Cakes with Tahini', calories: 150, protein: 5, carbs: 19, fat: 7, cholesterol: 0 },
          { name: 'Strawberries with Almond Butter', calories: 150, protein: 4, carbs: 20, fat: 8, cholesterol: 0 },
          { name: 'Radish Slices with Hummus', calories: 110, protein: 3, carbs: 13, fat: 5, cholesterol: 0 },
          { name: 'Oat Yogurt with Berries', calories: 130, protein: 6, carbs: 11, fat: 6, cholesterol: 0 },
          { name: 'Macadamia Nuts & Dried Figs', calories: 220, protein: 6, carbs: 20, fat: 16, cholesterol: 0 },
          { name: 'Protein Shake with Berries', calories: 180, protein: 18, carbs: 16, fat: 4, cholesterol: 0 },
          { name: 'Rice Cakes with Coconut Butter', calories: 160, protein: 4, carbs: 20, fat: 8, cholesterol: 0 },
          { name: 'Blueberries with Almond Butter', calories: 140, protein: 4, carbs: 18, fat: 8, cholesterol: 0 },
          { name: 'Zucchini Slices with Hummus', calories: 120, protein: 4, carbs: 15, fat: 6, cholesterol: 0 },
          { name: 'Hemp Yogurt with Berries', calories: 150, protein: 8, carbs: 13, fat: 7, cholesterol: 0 },
          { name: 'Pecans & Dried Cherries', calories: 190, protein: 6, carbs: 17, fat: 13, cholesterol: 0 },
          { name: 'Protein Bar with Nuts', calories: 220, protein: 22, carbs: 20, fat: 10, cholesterol: 0 },
          { name: 'Rice Cakes with Hazelnut Butter', calories: 170, protein: 6, carbs: 21, fat: 9, cholesterol: 0 }
        ],
        regular: [
          { name: 'Mixed Nuts & Seeds', calories: 200, protein: 8, carbs: 10, fat: 18, cholesterol: 0 },
          { name: 'Cheese & Whole Grain Crackers', calories: 220, protein: 10, carbs: 18, fat: 14, cholesterol: 28 },
          { name: 'Trail Mix with Dark Chocolate', calories: 180, protein: 6, carbs: 20, fat: 10, cholesterol: 0 },
          { name: 'Protein Bar', calories: 200, protein: 16, carbs: 18, fat: 8, cholesterol: 0 },
          { name: 'Smoothie with Protein Powder', calories: 160, protein: 18, carbs: 12, fat: 4, cholesterol: 0 },
          { name: 'Peanut Butter & Jelly Sandwich', calories: 240, protein: 8, carbs: 32, fat: 10, cholesterol: 0 },
          { name: 'Cheese & Apple Slices', calories: 200, protein: 8, carbs: 22, fat: 12, cholesterol: 25 },
          { name: 'Trail Mix with M&Ms', calories: 220, protein: 6, carbs: 24, fat: 12, cholesterol: 0 },
          { name: 'Protein Shake', calories: 180, protein: 20, carbs: 14, fat: 4, cholesterol: 0 },
          { name: 'Yogurt with Granola', calories: 200, protein: 12, carbs: 24, fat: 8, cholesterol: 15 },
          { name: 'Peanut Butter & Banana', calories: 220, protein: 8, carbs: 26, fat: 12, cholesterol: 0 },
          { name: 'Cheese & Crackers', calories: 240, protein: 12, carbs: 20, fat: 16, cholesterol: 30 },
          { name: 'Trail Mix with Raisins', calories: 200, protein: 6, carbs: 22, fat: 10, cholesterol: 0 },
          { name: 'Protein Bar with Nuts', calories: 220, protein: 18, carbs: 20, fat: 10, cholesterol: 0 },
          { name: 'Smoothie with Berries', calories: 180, protein: 16, carbs: 16, fat: 4, cholesterol: 0 },
          { name: 'Peanut Butter & Celery', calories: 180, protein: 6, carbs: 20, fat: 10, cholesterol: 0 },
          { name: 'Cheese & Grapes', calories: 200, protein: 10, carbs: 20, fat: 12, cholesterol: 25 },
          { name: 'Trail Mix with Coconut', calories: 240, protein: 8, carbs: 26, fat: 14, cholesterol: 0 },
          { name: 'Protein Drink', calories: 160, protein: 18, carbs: 12, fat: 4, cholesterol: 0 },
          { name: 'Yogurt with Honey', calories: 180, protein: 10, carbs: 22, fat: 6, cholesterol: 12 },
          { name: 'Peanut Butter & Crackers', calories: 200, protein: 6, carbs: 24, fat: 10, cholesterol: 0 },
          { name: 'Cheese & Pear Slices', calories: 220, protein: 12, carbs: 24, fat: 14, cholesterol: 28 },
          { name: 'Trail Mix with Almonds', calories: 200, protein: 8, carbs: 18, fat: 12, cholesterol: 0 },
          { name: 'Protein Bar with Chocolate', calories: 240, protein: 20, carbs: 22, fat: 12, cholesterol: 0 },
          { name: 'Smoothie with Banana', calories: 200, protein: 18, carbs: 18, fat: 4, cholesterol: 0 },
          { name: 'Peanut Butter & Apple', calories: 200, protein: 6, carbs: 24, fat: 10, cholesterol: 0 },
          { name: 'Cheese & Orange Slices', calories: 200, protein: 10, carbs: 22, fat: 12, cholesterol: 25 },
          { name: 'Trail Mix with Cashews', calories: 220, protein: 8, carbs: 20, fat: 14, cholesterol: 0 },
          { name: 'Protein Shake with Berries', calories: 180, protein: 20, carbs: 14, fat: 4, cholesterol: 0 },
          { name: 'Yogurt with Berries', calories: 160, protein: 12, carbs: 18, fat: 6, cholesterol: 10 },
          { name: 'Peanut Butter & Honey', calories: 220, protein: 6, carbs: 26, fat: 12, cholesterol: 0 },
          { name: 'Cheese & Strawberries', calories: 180, protein: 8, carbs: 18, fat: 10, cholesterol: 22 },
          { name: 'Trail Mix with Walnuts', calories: 200, protein: 6, carbs: 16, fat: 14, cholesterol: 0 },
          { name: 'Protein Bar with Berries', calories: 200, protein: 18, carbs: 18, fat: 8, cholesterol: 0 },
          { name: 'Smoothie with Protein', calories: 160, protein: 16, carbs: 12, fat: 4, cholesterol: 0 },
          { name: 'Peanut Butter & Crackers', calories: 180, protein: 6, carbs: 22, fat: 8, cholesterol: 0 },
          { name: 'Cheese & Blueberries', calories: 200, protein: 10, carbs: 20, fat: 12, cholesterol: 25 },
          { name: 'Trail Mix with Pistachios', calories: 220, protein: 8, carbs: 22, fat: 12, cholesterol: 0 },
          { name: 'Protein Drink with Nuts', calories: 200, protein: 20, carbs: 16, fat: 6, cholesterol: 0 },
          { name: 'Yogurt with Granola & Berries', calories: 240, protein: 14, carbs: 28, fat: 10, cholesterol: 15 },
          { name: 'Peanut Butter & Jelly Crackers', calories: 200, protein: 6, carbs: 24, fat: 10, cholesterol: 0 },
          { name: 'Cheese & Pineapple Slices', calories: 220, protein: 12, carbs: 24, fat: 14, cholesterol: 28 },
          { name: 'Trail Mix with Macadamia Nuts', calories: 240, protein: 6, carbs: 24, fat: 16, cholesterol: 0 },
          { name: 'Protein Bar with Nuts & Berries', calories: 260, protein: 22, carbs: 24, fat: 14, cholesterol: 0 },
          { name: 'Smoothie with Protein & Berries', calories: 200, protein: 20, carbs: 18, fat: 4, cholesterol: 0 },
          { name: 'Peanut Butter & Banana Sandwich', calories: 260, protein: 10, carbs: 30, fat: 14, cholesterol: 0 },
          { name: 'Cheese & Mixed Berries', calories: 200, protein: 10, carbs: 20, fat: 12, cholesterol: 25 },
          { name: 'Trail Mix Supreme', calories: 260, protein: 8, carbs: 28, fat: 16, cholesterol: 0 },
          { name: 'Protein Shake Supreme', calories: 220, protein: 24, carbs: 20, fat: 6, cholesterol: 0 },
          { name: 'Yogurt Parfait', calories: 280, protein: 16, carbs: 32, fat: 12, cholesterol: 18 }
        ]
      },
      smoothie: {
        lowCholesterol: [
          { name: 'Berry Protein Smoothie', calories: 180, protein: 16, carbs: 20, fat: 4, cholesterol: 0 },
          { name: 'Green Detox Smoothie', calories: 140, protein: 8, carbs: 18, fat: 4, cholesterol: 0 },
          { name: 'Banana Almond Smoothie', calories: 200, protein: 12, carbs: 24, fat: 8, cholesterol: 0 },
          { name: 'Tropical Protein Smoothie', calories: 160, protein: 14, carbs: 18, fat: 4, cholesterol: 0 },
          { name: 'Chocolate Protein Smoothie', calories: 180, protein: 18, carbs: 16, fat: 6, cholesterol: 0 },
          { name: 'Strawberry Banana Smoothie', calories: 160, protein: 10, carbs: 22, fat: 4, cholesterol: 0 }
        ],
        regular: [
          { name: 'Berry Blast Protein Smoothie', calories: 200, protein: 18, carbs: 22, fat: 6, cholesterol: 0 },
          { name: 'Green Machine Smoothie', calories: 160, protein: 10, carbs: 20, fat: 4, cholesterol: 0 },
          { name: 'Peanut Butter Banana Smoothie', calories: 220, protein: 14, carbs: 26, fat: 10, cholesterol: 0 },
          { name: 'Tropical Paradise Smoothie', calories: 180, protein: 12, carbs: 20, fat: 6, cholesterol: 0 },
          { name: 'Chocolate Peanut Butter Smoothie', calories: 200, protein: 16, carbs: 18, fat: 8, cholesterol: 0 },
          { name: 'Strawberry Cheesecake Smoothie', calories: 180, protein: 12, carbs: 20, fat: 6, cholesterol: 0 }
        ]
      }
    };

    // Select appropriate template based on restrictions
    let templateKey = 'regular';
    if (lowCholesterol) templateKey = 'lowCholesterol';
    
    const templates = mealTemplates[mealType][templateKey];
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
        weeklyWorkouts: 4,
        focus: 'Cardio & Strength Building',
        exercises: [
          { 
            day: 1, 
            type: 'Cardio', 
            name: 'Brisk Walking', 
            duration: '30 minutes', 
            calories: 180, 
            intensity: 'Low',
            instructions: 'Walk at a pace where you can talk but not sing. Maintain good posture, swing your arms naturally, and take deep breaths. Start with 5 minutes warm-up, 20 minutes brisk walking, 5 minutes cool-down.'
          },
          { 
            day: 2, 
            type: 'Strength', 
            name: 'Bodyweight Circuit', 
            duration: '25 minutes', 
            calories: 120, 
            intensity: 'Low',
            instructions: 'Complete 3 rounds: 10 squats, 10 push-ups (modified if needed), 10 lunges each leg, 30-second plank, 10 glute bridges. Rest 1 minute between rounds.'
          },
          { 
            day: 3, 
            type: 'Cardio', 
            name: 'Stationary Cycling', 
            duration: '25 minutes', 
            calories: 200, 
            intensity: 'Low',
            instructions: '5 minutes warm-up at easy pace, 15 minutes moderate cycling (can talk comfortably), 5 minutes cool-down. Adjust resistance to maintain steady pace.'
          },
          { 
            day: 4, 
            type: 'Flexibility', 
            name: 'Gentle Yoga', 
            duration: '30 minutes', 
            calories: 100, 
            intensity: 'Low',
            instructions: 'Focus on breathing and gentle stretches. Include: cat-cow poses, child\'s pose, gentle twists, forward folds, and relaxation poses. Hold each pose for 30-60 seconds.'
          }
        ]
      },
      light: {
        weeklyWorkouts: 5,
        focus: 'Cardio & Toning',
        exercises: [
          { 
            day: 1, 
            type: 'Cardio', 
            name: 'Jogging/Walking Intervals', 
            duration: '35 minutes', 
            calories: 280, 
            intensity: 'Low-Medium',
            instructions: '5 minutes warm-up walk, then alternate: 2 minutes jogging, 3 minutes walking. Repeat 6 times. 5 minutes cool-down walk. Adjust pace to maintain conversation during walking intervals.'
          },
          { 
            day: 2, 
            type: 'Strength', 
            name: 'Dumbbell Training', 
            duration: '35 minutes', 
            calories: 180, 
            intensity: 'Medium',
            instructions: '3 sets each: 12 bicep curls, 12 shoulder presses, 12 squats with dumbbells, 12 rows, 12 tricep extensions. Rest 60 seconds between sets. Use weights that challenge you but allow proper form.'
          },
          { 
            day: 3, 
            type: 'Cardio', 
            name: 'Swimming', 
            duration: '30 minutes', 
            calories: 240, 
            intensity: 'Medium',
            instructions: '5 minutes warm-up with easy strokes, 20 minutes continuous swimming (freestyle or breaststroke), 5 minutes cool-down with gentle strokes. Focus on breathing rhythm and proper form.'
          },
          { 
            day: 4, 
            type: 'Strength', 
            name: 'Resistance Band Workout', 
            duration: '30 minutes', 
            calories: 160, 
            intensity: 'Medium',
            instructions: '3 rounds: 15 band rows, 15 band squats, 15 band chest presses, 15 band lateral raises, 30-second band plank. Rest 45 seconds between rounds. Maintain tension on band throughout movement.'
          },
          { 
            day: 5, 
            type: 'Flexibility', 
            name: 'Power Yoga', 
            duration: '45 minutes', 
            calories: 140, 
            intensity: 'Medium',
            instructions: 'Flow through sun salutations, warrior poses, balance poses, and strength-building sequences. Focus on breath-synchronized movement. Include 5 minutes meditation at the end.'
          }
        ]
      },
      moderate: {
        weeklyWorkouts: 6,
        focus: 'Strength & Cardio',
        exercises: [
          { 
            day: 1, 
            type: 'Strength', 
            name: 'Upper Body Focus', 
            duration: '45 minutes', 
            calories: 220, 
            intensity: 'Medium',
            instructions: '4 sets each: 10-12 bench press, 10-12 rows, 10-12 shoulder press, 10-12 lat pulldowns, 10-12 bicep curls, 10-12 tricep dips. Rest 90 seconds between sets. Progressive overload focus.'
          },
          { 
            day: 2, 
            type: 'Cardio', 
            name: 'Running', 
            duration: '40 minutes', 
            calories: 380, 
            intensity: 'Medium',
            instructions: '10 minutes easy warm-up, 25 minutes steady-state running at conversational pace, 5 minutes cool-down. Focus on proper running form: mid-foot strike, relaxed shoulders, steady breathing.'
          },
          { 
            day: 3, 
            type: 'Strength', 
            name: 'Lower Body Focus', 
            duration: '45 minutes', 
            calories: 220, 
            intensity: 'Medium',
            instructions: '4 sets each: 10-12 squats, 10-12 deadlifts, 10-12 lunges each leg, 10-12 leg press, 15 calf raises, 30-second wall sit. Rest 90 seconds between sets. Focus on proper form and depth.'
          },
          { 
            day: 4, 
            type: 'Cardio', 
            name: 'HIIT Training', 
            duration: '30 minutes', 
            calories: 320, 
            intensity: 'High',
            instructions: '5 minutes warm-up, then 8 rounds: 30 seconds high-intensity exercise (burpees, mountain climbers, or jumping jacks), 90 seconds rest. 5 minutes cool-down. Push hard during work intervals.'
          },
          { 
            day: 5, 
            type: 'Strength', 
            name: 'Full Body Circuit', 
            duration: '40 minutes', 
            calories: 240, 
            intensity: 'Medium',
            instructions: '3 rounds: 15 push-ups, 15 squats, 15 rows, 15 lunges, 15 shoulder presses, 30-second plank, 15 deadlifts. Rest 2 minutes between rounds. Minimal rest between exercises within rounds.'
          },
          { 
            day: 6, 
            type: 'Recovery', 
            name: 'Active Recovery & Stretching', 
            duration: '35 minutes', 
            calories: 100, 
            intensity: 'Low',
            instructions: '15 minutes light walking or cycling, then 20 minutes stretching: hamstrings, quads, calves, chest, back, shoulders. Hold each stretch 30-60 seconds. Focus on breathing and relaxation.'
          }
        ]
      },
      active: {
        weeklyWorkouts: 7,
        focus: 'Performance & Endurance',
        exercises: [
          { 
            day: 1, 
            type: 'Strength', 
            name: 'Full Body Strength', 
            duration: '60 minutes', 
            calories: 320, 
            intensity: 'High',
            instructions: '5 sets each: 8-10 deadlifts, 8-10 bench press, 8-10 squats, 8-10 pull-ups, 8-10 overhead press. Rest 3 minutes between sets. Focus on compound movements and progressive overload.'
          },
          { 
            day: 2, 
            type: 'Cardio', 
            name: 'Long Distance Run', 
            duration: '50 minutes', 
            calories: 480, 
            intensity: 'High',
            instructions: '10 minutes easy warm-up, 35 minutes steady-state running at moderate-high intensity, 5 minutes cool-down. Maintain consistent pace throughout. Focus on endurance and mental toughness.'
          },
          { 
            day: 3, 
            type: 'Strength', 
            name: 'Power Lifting', 
            duration: '55 minutes', 
            calories: 280, 
            intensity: 'High',
            instructions: '5 sets each: 5 deadlifts (heavy), 5 squats (heavy), 5 bench press (heavy). Rest 4-5 minutes between sets. Focus on explosive power and proper form. Use 85-90% of 1RM.'
          },
          { 
            day: 4, 
            type: 'Cardio', 
            name: 'High-Intensity Intervals', 
            duration: '35 minutes', 
            calories: 420, 
            intensity: 'High',
            instructions: '10 minutes warm-up, then 10 rounds: 1 minute all-out effort (sprinting, burpees, or rowing), 2 minutes active recovery. 5 minutes cool-down. Push to maximum effort during work intervals.'
          },
          { 
            day: 5, 
            type: 'Strength', 
            name: 'Functional Training', 
            duration: '50 minutes', 
            calories: 300, 
            intensity: 'High',
            instructions: '4 rounds: 20 kettlebell swings, 15 box jumps, 12 pull-ups, 10 thrusters, 8 Turkish get-ups each side. Rest 3 minutes between rounds. Focus on functional movement patterns.'
          },
          { 
            day: 6, 
            type: 'Cardio', 
            name: 'Cross Training', 
            duration: '45 minutes', 
            calories: 360, 
            intensity: 'Medium-High',
            instructions: 'Mix of activities: 15 minutes cycling, 15 minutes rowing, 15 minutes elliptical or stair climbing. Vary intensity throughout. Focus on different movement patterns and muscle groups.'
          },
          { 
            day: 7, 
            type: 'Recovery', 
            name: 'Active Recovery & Mobility', 
            duration: '40 minutes', 
            calories: 120, 
            intensity: 'Low',
            instructions: '20 minutes light swimming or cycling, then 20 minutes mobility work: hip openers, shoulder mobility, thoracic spine work, and foam rolling. Focus on recovery and injury prevention.'
          }
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
            <div class="meal-name">
              ${meal.name}
              ${meal.ingredients ? `<span class="info-icon" onclick="window.weightLossManager.showMealDetails('${meal.name.replace(/'/g, "\\'")}', '${meal.ingredients.join('|').replace(/'/g, "\\'")}', '${(meal.instructions || '').replace(/'/g, "\\'")}')" title="Click for recipe details">i</span>` : ''}
            </div>
            ${meal.ingredients ? `
              <div class="meal-ingredients">
                <strong>Ingredients:</strong>
                <ul>
                  ${meal.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            ${meal.instructions ? `
              <div class="meal-instructions">
                <strong>Instructions:</strong>
                <p>${meal.instructions}</p>
              </div>
            ` : ''}
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
            <div class="exercise-details">
              <span class="exercise-duration">${exercise.duration}</span>
              ${exercise.intensity ? `<span class="exercise-intensity intensity-${exercise.intensity.toLowerCase().replace('-', '')}">${exercise.intensity}</span>` : ''}
            </div>
            ${exercise.instructions ? `
              <div class="exercise-instructions">
                <strong>Instructions:</strong>
                <p>${exercise.instructions}</p>
              </div>
            ` : ''}
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

  showMealDetails(mealName, ingredients, instructions) {
    // Parse ingredients from string format
    const ingredientsList = ingredients.split('|');
    
    // Create modal for meal details
    const modal = document.createElement('div');
    modal.className = 'meal-details-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${mealName}</h3>
          <span class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
        </div>
        <div class="modal-body">
          <div class="ingredients-section">
            <h4>Ingredients:</h4>
            <ul>
              ${ingredientsList.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
          </div>
          ${instructions ? `
            <div class="instructions-section">
              <h4>Instructions:</h4>
              <p>${instructions}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
      .meal-details-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      .modal-content {
        background: white;
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
        max-height: 80%;
        overflow-y: auto;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
      }
      .close-btn {
        font-size: 24px;
        cursor: pointer;
        color: #666;
      }
      .close-btn:hover {
        color: #000;
      }
      .modal-body {
        padding: 20px;
      }
      .ingredients-section, .instructions-section {
        margin-bottom: 20px;
      }
      .ingredients-section h4, .instructions-section h4 {
        margin-bottom: 10px;
        color: #333;
      }
      .ingredients-section ul {
        list-style-type: disc;
        margin-left: 20px;
      }
      .ingredients-section li {
        margin-bottom: 5px;
      }
      .info-icon {
        cursor: pointer;
        margin-left: 8px;
        font-size: 18px;
        opacity: 0.8;
        transition: all 0.2s;
        background: #007bff;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
      }
      .info-icon:hover {
        opacity: 1;
        background: #0056b3;
        transform: scale(1.1);
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  generateSmoothie(targetCalories, restrictions) {
    const lowCholesterol = restrictions && restrictions.toLowerCase().includes('cholesterol');
    
    const smoothieRecipes = {
      lowCholesterol: [
        {
          name: 'Berry Protein Power Smoothie',
          ingredients: ['1 cup mixed berries', '1 scoop vanilla protein powder', '1 cup almond milk', '1 tbsp chia seeds'],
          instructions: 'Blend all ingredients until smooth. Add ice if desired.',
          calories: 180, protein: 16, carbs: 20, fat: 4, cholesterol: 0
        },
        {
          name: 'Green Detox Smoothie',
          ingredients: ['2 cups spinach', '1 banana', '1 cup coconut water', '1 tbsp flax seeds', '1/2 cup pineapple'],
          instructions: 'Blend spinach and coconut water first, then add remaining ingredients.',
          calories: 140, protein: 8, carbs: 18, fat: 4, cholesterol: 0
        },
        {
          name: 'Banana Almond Smoothie',
          ingredients: ['1 banana', '1 cup almond milk', '2 tbsp almond butter', '1 scoop protein powder', '1 tbsp honey'],
          instructions: 'Blend until creamy and smooth. Serve immediately.',
          calories: 200, protein: 12, carbs: 24, fat: 8, cholesterol: 0
        },
        {
          name: 'Tropical Protein Smoothie',
          ingredients: ['1 cup mango', '1/2 cup pineapple', '1 scoop vanilla protein', '1 cup coconut milk', '1 tbsp coconut flakes'],
          instructions: 'Blend fruits first, then add protein powder and coconut milk.',
          calories: 160, protein: 14, carbs: 18, fat: 4, cholesterol: 0
        },
        {
          name: 'Chocolate Protein Smoothie',
          ingredients: ['1 scoop chocolate protein powder', '1 cup almond milk', '1 banana', '1 tbsp cocoa powder', '1 tbsp peanut butter'],
          instructions: 'Blend all ingredients until smooth and creamy.',
          calories: 180, protein: 18, carbs: 16, fat: 6, cholesterol: 0
        },
        {
          name: 'Strawberry Banana Smoothie',
          ingredients: ['1 cup strawberries', '1 banana', '1 cup Greek yogurt', '1 tbsp honey', '1/2 cup ice'],
          instructions: 'Blend until smooth. Add more ice if needed for desired consistency.',
          calories: 160, protein: 10, carbs: 22, fat: 4, cholesterol: 0
        },
        {
          name: 'Blueberry Almond Smoothie',
          ingredients: ['1 cup blueberries', '1 cup almond milk', '2 tbsp almond butter', '1 scoop protein powder', '1 tbsp maple syrup'],
          instructions: 'Blend blueberries and almond milk first, then add remaining ingredients.',
          calories: 190, protein: 16, carbs: 22, fat: 8, cholesterol: 0
        },
        {
          name: 'Spinach Apple Smoothie',
          ingredients: ['2 cups spinach', '1 apple (cored)', '1 cup coconut water', '1 tbsp chia seeds', '1/2 lemon (juiced)'],
          instructions: 'Blend spinach and coconut water first, then add apple and remaining ingredients.',
          calories: 150, protein: 6, carbs: 20, fat: 4, cholesterol: 0
        },
        {
          name: 'Coconut Berry Smoothie',
          ingredients: ['1 cup mixed berries', '1 cup coconut milk', '1 tbsp coconut oil', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend berries and coconut milk first, then add protein powder and honey.',
          calories: 170, protein: 14, carbs: 18, fat: 6, cholesterol: 0
        },
        {
          name: 'Avocado Green Smoothie',
          ingredients: ['1/2 avocado', '2 cups spinach', '1 cup almond milk', '1 tbsp flax seeds', '1 tbsp honey'],
          instructions: 'Blend avocado and almond milk first, then add spinach and remaining ingredients.',
          calories: 180, protein: 8, carbs: 16, fat: 10, cholesterol: 0
        },
        {
          name: 'Mango Coconut Smoothie',
          ingredients: ['1 cup mango', '1 cup coconut milk', '1 tbsp coconut flakes', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend mango and coconut milk until smooth, then add protein powder.',
          calories: 160, protein: 14, carbs: 18, fat: 6, cholesterol: 0
        },
        {
          name: 'Pineapple Ginger Smoothie',
          ingredients: ['1 cup pineapple', '1 cup coconut water', '1 tbsp fresh ginger', '1 tbsp chia seeds', '1 tbsp honey'],
          instructions: 'Blend pineapple and coconut water first, then add ginger and remaining ingredients.',
          calories: 140, protein: 4, carbs: 20, fat: 2, cholesterol: 0
        },
        {
          name: 'Raspberry Vanilla Smoothie',
          ingredients: ['1 cup raspberries', '1 cup almond milk', '1 scoop vanilla protein', '1 tbsp vanilla extract', '1 tbsp honey'],
          instructions: 'Blend raspberries and almond milk first, then add protein powder and vanilla.',
          calories: 170, protein: 16, carbs: 18, fat: 4, cholesterol: 0
        },
        {
          name: 'Kale Apple Smoothie',
          ingredients: ['2 cups kale', '1 apple (cored)', '1 cup coconut water', '1 tbsp flax seeds', '1 tbsp lemon juice'],
          instructions: 'Blend kale and coconut water first, then add apple and remaining ingredients.',
          calories: 130, protein: 6, carbs: 18, fat: 4, cholesterol: 0
        },
        {
          name: 'Strawberry Coconut Smoothie',
          ingredients: ['1 cup strawberries', '1 cup coconut milk', '1 tbsp coconut oil', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend strawberries and coconut milk until smooth, then add protein powder.',
          calories: 180, protein: 14, carbs: 20, fat: 6, cholesterol: 0
        },
        {
          name: 'Blackberry Almond Smoothie',
          ingredients: ['1 cup blackberries', '1 cup almond milk', '2 tbsp almond butter', '1 scoop protein powder', '1 tbsp honey'],
          instructions: 'Blend blackberries and almond milk first, then add almond butter and protein.',
          calories: 190, protein: 16, carbs: 20, fat: 8, cholesterol: 0
        },
        {
          name: 'Spinach Pineapple Smoothie',
          ingredients: ['2 cups spinach', '1 cup pineapple', '1 cup coconut water', '1 tbsp chia seeds', '1 tbsp honey'],
          instructions: 'Blend spinach and coconut water first, then add pineapple and remaining ingredients.',
          calories: 140, protein: 6, carbs: 18, fat: 2, cholesterol: 0
        },
        {
          name: 'Blueberry Coconut Smoothie',
          ingredients: ['1 cup blueberries', '1 cup coconut milk', '1 tbsp coconut flakes', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend blueberries and coconut milk until smooth, then add protein powder.',
          calories: 170, protein: 14, carbs: 18, fat: 6, cholesterol: 0
        },
        {
          name: 'Mango Almond Smoothie',
          ingredients: ['1 cup mango', '1 cup almond milk', '2 tbsp almond butter', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend mango and almond milk first, then add almond butter and protein powder.',
          calories: 200, protein: 16, carbs: 22, fat: 8, cholesterol: 0
        },
        {
          name: 'Strawberry Spinach Smoothie',
          ingredients: ['1 cup strawberries', '2 cups spinach', '1 cup almond milk', '1 tbsp chia seeds', '1 tbsp honey'],
          instructions: 'Blend spinach and almond milk first, then add strawberries and remaining ingredients.',
          calories: 150, protein: 8, carbs: 18, fat: 4, cholesterol: 0
        },
        {
          name: 'Pineapple Coconut Smoothie',
          ingredients: ['1 cup pineapple', '1 cup coconut milk', '1 tbsp coconut oil', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend pineapple and coconut milk until smooth, then add protein powder.',
          calories: 160, protein: 14, carbs: 18, fat: 6, cholesterol: 0
        },
        {
          name: 'Raspberry Coconut Smoothie',
          ingredients: ['1 cup raspberries', '1 cup coconut milk', '1 tbsp coconut flakes', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend raspberries and coconut milk first, then add protein powder and coconut flakes.',
          calories: 170, protein: 14, carbs: 18, fat: 6, cholesterol: 0
        },
        {
          name: 'Blueberry Spinach Smoothie',
          ingredients: ['1 cup blueberries', '2 cups spinach', '1 cup coconut water', '1 tbsp flax seeds', '1 tbsp honey'],
          instructions: 'Blend spinach and coconut water first, then add blueberries and remaining ingredients.',
          calories: 140, protein: 6, carbs: 18, fat: 2, cholesterol: 0
        },
        {
          name: 'Mango Pineapple Smoothie',
          ingredients: ['1 cup mango', '1 cup pineapple', '1 cup coconut water', '1 tbsp chia seeds', '1 tbsp honey'],
          instructions: 'Blend mango and pineapple first, then add coconut water and remaining ingredients.',
          calories: 150, protein: 4, carbs: 22, fat: 2, cholesterol: 0
        },
        {
          name: 'Strawberry Mango Smoothie',
          ingredients: ['1 cup strawberries', '1 cup mango', '1 cup almond milk', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend strawberries and mango first, then add almond milk and protein powder.',
          calories: 180, protein: 14, carbs: 20, fat: 4, cholesterol: 0
        },
        {
          name: 'Pineapple Almond Smoothie',
          ingredients: ['1 cup pineapple', '1 cup almond milk', '2 tbsp almond butter', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend pineapple and almond milk first, then add almond butter and protein powder.',
          calories: 200, protein: 16, carbs: 22, fat: 8, cholesterol: 0
        },
        {
          name: 'Raspberry Almond Smoothie',
          ingredients: ['1 cup raspberries', '1 cup almond milk', '2 tbsp almond butter', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend raspberries and almond milk first, then add almond butter and protein powder.',
          calories: 190, protein: 16, carbs: 20, fat: 8, cholesterol: 0
        },
        {
          name: 'Blueberry Mango Smoothie',
          ingredients: ['1 cup blueberries', '1 cup mango', '1 cup coconut water', '1 tbsp chia seeds', '1 tbsp honey'],
          instructions: 'Blend blueberries and mango first, then add coconut water and remaining ingredients.',
          calories: 160, protein: 4, carbs: 22, fat: 2, cholesterol: 0
        },
        {
          name: 'Strawberry Pineapple Smoothie',
          ingredients: ['1 cup strawberries', '1 cup pineapple', '1 cup coconut water', '1 tbsp chia seeds', '1 tbsp honey'],
          instructions: 'Blend strawberries and pineapple first, then add coconut water and remaining ingredients.',
          calories: 150, protein: 4, carbs: 20, fat: 2, cholesterol: 0
        },
        {
          name: 'Mango Spinach Smoothie',
          ingredients: ['1 cup mango', '2 cups spinach', '1 cup coconut water', '1 tbsp flax seeds', '1 tbsp honey'],
          instructions: 'Blend spinach and coconut water first, then add mango and remaining ingredients.',
          calories: 140, protein: 6, carbs: 18, fat: 2, cholesterol: 0
        },
        {
          name: 'Pineapple Spinach Smoothie',
          ingredients: ['1 cup pineapple', '2 cups spinach', '1 cup coconut water', '1 tbsp chia seeds', '1 tbsp honey'],
          instructions: 'Blend spinach and coconut water first, then add pineapple and remaining ingredients.',
          calories: 130, protein: 6, carbs: 16, fat: 2, cholesterol: 0
        },
        {
          name: 'Raspberry Spinach Smoothie',
          ingredients: ['1 cup raspberries', '2 cups spinach', '1 cup coconut water', '1 tbsp flax seeds', '1 tbsp honey'],
          instructions: 'Blend spinach and coconut water first, then add raspberries and remaining ingredients.',
          calories: 140, protein: 6, carbs: 18, fat: 2, cholesterol: 0
        }
      ],
      regular: [
        {
          name: 'Berry Blast Protein Smoothie',
          ingredients: ['1 cup mixed berries', '1 scoop vanilla protein powder', '1 cup whole milk', '1 tbsp honey', '1/2 cup ice'],
          instructions: 'Blend all ingredients until smooth. Add more ice if desired.',
          calories: 200, protein: 18, carbs: 22, fat: 6, cholesterol: 0
        },
        {
          name: 'Green Machine Smoothie',
          ingredients: ['2 cups kale', '1 apple', '1 cup apple juice', '1 tbsp ginger', '1/2 cup ice'],
          instructions: 'Blend kale and apple juice first, then add apple and remaining ingredients.',
          calories: 160, protein: 10, carbs: 20, fat: 4, cholesterol: 0
        },
        {
          name: 'Peanut Butter Banana Smoothie',
          ingredients: ['1 banana', '2 tbsp peanut butter', '1 cup whole milk', '1 scoop protein powder', '1 tbsp honey'],
          instructions: 'Blend until creamy and smooth. Serve immediately.',
          calories: 220, protein: 14, carbs: 26, fat: 10, cholesterol: 0
        },
        {
          name: 'Tropical Paradise Smoothie',
          ingredients: ['1 cup mango', '1/2 cup pineapple', '1 cup coconut milk', '1 tbsp coconut oil', '1/2 cup ice'],
          instructions: 'Blend fruits first, then add coconut milk and remaining ingredients.',
          calories: 180, protein: 12, carbs: 20, fat: 6, cholesterol: 0
        },
        {
          name: 'Chocolate Peanut Butter Smoothie',
          ingredients: ['1 scoop chocolate protein powder', '2 tbsp peanut butter', '1 cup whole milk', '1 banana', '1 tbsp cocoa powder'],
          instructions: 'Blend all ingredients until smooth and creamy.',
          calories: 200, protein: 16, carbs: 18, fat: 8, cholesterol: 0
        },
        {
          name: 'Strawberry Cheesecake Smoothie',
          ingredients: ['1 cup strawberries', '1/2 cup cottage cheese', '1 cup whole milk', '1 tbsp honey', '1/2 cup ice'],
          instructions: 'Blend until smooth. Add more ice if needed for desired consistency.',
          calories: 180, protein: 12, carbs: 20, fat: 6, cholesterol: 0
        },
        {
          name: 'Blueberry Protein Smoothie',
          ingredients: ['1 cup blueberries', '1 scoop vanilla protein powder', '1 cup whole milk', '1 tbsp honey', '1/2 cup ice'],
          instructions: 'Blend blueberries and milk first, then add protein powder and honey.',
          calories: 210, protein: 18, carbs: 24, fat: 6, cholesterol: 0
        },
        {
          name: 'Spinach Apple Smoothie',
          ingredients: ['2 cups spinach', '1 apple (cored)', '1 cup apple juice', '1 tbsp ginger', '1/2 cup ice'],
          instructions: 'Blend spinach and apple juice first, then add apple and remaining ingredients.',
          calories: 170, protein: 8, carbs: 22, fat: 4, cholesterol: 0
        },
        {
          name: 'Coconut Berry Smoothie',
          ingredients: ['1 cup mixed berries', '1 cup coconut milk', '1 tbsp coconut oil', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend berries and coconut milk first, then add protein powder and honey.',
          calories: 190, protein: 16, carbs: 20, fat: 8, cholesterol: 0
        },
        {
          name: 'Avocado Green Smoothie',
          ingredients: ['1/2 avocado', '2 cups spinach', '1 cup whole milk', '1 tbsp flax seeds', '1 tbsp honey'],
          instructions: 'Blend avocado and milk first, then add spinach and remaining ingredients.',
          calories: 200, protein: 10, carbs: 18, fat: 12, cholesterol: 0
        },
        {
          name: 'Mango Coconut Smoothie',
          ingredients: ['1 cup mango', '1 cup coconut milk', '1 tbsp coconut flakes', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend mango and coconut milk until smooth, then add protein powder.',
          calories: 180, protein: 16, carbs: 20, fat: 8, cholesterol: 0
        },
        {
          name: 'Pineapple Ginger Smoothie',
          ingredients: ['1 cup pineapple', '1 cup apple juice', '1 tbsp fresh ginger', '1 tbsp chia seeds', '1 tbsp honey'],
          instructions: 'Blend pineapple and apple juice first, then add ginger and remaining ingredients.',
          calories: 160, protein: 6, carbs: 22, fat: 4, cholesterol: 0
        },
        {
          name: 'Raspberry Vanilla Smoothie',
          ingredients: ['1 cup raspberries', '1 cup whole milk', '1 scoop vanilla protein', '1 tbsp vanilla extract', '1 tbsp honey'],
          instructions: 'Blend raspberries and milk first, then add protein powder and vanilla.',
          calories: 190, protein: 18, carbs: 20, fat: 6, cholesterol: 0
        },
        {
          name: 'Kale Apple Smoothie',
          ingredients: ['2 cups kale', '1 apple (cored)', '1 cup apple juice', '1 tbsp flax seeds', '1 tbsp lemon juice'],
          instructions: 'Blend kale and apple juice first, then add apple and remaining ingredients.',
          calories: 150, protein: 8, carbs: 20, fat: 4, cholesterol: 0
        },
        {
          name: 'Strawberry Coconut Smoothie',
          ingredients: ['1 cup strawberries', '1 cup coconut milk', '1 tbsp coconut oil', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend strawberries and coconut milk until smooth, then add protein powder.',
          calories: 200, protein: 16, carbs: 22, fat: 8, cholesterol: 0
        },
        {
          name: 'Blackberry Protein Smoothie',
          ingredients: ['1 cup blackberries', '1 cup whole milk', '2 tbsp peanut butter', '1 scoop protein powder', '1 tbsp honey'],
          instructions: 'Blend blackberries and milk first, then add peanut butter and protein.',
          calories: 220, protein: 18, carbs: 22, fat: 10, cholesterol: 0
        },
        {
          name: 'Spinach Pineapple Smoothie',
          ingredients: ['2 cups spinach', '1 cup pineapple', '1 cup apple juice', '1 tbsp chia seeds', '1 tbsp honey'],
          instructions: 'Blend spinach and apple juice first, then add pineapple and remaining ingredients.',
          calories: 160, protein: 8, carbs: 20, fat: 4, cholesterol: 0
        },
        {
          name: 'Blueberry Coconut Smoothie',
          ingredients: ['1 cup blueberries', '1 cup coconut milk', '1 tbsp coconut flakes', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend blueberries and coconut milk until smooth, then add protein powder.',
          calories: 190, protein: 16, carbs: 20, fat: 8, cholesterol: 0
        },
        {
          name: 'Mango Almond Smoothie',
          ingredients: ['1 cup mango', '1 cup whole milk', '2 tbsp peanut butter', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend mango and milk first, then add peanut butter and protein powder.',
          calories: 220, protein: 18, carbs: 24, fat: 10, cholesterol: 0
        },
        {
          name: 'Strawberry Spinach Smoothie',
          ingredients: ['1 cup strawberries', '2 cups spinach', '1 cup whole milk', '1 tbsp chia seeds', '1 tbsp honey'],
          instructions: 'Blend spinach and milk first, then add strawberries and remaining ingredients.',
          calories: 170, protein: 10, carbs: 20, fat: 6, cholesterol: 0
        },
        {
          name: 'Pineapple Coconut Smoothie',
          ingredients: ['1 cup pineapple', '1 cup coconut milk', '1 tbsp coconut oil', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend pineapple and coconut milk until smooth, then add protein powder.',
          calories: 180, protein: 16, carbs: 20, fat: 8, cholesterol: 0
        },
        {
          name: 'Raspberry Coconut Smoothie',
          ingredients: ['1 cup raspberries', '1 cup coconut milk', '1 tbsp coconut flakes', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend raspberries and coconut milk first, then add protein powder and coconut flakes.',
          calories: 190, protein: 16, carbs: 20, fat: 8, cholesterol: 0
        },
        {
          name: 'Blueberry Spinach Smoothie',
          ingredients: ['1 cup blueberries', '2 cups spinach', '1 cup apple juice', '1 tbsp flax seeds', '1 tbsp honey'],
          instructions: 'Blend spinach and apple juice first, then add blueberries and remaining ingredients.',
          calories: 160, protein: 8, carbs: 20, fat: 4, cholesterol: 0
        },
        {
          name: 'Mango Pineapple Smoothie',
          ingredients: ['1 cup mango', '1 cup pineapple', '1 cup apple juice', '1 tbsp chia seeds', '1 tbsp honey'],
          instructions: 'Blend mango and pineapple first, then add apple juice and remaining ingredients.',
          calories: 170, protein: 6, carbs: 24, fat: 4, cholesterol: 0
        },
        {
          name: 'Strawberry Mango Smoothie',
          ingredients: ['1 cup strawberries', '1 cup mango', '1 cup whole milk', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend strawberries and mango first, then add milk and protein powder.',
          calories: 200, protein: 16, carbs: 22, fat: 6, cholesterol: 0
        },
        {
          name: 'Pineapple Almond Smoothie',
          ingredients: ['1 cup pineapple', '1 cup whole milk', '2 tbsp peanut butter', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend pineapple and milk first, then add peanut butter and protein powder.',
          calories: 220, protein: 18, carbs: 24, fat: 10, cholesterol: 0
        },
        {
          name: 'Raspberry Almond Smoothie',
          ingredients: ['1 cup raspberries', '1 cup whole milk', '2 tbsp peanut butter', '1 scoop vanilla protein', '1 tbsp honey'],
          instructions: 'Blend raspberries and milk first, then add peanut butter and protein powder.',
          calories: 210, protein: 18, carbs: 22, fat: 10, cholesterol: 0
        },
        {
          name: 'Blueberry Mango Smoothie',
          ingredients: ['1 cup blueberries', '1 cup mango', '1 cup apple juice', '1 tbsp chia seeds', '1 tbsp honey'],
          instructions: 'Blend blueberries and mango first, then add apple juice and remaining ingredients.',
          calories: 180, protein: 6, carbs: 24, fat: 4, cholesterol: 0
        },
        {
          name: 'Strawberry Pineapple Smoothie',
          ingredients: ['1 cup strawberries', '1 cup pineapple', '1 cup apple juice', '1 tbsp chia seeds', '1 tbsp honey'],
          instructions: 'Blend strawberries and pineapple first, then add apple juice and remaining ingredients.',
          calories: 170, protein: 6, carbs: 22, fat: 4, cholesterol: 0
        },
        {
          name: 'Mango Spinach Smoothie',
          ingredients: ['1 cup mango', '2 cups spinach', '1 cup apple juice', '1 tbsp flax seeds', '1 tbsp honey'],
          instructions: 'Blend spinach and apple juice first, then add mango and remaining ingredients.',
          calories: 160, protein: 8, carbs: 20, fat: 4, cholesterol: 0
        },
        {
          name: 'Pineapple Spinach Smoothie',
          ingredients: ['1 cup pineapple', '2 cups spinach', '1 cup apple juice', '1 tbsp chia seeds', '1 tbsp honey'],
          instructions: 'Blend spinach and apple juice first, then add pineapple and remaining ingredients.',
          calories: 150, protein: 8, carbs: 18, fat: 4, cholesterol: 0
        },
        {
          name: 'Raspberry Spinach Smoothie',
          ingredients: ['1 cup raspberries', '2 cups spinach', '1 cup apple juice', '1 tbsp flax seeds', '1 tbsp honey'],
          instructions: 'Blend spinach and apple juice first, then add raspberries and remaining ingredients.',
          calories: 160, protein: 8, carbs: 20, fat: 4, cholesterol: 0
        }
      ]
    };

    const templates = smoothieRecipes[lowCholesterol ? 'lowCholesterol' : 'regular'];
    const selectedSmoothie = templates[Math.floor(Math.random() * templates.length)];
    
    // Adjust portion size to match target calories
    const calorieRatio = targetCalories / selectedSmoothie.calories;
    return {
      name: selectedSmoothie.name,
      ingredients: selectedSmoothie.ingredients,
      instructions: selectedSmoothie.instructions,
      calories: Math.round(selectedSmoothie.calories * calorieRatio),
      protein: Math.round(selectedSmoothie.protein * calorieRatio),
      carbs: Math.round(selectedSmoothie.carbs * calorieRatio),
      fat: Math.round(selectedSmoothie.fat * calorieRatio),
      cholesterol: Math.round(selectedSmoothie.cholesterol * calorieRatio)
    };
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
          <p><strong>Generated by Bradley Health App</strong></p>
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
                ${meal.ingredients ? `
                  <div class="meal-ingredients">
                    <strong>Ingredients:</strong>
                    <ul>
                      ${meal.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
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
          <p><strong>Generated by Bradley Health App</strong></p>
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
              ${exercise.instructions ? `
                <div class="exercise-instructions">
                  <strong>Instructions:</strong>
                  <p>${exercise.instructions}</p>
                </div>
              ` : ''}
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
          <p><strong>Generated by Bradley Health App</strong></p>
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
                ${meal.ingredients ? `
                  <div class="meal-ingredients">
                    <strong>Ingredients:</strong>
                    <ul>
                      ${meal.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
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
              ${exercise.instructions ? `
                <div class="exercise-instructions">
                  <strong>Instructions:</strong>
                  <p>${exercise.instructions}</p>
                </div>
              ` : ''}
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