// Nutrition Tracking System with Cholesterol Monitoring
class NutritionTracker {
  constructor() {
    this.db = firebase.firestore();
    this.meals = [];
    this.currentUser = null;
    this.initialized = false;
    this.foodDatabase = {};
    
    // Initialize food database
    this.initializeFoodDatabase();
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    console.log('Nutrition Tracker: Waiting for authManager...');
    
    // Prevent multiple initializations
    if (this.initialized) {
      console.log('Nutrition Tracker: Already initialized, skipping...');
      return;
    }

    const checkAuthManager = () => {
      if (window.authManager) {
        console.log('Nutrition Tracker: authManager found, initializing...');
        
        // Set up auth state listener
        window.authManager.auth.onAuthStateChanged((user) => {
          this.currentUser = user;
          if (user) {
            console.log('Nutrition Tracker: User authenticated, loading data');
            this.loadNutritionData();
            this.setupEventListeners();
            this.setDefaultDateTime();
            this.initialized = true;
          } else {
            console.log('Nutrition Tracker: User signed out, clearing data...');
            this.meals = [];
            this.renderMealHistory();
            this.renderCholesterolHistory();
            this.updateNutritionOverview();
            this.initialized = false;
          }
        });
        
        // Get initial user state - only load if not already loaded
        this.currentUser = window.authManager.getCurrentUser();
        if (this.currentUser && !this.initialized) {
          console.log('Nutrition Tracker: User already authenticated, loading data');
          this.loadNutritionData();
          this.setupEventListeners();
          this.setDefaultDateTime();
          this.initialized = true;
        }
      } else {
        console.log('Nutrition Tracker: authManager not found, retrying...');
        setTimeout(checkAuthManager, 100);
      }
    };
    
    checkAuthManager();
  }

  initializeFoodDatabase() {
    // Comprehensive food database with cholesterol content (mg per 100g)
    return {
      // Dairy Products
      'whole milk': { cholesterol: 14, calories: 61, fat: 3.3, alternatives: ['skim milk', 'almond milk', 'oat milk'] },
      'skim milk': { cholesterol: 5, calories: 42, fat: 0.1, alternatives: ['almond milk', 'oat milk', 'soy milk'] },
      'cheddar cheese': { cholesterol: 105, calories: 403, fat: 33.1, alternatives: ['low-fat cheese', 'cottage cheese', 'nutritional yeast'] },
      'cheese': { cholesterol: 105, calories: 403, fat: 33.1, alternatives: ['low-fat cheese', 'cottage cheese', 'nutritional yeast'] },
      'mozzarella': { cholesterol: 89, calories: 280, fat: 22.0, alternatives: ['low-fat mozzarella', 'cottage cheese', 'nutritional yeast'] },
      'swiss cheese': { cholesterol: 92, calories: 380, fat: 28.0, alternatives: ['low-fat swiss', 'cottage cheese', 'nutritional yeast'] },
      'eggs': { cholesterol: 373, calories: 155, fat: 11.3, alternatives: ['egg whites', 'tofu scramble', 'chickpea scramble'] },
      'egg': { cholesterol: 373, calories: 155, fat: 11.3, alternatives: ['egg whites', 'tofu scramble', 'chickpea scramble'] },
      'yogurt': { cholesterol: 13, calories: 59, fat: 0.4, alternatives: ['greek yogurt', 'plant-based yogurt'] },
      'greek yogurt': { cholesterol: 10, calories: 59, fat: 0.4, alternatives: ['plant-based yogurt', 'cottage cheese'] },
      'butter': { cholesterol: 215, calories: 717, fat: 81.1, alternatives: ['olive oil', 'avocado', 'nut butter'] },
      'cream': { cholesterol: 110, calories: 340, fat: 36.0, alternatives: ['coconut cream', 'cashew cream', 'oat cream'] },
      'ice cream': { cholesterol: 44, calories: 207, fat: 11.0, alternatives: ['frozen yogurt', 'sorbet', 'nice cream'] },
      
      // Meats
      'beef': { cholesterol: 62, calories: 250, fat: 15.4, alternatives: ['lean beef', 'turkey', 'fish', 'tofu'] },
      'steak': { cholesterol: 62, calories: 250, fat: 15.4, alternatives: ['lean beef', 'turkey', 'fish', 'tofu'] },
      'ground beef': { cholesterol: 62, calories: 250, fat: 15.4, alternatives: ['lean beef', 'turkey', 'fish', 'tofu'] },
      'pork': { cholesterol: 62, calories: 242, fat: 14.0, alternatives: ['lean pork', 'chicken', 'fish'] },
      'pork chop': { cholesterol: 62, calories: 242, fat: 14.0, alternatives: ['lean pork', 'chicken', 'fish'] },
      'chicken breast': { cholesterol: 73, calories: 165, fat: 3.6, alternatives: ['skinless chicken', 'turkey', 'fish'] },
      'chicken': { cholesterol: 73, calories: 165, fat: 3.6, alternatives: ['skinless chicken', 'turkey', 'fish'] },
      'chicken thigh': { cholesterol: 82, calories: 177, fat: 9.3, alternatives: ['chicken breast', 'turkey', 'fish'] },
      'turkey': { cholesterol: 49, calories: 135, fat: 3.6, alternatives: ['chicken', 'fish', 'tofu'] },
      'lamb': { cholesterol: 78, calories: 294, fat: 21.0, alternatives: ['lean beef', 'chicken', 'fish'] },
      'duck': { cholesterol: 84, calories: 337, fat: 28.0, alternatives: ['chicken', 'turkey', 'fish'] },
      'salmon': { cholesterol: 55, calories: 208, fat: 12.4, alternatives: ['cod', 'tilapia', 'tofu'] },
      'tuna': { cholesterol: 38, calories: 144, fat: 0.5, alternatives: ['salmon', 'cod', 'tofu'] },
      'cod': { cholesterol: 43, calories: 105, fat: 0.9, alternatives: ['tilapia', 'salmon', 'tofu'] },
      'tilapia': { cholesterol: 50, calories: 96, fat: 2.3, alternatives: ['cod', 'salmon', 'tofu'] },
      'shrimp': { cholesterol: 195, calories: 99, fat: 0.3, alternatives: ['cod', 'tilapia', 'tofu'] },
      'crab': { cholesterol: 97, calories: 97, fat: 1.5, alternatives: ['cod', 'tilapia', 'tofu'] },
      'lobster': { cholesterol: 95, calories: 89, fat: 0.5, alternatives: ['cod', 'tilapia', 'tofu'] },
      'oysters': { cholesterol: 50, calories: 69, fat: 2.0, alternatives: ['mussels', 'clams', 'tofu'] },
      
      // Processed Foods
      'bacon': { cholesterol: 97, calories: 541, fat: 42.0, alternatives: ['turkey bacon', 'tempeh bacon', 'mushroom bacon'] },
      'sausage': { cholesterol: 80, calories: 296, fat: 26.0, alternatives: ['turkey sausage', 'vegetarian sausage', 'tempeh'] },
      'hot dog': { cholesterol: 77, calories: 290, fat: 26.0, alternatives: ['turkey hot dog', 'vegetarian hot dog', 'tofu dog'] },
      'hamburger': { cholesterol: 66, calories: 295, fat: 12.0, alternatives: ['turkey burger', 'veggie burger', 'portobello burger'] },
      'burger': { cholesterol: 66, calories: 295, fat: 12.0, alternatives: ['turkey burger', 'veggie burger', 'portobello burger'] },
      'ham': { cholesterol: 53, calories: 145, fat: 5.5, alternatives: ['turkey', 'chicken', 'tofu', 'tempeh'] },
      'pepperoni': { cholesterol: 85, calories: 494, fat: 44.0, alternatives: ['turkey pepperoni', 'vegetarian pepperoni', 'mushroom'] },
      'salami': { cholesterol: 89, calories: 336, fat: 26.0, alternatives: ['turkey salami', 'vegetarian salami', 'tofu'] },
      'pastrami': { cholesterol: 68, calories: 251, fat: 12.0, alternatives: ['turkey pastrami', 'chicken', 'tofu'] },
      'corned beef': { cholesterol: 98, calories: 251, fat: 15.0, alternatives: ['turkey', 'chicken', 'tofu'] },
      
      // Condiments and Spreads
      'mayonnaise': { cholesterol: 42, calories: 680, fat: 75.0, alternatives: ['mustard', 'hummus', 'avocado', 'greek yogurt'] },
      'mayo': { cholesterol: 42, calories: 680, fat: 75.0, alternatives: ['mustard', 'hummus', 'avocado', 'greek yogurt'] },
      'ketchup': { cholesterol: 0, calories: 102, fat: 0.1, alternatives: ['mustard', 'hot sauce', 'salsa'] },
      'mustard': { cholesterol: 0, calories: 66, fat: 4.0, alternatives: ['hummus', 'avocado', 'greek yogurt'] },
      'ranch': { cholesterol: 8, calories: 484, fat: 52.0, alternatives: ['greek yogurt ranch', 'hummus', 'avocado'] },
      'blue cheese': { cholesterol: 75, calories: 353, fat: 28.0, alternatives: ['greek yogurt', 'hummus', 'avocado'] },
      'thousand island': { cholesterol: 5, calories: 475, fat: 52.0, alternatives: ['mustard', 'hummus', 'avocado'] },
      
      // Plant-based (low cholesterol)
      'tofu': { cholesterol: 0, calories: 76, fat: 4.8, alternatives: ['tempeh', 'seitan', 'legumes'] },
      'tempeh': { cholesterol: 0, calories: 192, fat: 11.0, alternatives: ['tofu', 'seitan', 'legumes'] },
      'seitan': { cholesterol: 0, calories: 370, fat: 1.9, alternatives: ['tofu', 'tempeh', 'legumes'] },
      'beans': { cholesterol: 0, calories: 88, fat: 0.5, alternatives: ['lentils', 'chickpeas', 'black beans'] },
      'black beans': { cholesterol: 0, calories: 88, fat: 0.5, alternatives: ['kidney beans', 'pinto beans', 'chickpeas'] },
      'kidney beans': { cholesterol: 0, calories: 88, fat: 0.5, alternatives: ['black beans', 'pinto beans', 'chickpeas'] },
      'pinto beans': { cholesterol: 0, calories: 88, fat: 0.5, alternatives: ['black beans', 'kidney beans', 'chickpeas'] },
      'lentils': { cholesterol: 0, calories: 116, fat: 0.4, alternatives: ['beans', 'chickpeas', 'quinoa'] },
      'chickpeas': { cholesterol: 0, calories: 164, fat: 2.6, alternatives: ['beans', 'lentils', 'quinoa'] },
      'quinoa': { cholesterol: 0, calories: 120, fat: 1.9, alternatives: ['brown rice', 'farro', 'barley'] },
      'brown rice': { cholesterol: 0, calories: 111, fat: 0.9, alternatives: ['quinoa', 'farro', 'barley'] },
      'white rice': { cholesterol: 0, calories: 130, fat: 0.3, alternatives: ['brown rice', 'quinoa', 'farro'] },
      
      // Fruits and Vegetables (no cholesterol)
      'apple': { cholesterol: 0, calories: 52, fat: 0.2, alternatives: ['pear', 'orange', 'berries'] },
      'banana': { cholesterol: 0, calories: 89, fat: 0.3, alternatives: ['apple', 'orange', 'berries'] },
      'orange': { cholesterol: 0, calories: 47, fat: 0.1, alternatives: ['apple', 'banana', 'berries'] },
      'strawberry': { cholesterol: 0, calories: 32, fat: 0.3, alternatives: ['blueberry', 'raspberry', 'blackberry'] },
      'blueberry': { cholesterol: 0, calories: 57, fat: 0.3, alternatives: ['strawberry', 'raspberry', 'blackberry'] },
      'raspberry': { cholesterol: 0, calories: 52, fat: 0.7, alternatives: ['strawberry', 'blueberry', 'blackberry'] },
      'grape': { cholesterol: 0, calories: 62, fat: 0.2, alternatives: ['apple', 'orange', 'berries'] },
      'peach': { cholesterol: 0, calories: 39, fat: 0.3, alternatives: ['nectarine', 'apricot', 'plum'] },
      'pear': { cholesterol: 0, calories: 57, fat: 0.1, alternatives: ['apple', 'orange', 'berries'] },
      'pineapple': { cholesterol: 0, calories: 50, fat: 0.1, alternatives: ['mango', 'papaya', 'kiwi'] },
      'mango': { cholesterol: 0, calories: 60, fat: 0.4, alternatives: ['pineapple', 'papaya', 'kiwi'] },
      'avocado': { cholesterol: 0, calories: 160, fat: 14.7, alternatives: ['olive oil', 'nuts', 'seeds'] },
      'broccoli': { cholesterol: 0, calories: 34, fat: 0.4, alternatives: ['cauliflower', 'brussels sprouts', 'kale'] },
      'cauliflower': { cholesterol: 0, calories: 25, fat: 0.3, alternatives: ['broccoli', 'brussels sprouts', 'kale'] },
      'brussels sprouts': { cholesterol: 0, calories: 43, fat: 0.3, alternatives: ['broccoli', 'cauliflower', 'kale'] },
      'kale': { cholesterol: 0, calories: 49, fat: 0.9, alternatives: ['spinach', 'swiss chard', 'arugula'] },
      'spinach': { cholesterol: 0, calories: 23, fat: 0.4, alternatives: ['kale', 'swiss chard', 'arugula'] },
      'lettuce': { cholesterol: 0, calories: 15, fat: 0.1, alternatives: ['spinach', 'kale', 'arugula', 'mixed greens'] },
      'tomato': { cholesterol: 0, calories: 18, fat: 0.2, alternatives: ['bell pepper', 'cucumber', 'onion', 'avocado'] },
      'cucumber': { cholesterol: 0, calories: 16, fat: 0.1, alternatives: ['celery', 'bell pepper', 'zucchini'] },
      'carrots': { cholesterol: 0, calories: 41, fat: 0.2, alternatives: ['sweet potato', 'butternut squash', 'beets'] },
      'sweet potato': { cholesterol: 0, calories: 86, fat: 0.1, alternatives: ['carrots', 'butternut squash', 'beets'] },
      'potato': { cholesterol: 0, calories: 77, fat: 0.1, alternatives: ['sweet potato', 'cauliflower', 'turnip'] },
      'onion': { cholesterol: 0, calories: 40, fat: 0.1, alternatives: ['garlic', 'shallot', 'leek'] },
      'garlic': { cholesterol: 0, calories: 149, fat: 0.5, alternatives: ['onion', 'shallot', 'leek'] },
      'bell pepper': { cholesterol: 0, calories: 31, fat: 0.3, alternatives: ['tomato', 'cucumber', 'zucchini'] },
      'mushroom': { cholesterol: 0, calories: 22, fat: 0.3, alternatives: ['eggplant', 'zucchini', 'squash'] },
      'zucchini': { cholesterol: 0, calories: 17, fat: 0.3, alternatives: ['cucumber', 'bell pepper', 'squash'] },
      'eggplant': { cholesterol: 0, calories: 25, fat: 0.2, alternatives: ['mushroom', 'zucchini', 'squash'] },
      'corn': { cholesterol: 0, calories: 86, fat: 1.2, alternatives: ['peas', 'green beans', 'asparagus'] },
      'peas': { cholesterol: 0, calories: 84, fat: 0.4, alternatives: ['corn', 'green beans', 'asparagus'] },
      'green beans': { cholesterol: 0, calories: 31, fat: 0.2, alternatives: ['peas', 'asparagus', 'broccoli'] },
      'asparagus': { cholesterol: 0, calories: 20, fat: 0.1, alternatives: ['green beans', 'broccoli', 'cauliflower'] },
      
      // Grains
      'bread': { cholesterol: 0, calories: 265, fat: 3.2, alternatives: ['whole grain bread', 'sprouted bread', 'rye bread'] },
      'sandwich bread': { cholesterol: 0, calories: 265, fat: 3.2, alternatives: ['whole grain bread', 'sprouted bread', 'rye bread'] },
      'white bread': { cholesterol: 0, calories: 265, fat: 3.2, alternatives: ['whole grain bread', 'sprouted bread', 'rye bread'] },
      'wheat bread': { cholesterol: 0, calories: 247, fat: 3.4, alternatives: ['whole grain bread', 'sprouted bread', 'rye bread'] },
      'whole wheat bread': { cholesterol: 0, calories: 247, fat: 3.4, alternatives: ['sprouted bread', 'rye bread', 'oat bread'] },
      'rye bread': { cholesterol: 0, calories: 259, fat: 3.3, alternatives: ['whole wheat bread', 'sprouted bread', 'oat bread'] },
      'pita bread': { cholesterol: 0, calories: 275, fat: 1.2, alternatives: ['whole wheat pita', 'tortilla', 'flatbread'] },
      'tortilla': { cholesterol: 0, calories: 237, fat: 2.9, alternatives: ['whole wheat tortilla', 'pita bread', 'flatbread'] },
      'rice': { cholesterol: 0, calories: 130, fat: 0.3, alternatives: ['brown rice', 'quinoa', 'farro'] },
      'pasta': { cholesterol: 0, calories: 131, fat: 1.1, alternatives: ['whole grain pasta', 'zucchini noodles', 'spaghetti squash'] },
      'spaghetti': { cholesterol: 0, calories: 131, fat: 1.1, alternatives: ['whole grain spaghetti', 'zucchini noodles', 'spaghetti squash'] },
      'macaroni': { cholesterol: 0, calories: 131, fat: 1.1, alternatives: ['whole grain macaroni', 'quinoa', 'brown rice'] },
      'oatmeal': { cholesterol: 0, calories: 68, fat: 1.4, alternatives: ['quinoa', 'buckwheat', 'amaranth'] },
      'oats': { cholesterol: 0, calories: 68, fat: 1.4, alternatives: ['quinoa', 'buckwheat', 'amaranth'] },
      'cereal': { cholesterol: 0, calories: 100, fat: 1.0, alternatives: ['oatmeal', 'quinoa', 'buckwheat'] },
      
      // Nuts and Seeds
      'almonds': { cholesterol: 0, calories: 579, fat: 49.9, alternatives: ['walnuts', 'cashews', 'pistachios'] },
      'walnuts': { cholesterol: 0, calories: 654, fat: 65.2, alternatives: ['almonds', 'cashews', 'pistachios'] },
      'cashews': { cholesterol: 0, calories: 553, fat: 43.8, alternatives: ['almonds', 'walnuts', 'pistachios'] },
      'peanuts': { cholesterol: 0, calories: 567, fat: 49.2, alternatives: ['almonds', 'walnuts', 'cashews'] },
      'peanut butter': { cholesterol: 0, calories: 588, fat: 50.0, alternatives: ['almond butter', 'cashew butter', 'sunflower butter'] },
      'sunflower seeds': { cholesterol: 0, calories: 584, fat: 51.5, alternatives: ['pumpkin seeds', 'chia seeds', 'flaxseeds'] },
      'pumpkin seeds': { cholesterol: 0, calories: 559, fat: 49.0, alternatives: ['sunflower seeds', 'chia seeds', 'flaxseeds'] },
      'chia seeds': { cholesterol: 0, calories: 486, fat: 30.7, alternatives: ['flaxseeds', 'hemp seeds', 'sunflower seeds'] },
      'flaxseeds': { cholesterol: 0, calories: 534, fat: 42.2, alternatives: ['chia seeds', 'hemp seeds', 'sunflower seeds'] },
      
      // Beverages
      'coffee': { cholesterol: 0, calories: 2, fat: 0.0, alternatives: ['tea', 'herbal tea', 'water'] },
      'tea': { cholesterol: 0, calories: 1, fat: 0.0, alternatives: ['coffee', 'herbal tea', 'water'] },
      'orange juice': { cholesterol: 0, calories: 45, fat: 0.2, alternatives: ['apple juice', 'grapefruit juice', 'water'] },
      'apple juice': { cholesterol: 0, calories: 46, fat: 0.1, alternatives: ['orange juice', 'grape juice', 'water'] },
      'soda': { cholesterol: 0, calories: 42, fat: 0.0, alternatives: ['sparkling water', 'herbal tea', 'water'] },
      'beer': { cholesterol: 0, calories: 43, fat: 0.0, alternatives: ['wine', 'spirits', 'water'] },
      'wine': { cholesterol: 0, calories: 85, fat: 0.0, alternatives: ['beer', 'spirits', 'water'] },
      
      // Desserts and Sweets
      'chocolate': { cholesterol: 8, calories: 545, fat: 31.0, alternatives: ['dark chocolate', 'cocoa powder', 'carob'] },
      'dark chocolate': { cholesterol: 8, calories: 545, fat: 31.0, alternatives: ['cocoa powder', 'carob', 'fruit'] },
      'cake': { cholesterol: 15, calories: 257, fat: 9.0, alternatives: ['fruit', 'yogurt', 'nuts'] },
      'cookie': { cholesterol: 20, calories: 502, fat: 25.0, alternatives: ['fruit', 'nuts', 'yogurt'] },
      'ice cream': { cholesterol: 44, calories: 207, fat: 11.0, alternatives: ['frozen yogurt', 'sorbet', 'nice cream'] },
      'pie': { cholesterol: 25, calories: 237, fat: 11.0, alternatives: ['fruit', 'yogurt', 'nuts'] },
      
      // Common Food Combinations
      'sandwich': { cholesterol: 50, calories: 300, fat: 15.0, alternatives: ['wrap', 'salad', 'soup'] },
      'pizza': { cholesterol: 35, calories: 266, fat: 10.0, alternatives: ['cauliflower crust pizza', 'zucchini pizza', 'salad'] },
      'burger': { cholesterol: 66, calories: 295, fat: 12.0, alternatives: ['turkey burger', 'veggie burger', 'portobello burger'] },
      'taco': { cholesterol: 45, calories: 226, fat: 12.0, alternatives: ['veggie taco', 'fish taco', 'salad'] },
      'pasta': { cholesterol: 0, calories: 131, fat: 1.1, alternatives: ['zucchini noodles', 'spaghetti squash', 'quinoa'] },
      'salad': { cholesterol: 5, calories: 100, fat: 5.0, alternatives: ['soup', 'stir fry', 'roasted vegetables'] },
      'soup': { cholesterol: 10, calories: 80, fat: 3.0, alternatives: ['salad', 'stir fry', 'roasted vegetables'] },
      'stir fry': { cholesterol: 15, calories: 150, fat: 8.0, alternatives: ['salad', 'soup', 'roasted vegetables'] }
    };
  }

  // Calculate estimated cholesterol from meal description
  async calculateCholesterolFromMeal(mealName, mealNotes) {
    const text = `${mealName} ${mealNotes || ''}`.toLowerCase();
    let totalCholesterol = 0;
    let totalCalories = 0;
    let totalFat = 0;
    let foodsFound = [];
    let unrecognizedFoods = [];
    
    // Enhanced portion size estimation for common foods
    const portionEstimates = {
      'bread': 60, // 2 slices
      'ham': 50, // 2-3 slices
      'cheese': 30, // 1 slice
      'mayonnaise': 15, // 1 tbsp
      'lettuce': 20, // 1/4 cup
      'tomato': 30, // 2-3 slices
      'egg': 50, // 1 large egg
      'milk': 240, // 1 cup
      'chicken': 100, // 3.5 oz
      'beef': 100, // 3.5 oz
      'salmon': 100, // 3.5 oz
      'rice': 150, // 1 cup cooked
      'pasta': 100, // 1 cup cooked
      'oatmeal': 150, // 1 cup cooked
      'yogurt': 170, // 3/4 cup
      'butter': 14, // 1 tbsp
      'bacon': 15, // 1 slice
      'sausage': 50, // 1 link
      'hot dog': 50, // 1 hot dog
      'hamburger': 100, // 1 patty
    };

    // Intelligent food category detection for unknown foods
    const foodCategories = {
      'meat': { cholesterol: 60, calories: 200, fat: 12.0, alternatives: ['fish', 'tofu', 'legumes'] },
      'fish': { cholesterol: 50, calories: 150, fat: 5.0, alternatives: ['tofu', 'legumes', 'nuts'] },
      'dairy': { cholesterol: 80, calories: 250, fat: 15.0, alternatives: ['plant-based alternatives', 'nuts', 'seeds'] },
      'vegetable': { cholesterol: 0, calories: 30, fat: 0.3, alternatives: ['other vegetables', 'fruits', 'grains'] },
      'fruit': { cholesterol: 0, calories: 50, fat: 0.2, alternatives: ['other fruits', 'vegetables', 'nuts'] },
      'grain': { cholesterol: 0, calories: 120, fat: 1.0, alternatives: ['other grains', 'legumes', 'vegetables'] },
      'nut': { cholesterol: 0, calories: 600, fat: 50.0, alternatives: ['other nuts', 'seeds', 'legumes'] },
      'dessert': { cholesterol: 20, calories: 300, fat: 15.0, alternatives: ['fruit', 'yogurt', 'nuts'] },
      'beverage': { cholesterol: 0, calories: 50, fat: 0.0, alternatives: ['water', 'tea', 'herbal drinks'] }
    };

    // Common food patterns and their categories
    const foodPatterns = {
      'meat': ['steak', 'chop', 'roast', 'loin', 'tenderloin', 'sirloin', 'ribeye', 'filet', 'brisket', 'shank', 'shoulder', 'belly', 'leg', 'wing', 'drumstick', 'breast', 'thigh', 'cutlet', 'patty', 'meatball', 'sausage', 'hot dog', 'bacon', 'ham', 'pepperoni', 'salami', 'pastrami', 'corned beef', 'jerky', 'deli meat', 'cold cut'],
      'fish': ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'halibut', 'mackerel', 'sardine', 'anchovy', 'trout', 'bass', 'perch', 'snapper', 'grouper', 'swordfish', 'mahi mahi', 'sea bass', 'flounder', 'sole', 'catfish', 'carp', 'eel', 'herring', 'whitefish', 'rockfish', 'pollock', 'whiting', 'bluefish', 'pike', 'walleye'],
      'dairy': ['milk', 'cheese', 'yogurt', 'cream', 'butter', 'sour cream', 'cottage cheese', 'ricotta', 'feta', 'parmesan', 'provolone', 'gouda', 'brie', 'camembert', 'blue cheese', 'cheddar', 'mozzarella', 'swiss', 'american cheese', 'cream cheese', 'mascarpone', 'quark', 'kefir', 'buttermilk', 'half and half', 'heavy cream', 'whipping cream'],
      'vegetable': ['vegetable', 'broccoli', 'cauliflower', 'carrot', 'celery', 'cucumber', 'lettuce', 'spinach', 'kale', 'arugula', 'watercress', 'endive', 'radicchio', 'bok choy', 'cabbage', 'brussels sprout', 'asparagus', 'green bean', 'pea', 'corn', 'bell pepper', 'jalapeno', 'habanero', 'chili pepper', 'onion', 'garlic', 'shallot', 'leek', 'scallion', 'chive', 'mushroom', 'eggplant', 'zucchini', 'squash', 'pumpkin', 'butternut squash', 'acorn squash', 'spaghetti squash', 'tomato', 'potato', 'sweet potato', 'yam', 'turnip', 'rutabaga', 'parsnip', 'beet', 'radish', 'daikon', 'jicama', 'kohlrabi', 'fennel', 'artichoke', 'okra', 'bamboo shoot', 'water chestnut', 'lotus root', 'taro', 'cassava', 'plantain'],
      'fruit': ['fruit', 'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'raspberry', 'blackberry', 'cranberry', 'cherry', 'peach', 'nectarine', 'apricot', 'plum', 'prune', 'pear', 'pineapple', 'mango', 'papaya', 'kiwi', 'guava', 'lychee', 'longan', 'rambutan', 'durian', 'jackfruit', 'breadfruit', 'fig', 'date', 'raisin', 'prune', 'currant', 'gooseberry', 'elderberry', 'mulberry', 'boysenberry', 'loganberry', 'tayberry', 'olive', 'avocado', 'coconut', 'pomegranate', 'persimmon', 'quince', 'medlar', 'loquat', 'kumquat', 'calamondin', 'yuzu', 'buddha hand', 'citron', 'lime', 'lemon', 'grapefruit', 'tangerine', 'clementine', 'mandarin', 'satsuma', 'ugli fruit', 'tangelo', 'minneola', 'oroblanco', 'melogold', 'pomelo', 'shaddock'],
      'grain': ['grain', 'rice', 'wheat', 'oats', 'barley', 'rye', 'corn', 'millet', 'sorghum', 'quinoa', 'amaranth', 'buckwheat', 'teff', 'spelt', 'kamut', 'farro', 'freekeh', 'bulgur', 'couscous', 'polenta', 'grits', 'bread', 'pasta', 'noodle', 'cereal', 'oatmeal', 'porridge', 'muesli', 'granola', 'cracker', 'pretzel', 'tortilla', 'pita', 'naan', 'flatbread', 'matzo', 'challah', 'brioche', 'croissant', 'bagel', 'muffin', 'biscuit', 'scone', 'pancake', 'waffle', 'crepe', 'dumpling', 'ravioli', 'lasagna', 'macaroni', 'spaghetti', 'fettuccine', 'linguine', 'penne', 'rigatoni', 'fusilli', 'rotini', 'ziti', 'manicotti', 'cannelloni', 'tortellini', 'gnocchi', 'orzo', 'risotto'],
      'nut': ['nut', 'almond', 'walnut', 'cashew', 'pistachio', 'pecan', 'hazelnut', 'macadamia', 'brazil nut', 'pine nut', 'chestnut', 'peanut', 'sunflower seed', 'pumpkin seed', 'sesame seed', 'chia seed', 'flaxseed', 'hemp seed', 'poppy seed', 'caraway seed', 'fennel seed', 'cumin seed', 'coriander seed', 'mustard seed', 'celery seed', 'dill seed', 'anise seed', 'cardamom seed', 'nutmeg', 'mace', 'allspice', 'clove', 'cinnamon', 'ginger', 'turmeric', 'saffron', 'vanilla', 'cocoa', 'chocolate'],
      'dessert': ['dessert', 'cake', 'cookie', 'pie', 'pastry', 'donut', 'muffin', 'brownie', 'fudge', 'candy', 'chocolate', 'ice cream', 'sorbet', 'gelato', 'pudding', 'custard', 'flan', 'creme brulee', 'tiramisu', 'cheesecake', 'trifle', 'parfait', 'sundae', 'milkshake', 'smoothie', 'shake', 'float', 'soda', 'pop', 'cola', 'lemonade', 'juice', 'nectar', 'syrup', 'honey', 'jam', 'jelly', 'marmalade', 'preserve', 'compote', 'chutney', 'relish', 'pickle']
    };

    // Clean and split text into words, filtering out non-food content
    const cleanText = text
      .replace(/[()]/g, ' ') // Remove parentheses
      .replace(/\d+g\b/g, ' ') // Remove "100g" patterns
      .replace(/\d+mg\b/g, ' ') // Remove "mg" patterns
      .replace(/\d+cal\b/g, ' ') // Remove "cal" patterns
      .replace(/[\[\]]/g, ' ') // Remove brackets
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    const words = cleanText.split(/\s+/);
    const processedWords = new Set();

    console.log('Cleaned text:', cleanText);
    console.log('Words to process:', words);

    for (const word of words) {
      // Skip if already processed or if it's a non-food word
      if (processedWords.has(word) || this.isNonFoodWord(word)) {
        console.log(`Skipping word: ${word} (already processed or non-food)`);
        continue;
      }
      
      // Skip words that are just numbers or formatting artifacts
      if (/^\d+$/.test(word) || /^[^\w]+$/.test(word) || word.length < 2) {
        console.log(`Skipping word: ${word} (number or formatting artifact)`);
        continue;
      }
      
      processedWords.add(word);
      console.log(`Processing food word: ${word}`);

      let foodFound = false;
      let portionSize = 100; // default portion size

      // First, try exact match in database
      if (this.foodDatabase[word]) {
        const nutrition = this.foodDatabase[word];
        portionSize = portionEstimates[word] || 100;
        
        const cholesterol = (nutrition.cholesterol * portionSize) / 100;
        const calories = (nutrition.calories * portionSize) / 100;
        const fat = (nutrition.fat * portionSize) / 100;
        
        totalCholesterol += cholesterol;
        totalCalories += calories;
        totalFat += fat;
        foodsFound.push({
          food: word,
          portion: portionSize,
          cholesterol: cholesterol,
          calories: calories,
          fat: fat,
          source: 'database'
        });
        foodFound = true;
        console.log(`Found in database: ${word} - ${cholesterol}mg cholesterol, ${calories} calories`);
      }

      // If not found, try fuzzy matching and category detection
      if (!foodFound) {
        // Check for portion size indicators
        const portionMatch = word.match(/^(\d+)(g|gram|grams|oz|ounce|ounces|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|slice|slices|piece|pieces)$/);
        if (portionMatch) {
          const amount = parseFloat(portionMatch[1]);
          const unit = portionMatch[2];
          
          // Convert to grams
          if (unit.includes('oz') || unit.includes('ounce')) {
            portionSize = amount * 28.35;
          } else if (unit.includes('cup')) {
            portionSize = amount * 240;
          } else if (unit.includes('tbsp') || unit.includes('tablespoon')) {
            portionSize = amount * 15;
          } else if (unit.includes('tsp') || unit.includes('teaspoon')) {
            portionSize = amount * 5;
          } else if (unit.includes('slice')) {
            portionSize = amount * 30;
          } else if (unit.includes('piece')) {
            portionSize = amount * 50;
          } else {
            portionSize = amount;
          }
          console.log(`Skipping portion indicator: ${word}`);
          continue; // Skip to next word as this is just a portion indicator
        }

        // Try to categorize unknown food
        for (const [category, patterns] of Object.entries(foodPatterns)) {
          if (patterns.some(pattern => word.includes(pattern) || pattern.includes(word))) {
            const nutrition = foodCategories[category];
            const cholesterol = (nutrition.cholesterol * portionSize) / 100;
            const calories = (nutrition.calories * portionSize) / 100;
            const fat = (nutrition.fat * portionSize) / 100;
            
            totalCholesterol += cholesterol;
            totalCalories += calories;
            totalFat += fat;
            foodsFound.push({
              food: word,
              portion: portionSize,
              cholesterol: cholesterol,
              calories: calories,
              fat: fat,
              source: 'category',
              category: category
            });
            foodFound = true;
            console.log(`Categorized as ${category}: ${word} - ${cholesterol}mg cholesterol, ${calories} calories`);
            break;
          }
        }

        // If still not found, try online search
        if (!foodFound && word.length > 2) {
          console.log(`Searching online for: ${word}`);
          const onlineResult = await this.searchFoodOnline(word);
          
          if (onlineResult) {
            console.log(`Found online: ${word} → ${onlineResult.name} (${onlineResult.category})`);
            foodsFound.push({
              food: onlineResult.name,
              portion: portionEstimates[onlineResult.name] || 100,
              cholesterol: onlineResult.cholesterol,
              calories: onlineResult.calories,
              fat: onlineResult.fat,
              source: 'online_search',
              category: onlineResult.category,
              confidence: onlineResult.confidence
            });
            foodFound = true;
          } else {
            // If online search fails, add to unrecognized list
            unrecognizedFoods.push(word);
            console.log(`Unrecognized food: ${word}`);
          }
        }
      }
    }

    // Handle unrecognized foods with conservative estimates
    if (unrecognizedFoods.length > 0) {
      console.log(`Unrecognized foods: ${unrecognizedFoods.join(', ')}`);
      const conservativeEstimate = {
        cholesterol: 10, // conservative estimate
        calories: 50,
        fat: 2.0
      };

      unrecognizedFoods.forEach(food => {
        const cholesterol = (conservativeEstimate.cholesterol * 50) / 100; // 50g portion
        const calories = (conservativeEstimate.calories * 50) / 100;
        const fat = (conservativeEstimate.fat * 50) / 100;
        
        totalCholesterol += cholesterol;
        totalCalories += calories;
        totalFat += fat;
        foodsFound.push({
          food: food,
          portion: 50,
          cholesterol: cholesterol,
          calories: calories,
          fat: fat,
          source: 'estimate'
        });
        console.log(`Conservative estimate for ${food}: ${cholesterol}mg cholesterol, ${calories} calories`);
      });
    }
    
    console.log('Final nutrition calculation:', {
      totalCholesterol: Math.round(totalCholesterol),
      totalCalories: Math.round(totalCalories),
      totalFat: Math.round(totalFat * 10) / 10,
      foodsFound: foodsFound.length
    });
    
    return {
      estimatedCholesterol: Math.round(totalCholesterol),
      estimatedCalories: Math.round(totalCalories),
      estimatedFat: Math.round(totalFat * 10) / 10,
      foodsFound: foodsFound,
      hasData: foodsFound.length > 0,
      unrecognizedFoods: unrecognizedFoods
    };
  }

  // Enhanced meal logging with automatic nutrition calculation
  async addMeal(e) {
    e.preventDefault();
    console.log('=== ADD MEAL METHOD CALLED ===');
    
    // Prevent multiple submissions
    const submitButton = e.target.querySelector('button[type="submit"]');
    if (submitButton && submitButton.disabled) {
      console.log('Button already disabled, returning');
      return; // Already processing
    }
    
    // Disable submit button to prevent multiple submissions
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Processing...';
      console.log('Button disabled and text changed to Processing...');
    } else {
      console.log('Submit button not found in event target');
    }
    
    console.log('Add meal form submitted');

    // Get current user from authManager
    if (window.authManager) {
      this.currentUser = window.authManager.getCurrentUser();
      console.log('Current user from authManager:', this.currentUser ? this.currentUser.uid : 'null');
    } else {
      console.log('authManager not found');
    }
    
    if (!this.currentUser || !this.currentUser.uid) {
      console.error('No authenticated user found');
      this.showToast('Please sign in to add meals', 'error');
      this.reenableSubmitButton(submitButton);
      return;
    }

    const addMealForm = document.getElementById('addMealForm');
    if (!addMealForm) {
      console.error('Add meal form not found');
      this.reenableSubmitButton(submitButton);
      return;
    }
    console.log('Add meal form found:', addMealForm);

    // Check if we're in edit mode
    const isEditMode = addMealForm.dataset.editIndex !== undefined;
    const editIndex = parseInt(addMealForm.dataset.editIndex);
    const editId = addMealForm.dataset.editId;
    console.log('Edit mode:', isEditMode, 'Edit index:', editIndex, 'Edit ID:', editId);

    // Collect form data
    const formData = new FormData(addMealForm);
    const mealName = formData.get('mealName');
    const mealType = formData.get('mealType');
    const date = formData.get('date');
    const time = formData.get('time');
    const mealNotes = formData.get('mealNotes');

    console.log('Form data collected:', { mealName, mealType, date, time, mealNotes });

    if (!mealName || !mealType || !date || !time) {
      console.log('Missing required fields');
      this.showToast('Please fill in all required fields', 'error');
      this.reenableSubmitButton(submitButton);
      return;
    }

    console.log('Meal data:', { mealName, mealType, date, time, mealNotes });

    // Calculate nutrition
    const nutritionData = await this.calculateCholesterolFromMeal(mealName, mealNotes);
    console.log('Nutrition calculated:', nutritionData);

    // Create meal object
    const mealData = {
      name: mealName,
      type: mealType,
      date: date,
      time: time,
      notes: mealNotes,
      timestamp: new Date(`${date}T${time}`),
      userId: this.currentUser.uid,
      hasNutritionData: nutritionData.hasData,
      estimatedCholesterol: nutritionData.estimatedCholesterol,
      estimatedCalories: nutritionData.estimatedCalories,
      estimatedFat: nutritionData.estimatedFat,
      foodsFound: nutritionData.foodsFound
    };

    try {
      console.log('Saving meal to database...');
      
      if (isEditMode) {
        // Update existing meal
        if (editId) {
          await this.db.collection('meals').doc(editId).update(mealData);
        }
        
        // Update local array
        if (this.meals[editIndex]) {
          this.meals[editIndex] = { ...this.meals[editIndex], ...mealData };
        }
        
        // Exit edit mode
        this.cancelEdit();
        
        this.showToast('Meal updated successfully', 'success');
      } else {
        // Add new meal
        const docRef = await this.db.collection('meals').add(mealData);
        mealData.id = docRef.id;
        this.meals.unshift(mealData);
        this.showToast('Meal added successfully', 'success');
      }

      console.log('Meal saved successfully');

      // Reset form
      addMealForm.reset();
      this.setDefaultDateTime();

      // Update UI
      this.renderMealHistory();
      this.updateNutritionOverview();

    } catch (error) {
      console.error('Error saving meal:', error);
      this.showToast('Error saving meal', 'error');
    } finally {
      // Re-enable submit button
      this.reenableSubmitButton(submitButton);
    }
  }

  // Helper method to re-enable submit button
  reenableSubmitButton(submitButton) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Add Meal';
    }
  }

  // Helper method to calculate daily cholesterol intake
  async calculateDailyCholesterolIntake(date) {
    if (!this.currentUser || !this.currentUser.uid) {
      console.log('No current user, cannot calculate daily cholesterol intake.');
      return 0;
    }

    console.log('Calculating daily cholesterol intake for date:', date);
    
    // Always use the fallback calculation method since it handles different timestamp formats better
    // and is more reliable than the Firebase query which can have index issues
    const result = this.calculateDailyCholesterolFromLocalData(date);
    console.log('Daily cholesterol calculation result:', result);
    return result;
  }

  // Fallback method to calculate daily cholesterol from local data
  calculateDailyCholesterolFromLocalData(date) {
    if (!this.meals || this.meals.length === 0) {
      console.log('No meals available for daily cholesterol calculation');
      return 0;
    }

    console.log('Calculating daily cholesterol for date:', date);
    console.log('Available meals:', this.meals.length);

    let totalCholesterol = 0;
    
    this.meals.forEach(meal => {
      try {
        // Handle different timestamp formats
        let mealDate;
        if (meal.timestamp && meal.timestamp.toDate) {
          // Firestore timestamp
          mealDate = meal.timestamp.toDate();
        } else if (meal.timestamp) {
          // Regular date object or string
          mealDate = new Date(meal.timestamp);
        } else {
          console.log('No timestamp found for meal:', meal.name);
          return;
        }

        // Check if date is valid
        if (isNaN(mealDate.getTime())) {
          console.log('Invalid timestamp for meal:', meal.name, meal.timestamp);
          return;
        }

        const mealDateString = mealDate.toISOString().split('T')[0];
        console.log(`Meal date: ${mealDateString}, target date: ${date}, match: ${mealDateString === date}`);
        
        if (mealDateString === date && meal.hasNutritionData) {
          totalCholesterol += meal.estimatedCholesterol || 0;
          console.log(`Added ${meal.estimatedCholesterol}mg cholesterol from meal: ${meal.name}`);
        }
      } catch (error) {
        console.error('Error processing meal timestamp:', error, meal);
      }
    });

    console.log('Total daily cholesterol calculated:', totalCholesterol);
    return totalCholesterol;
  }

  // Helper method to update nutrition overview
  async updateNutritionOverview() {
    console.log('=== UPDATING NUTRITION OVERVIEW ===');
    const today = new Date().toISOString().split('T')[0];
    console.log('Today\'s date:', today);
    
    // Calculate total cholesterol from all meals (not just today)
    let totalCholesterol = 0;
    let mealsWithCholesterol = 0;
    
    this.meals.forEach(meal => {
      if (meal.hasNutritionData && meal.estimatedCholesterol > 0) {
        totalCholesterol += meal.estimatedCholesterol;
        mealsWithCholesterol++;
      }
    });
    
    console.log('Total cholesterol from all meals:', totalCholesterol, 'from', mealsWithCholesterol, 'meals');
    
    // Update total calories from all meals
    const totalCaloriesElement = document.getElementById('totalCalories');
    console.log('Total calories element found:', !!totalCaloriesElement);
    if (totalCaloriesElement) {
      // Calculate total calories from all meals
      let totalCalories = 0;
      this.meals.forEach(meal => {
        if (meal.hasNutritionData) {
          totalCalories += meal.estimatedCalories || 0;
        }
      });
      console.log('Total calories calculated:', totalCalories);
      totalCaloriesElement.textContent = totalCalories > 0 ? Math.round(totalCalories) : '--';
    }

    // Update today's calories
    const todayCaloriesElement = document.getElementById('todayCalories');
    console.log('Today calories element found:', !!todayCaloriesElement);
    if (todayCaloriesElement) {
      const today = new Date().toISOString().split('T')[0];
      let todayCalories = 0;
      
      this.meals.forEach(meal => {
        try {
          let mealDate;
          if (meal.timestamp && meal.timestamp.toDate) {
            mealDate = meal.timestamp.toDate();
          } else if (meal.timestamp) {
            mealDate = new Date(meal.timestamp);
          } else {
            return;
          }

          if (isNaN(mealDate.getTime())) {
            return;
          }

          const mealDateString = mealDate.toISOString().split('T')[0];
          if (mealDateString === today && meal.hasNutritionData) {
            todayCalories += meal.estimatedCalories || 0;
          }
        } catch (error) {
          console.error('Error processing meal timestamp for today calories:', error, meal);
        }
      });
      console.log('Today\'s calories calculated:', todayCalories);
      todayCaloriesElement.textContent = todayCalories > 0 ? Math.round(todayCalories) : '--';
    }

    // Update this month's calories
    const monthlyCaloriesElement = document.getElementById('monthlyCalories');
    console.log('Monthly calories element found:', !!monthlyCaloriesElement);
    if (monthlyCaloriesElement) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      let monthlyCalories = 0;
      
      this.meals.forEach(meal => {
        try {
          let mealDate;
          if (meal.timestamp && meal.timestamp.toDate) {
            mealDate = meal.timestamp.toDate();
          } else if (meal.timestamp) {
            mealDate = new Date(meal.timestamp);
          } else {
            return;
          }

          if (isNaN(mealDate.getTime())) {
            return;
          }

          // Check if meal is from current month and year
          if (mealDate.getMonth() === currentMonth && 
              mealDate.getFullYear() === currentYear && 
              meal.hasNutritionData) {
            monthlyCalories += meal.estimatedCalories || 0;
          }
        } catch (error) {
          console.error('Error processing meal timestamp for monthly calories:', error, meal);
        }
      });
      console.log('Monthly calories calculated:', monthlyCalories);
      monthlyCaloriesElement.textContent = monthlyCalories > 0 ? Math.round(monthlyCalories) : '--';
    }

    // Update total meals count
    const totalMeals = document.getElementById('totalMeals');
    console.log('Total meals element found:', !!totalMeals);
    if (totalMeals) {
      totalMeals.textContent = this.meals.length;
      console.log('Total meals count updated:', this.meals.length);
    }

    // Update cholesterol level
    const cholesterolLevel = document.getElementById('cholesterolLevel');
    console.log('Cholesterol level element found:', !!cholesterolLevel);
    if (cholesterolLevel) {
      if (totalCholesterol === 0) {
        cholesterolLevel.textContent = 'No data';
        cholesterolLevel.style.color = '#6c757d';
        console.log('Cholesterol level set to: No data');
      } else if (totalCholesterol > 0) {
        // Check total intake limits
        const limitCheck = this.checkCholesterolLimits(totalCholesterol);
        cholesterolLevel.textContent = `${Math.round(totalCholesterol)} mg (est.)`;
        
        // Set color to black for the number
        cholesterolLevel.style.color = '#000000';
        
        console.log('Cholesterol level updated:', `${Math.round(totalCholesterol)} mg (est.)`, limitCheck.status);
      }
    }

    // Calculate total nutrition from all meals for potential future use
    let totalCalories = 0;
    let totalFat = 0;
    let mealsWithData = 0;

    this.meals.forEach(meal => {
      if (meal.hasNutritionData) {
        totalCalories += meal.estimatedCalories || 0;
        totalFat += meal.estimatedFat || 0;
        mealsWithData++;
      }
    });

    // Store totals for potential future use or debugging
    console.log('Nutrition Overview Updated:', {
      totalCholesterol,
      totalMeals: this.meals.length,
      totalCalories,
      totalFat,
      mealsWithData
    });
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

    mealHistoryList.innerHTML = this.meals.map((meal, index) => {
      const timestamp = this.formatTimestamp(meal.timestamp);
      const mealTypeIcon = this.getMealTypeIcon(meal.type);
      
      // Add nutrition information if available
      let nutritionInfo = '';
      let foodsBreakdown = '';
      
      if (meal.hasNutritionData) {
        nutritionInfo = `
          <div class="meal-nutrition">
            <span class="nutrition-item">${meal.estimatedCalories} cal</span>
            <span class="nutrition-item">${meal.estimatedCholesterol}mg chol</span>
            <span class="nutrition-item">${meal.estimatedFat}g fat</span>
          </div>
        `;
        
        // Show detailed foods breakdown - ONLY show actual detected foods
        if (meal.foodsFound && meal.foodsFound.length > 0) {
          // Filter out non-food words and only show foods that were actually analyzed
          const actualFoods = meal.foodsFound.filter(food => 
            food.source === 'database' || 
            food.source === 'category' || 
            food.source === 'online_search' ||
            (food.source === 'estimate' && food.food.length > 2 && 
             !['the', 'and', 'with', 'on', 'in', 'at', 'to', 'for', 'of', 'a', 'an', 'i', 'had', 'ate', 'drank', 'consumed'].includes(food.food.toLowerCase()))
          );
          
          if (actualFoods.length > 0) {
            const databaseFoods = actualFoods.filter(f => f.source === 'database');
            const categoryFoods = actualFoods.filter(f => f.source === 'category');
            const onlineFoods = actualFoods.filter(f => f.source === 'online_search');
            const estimateFoods = actualFoods.filter(f => f.source === 'estimate');
            
            foodsBreakdown = `
              <div class="foods-breakdown">
                <h5>🍽️ Foods Detected:</h5>
                ${databaseFoods.length > 0 ? `
                  <div class="foods-section">
                    <h6>✅ Database Foods (Accurate):</h6>
                    <div class="foods-list">
                      ${databaseFoods.map(food => `
                        <div class="food-item database">
                          <span class="food-name">${food.food}</span>
                          <span class="food-portion">(${Math.round(food.portion)}g)</span>
                          <span class="food-cholesterol">${Math.round(food.cholesterol)}mg chol</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
                
                ${onlineFoods.length > 0 ? `
                  <div class="foods-section">
                    <h6>🌐 Online Search (Real Data):</h6>
                    <div class="foods-list">
                      ${onlineFoods.map(food => `
                        <div class="food-item online">
                          <span class="food-name">${food.food}</span>
                          <span class="food-portion">(${Math.round(food.portion)}g)</span>
                          <span class="food-cholesterol">${Math.round(food.cholesterol)}mg chol</span>
                          <span class="food-category">[${food.category}]</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
                
                ${categoryFoods.length > 0 ? `
                  <div class="foods-section">
                    <h6>🔍 Category Foods (Estimated):</h6>
                    <div class="foods-list">
                      ${categoryFoods.map(food => `
                        <div class="food-item category">
                          <span class="food-name">${food.food}</span>
                          <span class="food-portion">(${Math.round(food.portion)}g)</span>
                          <span class="food-cholesterol">${Math.round(food.cholesterol)}mg chol</span>
                          <span class="food-category">[${food.category}]</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
                
                ${estimateFoods.length > 0 ? `
                  <div class="foods-section">
                    <h6>❓ Unknown Foods (Conservative Estimate):</h6>
                    <div class="foods-list">
                      ${estimateFoods.map(food => `
                        <div class="food-item estimate">
                          <span class="food-name">${food.food}</span>
                          <span class="food-portion">(${Math.round(food.portion)}g)</span>
                          <span class="food-cholesterol">${Math.round(food.cholesterol)}mg chol</span>
                          <span class="food-note">[estimated]</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            `;
          }
        }
      }
      
      return `
        <div class="history-item meal-entry" data-meal-index="${index}">
          <div class="history-header">
            <div class="history-type">
              <span class="meal-type-icon">${mealTypeIcon}</span>
              <span class="meal-type">${meal.type}</span>
            </div>
            <div class="history-actions">
              <span class="history-date">${timestamp}</span>
              <div class="action-buttons">
                <button class="btn-edit" onclick="nutritionTracker.editMeal(${index})" title="Edit meal">
                  <i class="fas fa-edit"></i>
                  <span class="btn-text">Edit</span>
                </button>
                <button class="btn-delete" onclick="nutritionTracker.deleteMeal(${index})" title="Delete meal">
                  <i class="fas fa-trash"></i>
                  <span class="btn-text">Delete</span>
                </button>
              </div>
            </div>
          </div>
          <div class="history-content">
            <h4>${meal.name}</h4>
            ${meal.notes ? `<p>${meal.notes}</p>` : ''}
            ${nutritionInfo}
            ${foodsBreakdown}
          </div>
        </div>
      `;
    }).join('');
  }

  // Helper method to check if a word is a non-food word
  isNonFoodWord(word) {
    const nonFoodWords = [
      // Articles
      'the', 'a', 'an',
      // Prepositions
      'with', 'on', 'in', 'at', 'to', 'for', 'of', 'from', 'by', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'under', 'over', 'across', 'along', 'around', 'behind', 'beneath', 'beside', 'beyond', 'inside', 'outside', 'within', 'without',
      // Conjunctions
      'and', 'or', 'but', 'nor', 'yet', 'so', 'because', 'although', 'unless', 'while', 'whereas', 'since', 'as', 'if', 'whether', 'though', 'even', 'though',
      // Pronouns
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'his', 'hers', 'ours', 'theirs', 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves',
      // Common verbs
      'had', 'ate', 'drank', 'consumed', 'was', 'were', 'is', 'are', 'am', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'eat', 'drink', 'cook', 'prepare', 'make', 'made', 'making', 'add', 'added', 'adding', 'mix', 'mixed', 'mixing', 'stir', 'stirred', 'stirring', 'heat', 'heated', 'heating', 'serve', 'served', 'serving',
      // Other common words
      'this', 'that', 'these', 'those', 'here', 'there', 'where', 'when', 'why', 'how', 'what', 'which', 'who', 'whom', 'whose', 'each', 'every', 'all', 'both', 'either', 'neither', 'any', 'some', 'no', 'none', 'other', 'another', 'others', 'such', 'same', 'different', 'similar', 'various', 'several', 'many', 'much', 'few', 'little', 'more', 'most', 'least', 'less', 'enough', 'too', 'very', 'quite', 'rather', 'just', 'only', 'even', 'still', 'again', 'back', 'away', 'out', 'up', 'down', 'over', 'under',
      // Time words
      'today', 'yesterday', 'tomorrow', 'morning', 'afternoon', 'evening', 'night', 'breakfast', 'lunch', 'dinner', 'snack', 'meal', 'meals', 'time', 'times', 'hour', 'hours', 'minute', 'minutes', 'second', 'seconds', 'day', 'days', 'week', 'weeks', 'month', 'months', 'year', 'years', 'now', 'then', 'ago', 'before', 'after', 'during', 'while', 'when', 'since', 'until', 'till', 'by', 'from', 'to',
      // Quantity words (unless followed by food)
      'some', 'any', 'many', 'much', 'few', 'several', 'lots', 'plenty', 'enough', 'more', 'less', 'most', 'least', 'all', 'both', 'each', 'every', 'none', 'no', 'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'hundred', 'thousand', 'million', 'billion', 'dozen', 'dozens', 'pair', 'pairs', 'set', 'sets', 'group', 'groups', 'bunch', 'bunches', 'pack', 'packs', 'box', 'boxes', 'can', 'cans', 'jar', 'jars', 'bottle', 'bottles', 'bag', 'bags', 'container', 'containers',
      // Common connectors and modifiers
      'also', 'too', 'as', 'like', 'such', 'very', 'really', 'quite', 'rather', 'just', 'only', 'even', 'still', 'again', 'back', 'away', 'out', 'up', 'down', 'over', 'under', 'well', 'badly', 'good', 'bad', 'better', 'worse', 'best', 'worst', 'big', 'small', 'large', 'tiny', 'huge', 'enormous', 'giant', 'mini', 'miniature', 'fresh', 'frozen', 'cooked', 'raw', 'hot', 'cold', 'warm', 'cool', 'spicy', 'mild', 'sweet', 'sour', 'bitter', 'salty', 'tasty', 'delicious', 'yummy', 'gross', 'disgusting', 'healthy', 'unhealthy', 'organic', 'natural', 'artificial', 'homemade', 'store', 'bought', 'prepared', 'ready', 'made',
      // Formatting and punctuation artifacts
      'mg', 'g', 'gram', 'grams', 'oz', 'ounce', 'ounces', 'cup', 'cups', 'tbsp', 'tablespoon', 'tablespoons', 'tsp', 'teaspoon', 'teaspoons', 'slice', 'slices', 'piece', 'pieces', 'serving', 'servings', 'portion', 'portions', 'cal', 'calorie', 'calories', 'kcal', 'kilocalorie', 'kilocalories', 'fat', 'protein', 'carb', 'carbohydrate', 'carbohydrates', 'fiber', 'sugar', 'sodium', 'salt', 'vitamin', 'vitamins', 'mineral', 'minerals', 'cholesterol', 'saturated', 'unsaturated', 'trans', 'omega', 'fiber', 'dietary', 'nutritional', 'nutrition', 'nutrient', 'nutrients',
      // Common food preparation words (not actual foods)
      'cooked', 'raw', 'fried', 'baked', 'grilled', 'roasted', 'boiled', 'steamed', 'sauteed', 'stir', 'fried', 'deep', 'pan', 'oven', 'microwave', 'toasted', 'toast', 'toasting', 'heated', 'warmed', 'chilled', 'frozen', 'thawed', 'defrosted', 'marinated', 'seasoned', 'spiced', 'salted', 'peppered', 'sauced', 'dressed', 'topped', 'filled', 'stuffed', 'wrapped', 'rolled', 'sliced', 'chopped', 'diced', 'minced', 'grated', 'shredded', 'crumbled', 'mashed', 'pureed', 'blended', 'mixed', 'combined', 'added', 'included', 'served', 'plated', 'presented'
    ];
    
    // Also check for common patterns that indicate non-food words
    const nonFoodPatterns = [
      /^\d+$/, // Just numbers
      /^[^\w]+$/, // Just punctuation/symbols
      /^[a-z]$/, // Single letters
      /^(mg|g|oz|cup|tbsp|tsp|cal|kcal)$/i, // Units only
      /^(slice|piece|serving|portion)s?$/i, // Portion words
      /^(cooked|raw|fried|baked|grilled|roasted|boiled|steamed)$/i, // Preparation methods
      /^(fresh|frozen|organic|natural|homemade|store|bought)$/i, // Descriptors
      /^(delicious|tasty|yummy|gross|disgusting|healthy|unhealthy)$/i // Taste/health descriptors
    ];
    
    const lowerWord = word.toLowerCase();
    
    // Check exact matches
    if (nonFoodWords.includes(lowerWord)) {
      return true;
    }
    
    // Check patterns
    for (const pattern of nonFoodPatterns) {
      if (pattern.test(lowerWord)) {
        return true;
      }
    }
    
    return false;
  }

  // Helper method to format timestamp for display
  formatTimestamp(timestamp) {
    try {
      let date;
      
      // Handle different timestamp formats
      if (timestamp instanceof Date) {
        date = timestamp;
      } else if (timestamp && timestamp.toDate) {
        // Firebase Timestamp
        date = timestamp.toDate();
      } else if (timestamp && timestamp.seconds) {
        // Firebase Timestamp object
        date = new Date(timestamp.seconds * 1000);
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        // String or number timestamp
        date = new Date(timestamp);
      } else {
        // Fallback to current date
        date = new Date();
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Date unavailable';
      }
      
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return 'Date unavailable';
    }
  }

  // Helper method to get meal type icon
  getMealTypeIcon(type) {
    switch (type) {
      case 'Breakfast':
        return '🥣';
      case 'Lunch':
        return '🍽️';
      case 'Dinner':
        return '🍽️';
      case 'Snack':
        return '🍫';
      default:
        return '🍽️';
    }
  }

  // Helper method to show toast messages
  showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
      console.error('Toast container not found');
      return;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Helper method to set default date and time for new meals
  setDefaultDateTime() {
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    if (dateInput && timeInput) {
      const today = new Date();
      dateInput.value = today.toISOString().split('T')[0];
      timeInput.value = today.toTimeString().substring(0, 5);
    }
  }

  // Helper method to load nutrition data from database
  async loadNutritionData() {
    if (!this.currentUser || !this.currentUser.uid) {
      console.log('No current user, cannot load nutrition data.');
      return;
    }

    try {
      console.log('Loading nutrition data for user:', this.currentUser.uid);
      
      // Load meals data
      const mealsSnapshot = await this.db.collection('meals')
        .where('userId', '==', this.currentUser.uid)
        .orderBy('timestamp', 'desc')
        .get();

      this.meals = [];
      let totalCholesterol = 0;
      let totalCalories = 0;
      let totalFat = 0;
      let mealsWithData = 0;

      mealsSnapshot.docs.forEach(doc => {
        const meal = doc.data();
        meal.id = doc.id; // Ensure meal has ID
        this.meals.push(meal);
        if (meal.hasNutritionData) {
          totalCholesterol += meal.estimatedCholesterol || 0;
          totalCalories += meal.estimatedCalories || 0;
          totalFat += meal.estimatedFat || 0;
          mealsWithData++;
        }
      });

      console.log(`Loaded ${this.meals.length} meals, ${mealsWithData} with nutrition data`);
      console.log('Total nutrition loaded:', { totalCholesterol, totalCalories, totalFat });

      // Update UI in correct order
      this.renderMealHistory();
      this.renderCholesterolHistory();
      this.updateNutritionOverview();
    } catch (error) {
      console.error('Error loading nutrition data:', error);
      this.showToast('Error loading nutrition data', 'error');
    }
  }



  // Helper method to generate cholesterol recommendations
  generateCholesterolRecommendations(meals) {
    const cholesterolRecommendations = [];
    const cholesterolThreshold = 240; // mg/dL
    const highCholesterolFoods = new Set();

    meals.forEach(meal => {
      if (meal.hasNutritionData && meal.estimatedCholesterol > cholesterolThreshold) {
        highCholesterolFoods.add(meal.name);
      }
    });

    if (highCholesterolFoods.size > 0) {
      cholesterolRecommendations.push({
        message: `You've consumed high cholesterol foods today. Consider replacing them with lower cholesterol options.`,
        foods: Array.from(highCholesterolFoods)
      });
    }

    return cholesterolRecommendations;
  }

  // Helper method to check cholesterol intake limits
  checkCholesterolLimits(dailyCholesterol) {
    const cholesterolThreshold = 240; // mg/dL
    const warningThreshold = 200; // mg/dL

    if (dailyCholesterol > cholesterolThreshold) {
      return {
        status: 'exceeded',
        message: `Your daily cholesterol intake of ${dailyCholesterol} mg is above the recommended limit of ${cholesterolThreshold} mg.`,
        action: 'Reduce cholesterol-rich foods.'
      };
    } else if (dailyCholesterol > warningThreshold) {
      return {
        status: 'warning',
        message: `Your daily cholesterol intake of ${dailyCholesterol} mg is approaching the recommended limit.`,
        action: 'Monitor your cholesterol intake.'
      };
    } else {
      return {
        status: 'ok',
        message: `Your daily cholesterol intake of ${dailyCholesterol} mg is within the recommended limit.`,
        action: 'Keep up the good work!'
      };
    }
  }

  // Helper method to render cholesterol history from meals
  async renderCholesterolHistory() {
    const cholesterolHistoryList = document.getElementById('cholesterolEntriesList');
    if (!cholesterolHistoryList) {
      console.log('Cholesterol history list element not found');
      return;
    }

    cholesterolHistoryList.innerHTML = ''; // Clear previous history

    // Filter meals that have cholesterol data
    const mealsWithCholesterol = this.meals.filter(meal => 
      meal.hasNutritionData && meal.estimatedCholesterol > 0
    );

    if (mealsWithCholesterol.length === 0) {
      cholesterolHistoryList.innerHTML = `
        <div class="no-data">
          <p>No cholesterol data from meals yet. Add meals with cholesterol-containing foods to see your intake!</p>
          <p class="cholesterol-info">💡 <strong>Tip:</strong> Cholesterol is automatically calculated from the foods you eat, such as eggs, cheese, meat, and dairy products.</p>
        </div>
      `;
      return;
    }

    // Sort meals by date (newest first)
    const sortedMeals = [...mealsWithCholesterol].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    sortedMeals.forEach(meal => {
      // Handle different timestamp formats
      let mealDate;
      if (meal.timestamp && meal.timestamp.toDate) {
        // Firestore timestamp
        mealDate = meal.timestamp.toDate();
      } else if (meal.timestamp) {
        // Regular date object or string
        mealDate = new Date(meal.timestamp);
      } else {
        mealDate = new Date(); // Fallback to current date
      }

      // Check if date is valid
      if (isNaN(mealDate.getTime())) {
        mealDate = new Date(); // Fallback to current date if invalid
      }

      const date = mealDate.toLocaleDateString();
      const time = mealDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const cholesterolValue = Math.round(meal.estimatedCholesterol);
      
      cholesterolHistoryList.innerHTML += `
        <div class="cholesterol-entry meal-based" data-id="${meal.id || ''}">
          <div class="entry-header">
            <span class="entry-date">${date} at ${time}</span>
            <span class="entry-value ${this.getCholesterolStatusClass(cholesterolValue)}">${cholesterolValue} mg (from food)</span>
          </div>
          <div class="entry-meal">
            <strong>Meal:</strong> ${meal.name} (${meal.type})
            ${meal.foodsFound && meal.foodsFound.length > 0 ? 
              `<br><small>Foods detected: ${this.formatFoodsFound(meal.foodsFound)}</small>` : ''}
          </div>
          ${meal.notes ? `<div class="entry-notes">${meal.notes}</div>` : ''}
          <div class="entry-nutrition">
            <span class="nutrition-item">${Math.round(meal.estimatedCalories || 0)} cal</span>
            <span class="nutrition-item">${Math.round(meal.estimatedFat || 0)}g fat</span>
          </div>
        </div>
      `;
    });
  }

  getCholesterolStatusClass(value) {
    // For dietary cholesterol (mg), use different thresholds than blood cholesterol (mg/dL)
    if (value < 200) return 'cholesterol-normal';
    if (value < 300) return 'cholesterol-borderline';
    return 'cholesterol-high';
  }

  formatFoodsFound(foodsFound) {
    if (!foodsFound || !Array.isArray(foodsFound)) {
      return '';
    }

    const foodNames = foodsFound.map(food => {
      if (typeof food === 'string') {
        return food;
      } else if (food && typeof food === 'object') {
        // Handle different food object formats
        if (food.food) {
          return food.food;
        } else if (food.name) {
          return food.name;
        } else if (food.foodName) {
          return food.foodName;
        } else {
          return 'Unknown food';
        }
      } else {
        return 'Unknown food';
      }
    });

    return foodNames.join(', ');
  }



  // Helper method to edit a meal
  async editMeal(index) {
    const meal = this.meals[index];
    if (!meal) {
      this.showToast('Meal not found', 'error');
      return;
    }

    // Populate the form with existing data
    const mealNameInput = document.getElementById('mealName');
    const mealTypeSelect = document.getElementById('mealType');
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const mealNotesInput = document.getElementById('mealNotes');

    if (mealNameInput) mealNameInput.value = meal.name;
    if (mealTypeSelect) mealTypeSelect.value = meal.type;
    if (dateInput) {
      const mealDate = new Date(meal.timestamp);
      dateInput.value = mealDate.toISOString().split('T')[0];
    }
    if (timeInput) {
      const mealDate = new Date(meal.timestamp);
      timeInput.value = mealDate.toTimeString().substring(0, 5);
    }
    if (mealNotesInput) mealNotesInput.value = meal.notes || '';

    // Change form to edit mode
    const addMealForm = document.getElementById('addMealForm');
    if (addMealForm) {
      addMealForm.dataset.editIndex = index;
      addMealForm.dataset.editId = meal.id;
      
      // Change submit button text
      const submitButton = addMealForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.textContent = 'Update Meal';
        submitButton.classList.remove('btn-primary');
        submitButton.classList.add('btn-warning');
      }

      // Show cancel button
      const cancelButton = addMealForm.querySelector('.cancel-edit-btn');
      if (cancelButton) {
        cancelButton.style.display = 'inline-block';
      }
    }

    // Scroll to form
    addMealForm?.scrollIntoView({ behavior: 'smooth' });
    this.showToast('Edit mode activated - update the meal details and click "Update Meal"', 'info');
  }

  // Helper method to delete a meal
  async deleteMeal(index) {
    const meal = this.meals[index];
    if (!meal) {
      this.showToast('Meal not found', 'error');
      return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${meal.name}"?`)) {
      return;
    }

    try {
      // Delete from database if it has an ID
      if (meal.id) {
        await this.db.collection('meals').doc(meal.id).delete();
      }
      
      // Remove from local array
      this.meals.splice(index, 1);
      
      // Re-render the history
      this.renderMealHistory();
      this.updateNutritionOverview();
      
      this.showToast('Meal deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting meal:', error);
      this.showToast('Error deleting meal', 'error');
    }
  }

  // Helper method to cancel edit mode
  cancelEdit() {
    const addMealForm = document.getElementById('addMealForm');
    if (addMealForm) {
      // Clear edit mode
      delete addMealForm.dataset.editIndex;
      delete addMealForm.dataset.editId;
      
      // Reset form
      addMealForm.reset();
      
      // Reset submit button
      const submitButton = addMealForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.textContent = 'Add Meal';
        submitButton.classList.remove('btn-warning');
        submitButton.classList.add('btn-primary');
      }

      // Hide cancel button
      const cancelButton = addMealForm.querySelector('.cancel-edit-btn');
      if (cancelButton) {
        cancelButton.style.display = 'none';
      }
    }
    
    this.showToast('Edit mode cancelled', 'info');
  }

  // Helper method to setup event listeners for forms
  setupEventListeners() {
    const addMealForm = document.getElementById('addMealForm');
    if (addMealForm) {
      // Remove any existing event listeners by cloning the form
      const newForm = addMealForm.cloneNode(true);
      newForm.id = 'addMealForm'; // Ensure the ID is preserved
      addMealForm.parentNode.replaceChild(newForm, addMealForm);
      
      // Add event listener to the new form
      newForm.addEventListener('submit', this.addMeal.bind(this));
      
      // Add cancel button for edit mode
      const cancelButton = document.createElement('button');
      cancelButton.type = 'button';
      cancelButton.className = 'btn btn-secondary cancel-edit-btn';
      cancelButton.textContent = 'Cancel Edit';
      cancelButton.style.display = 'none';
      cancelButton.onclick = () => this.cancelEdit();
      
      // Insert cancel button after submit button
      const submitButton = newForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.parentNode.insertBefore(cancelButton, submitButton.nextSibling);
      }
      
      // Set default date and time
      this.setDefaultDateTime();
    }


  }

  // Helper method to initialize the app (e.g., load data on page load)
  async initializeApp() {
    await this.loadNutritionData();
    this.updateNutritionOverview();
    this.renderMealHistory();
    this.renderCholesterolHistory();
    this.setupEventListeners();
  }

  // Main method to run the app
  run() {
    this.initializeApp();
  }

  // Enhanced method to search for unknown foods online
  async searchFoodOnline(foodName) {
    try {
      // Clean the food name for better search results
      const cleanName = foodName.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .trim();
      
      // Common food corrections
      const corrections = {
        'sandwhich': 'sandwich',
        'lettuc': 'lettuce',
        'maynoise': 'mayonnaise',
        'tomatos': 'tomatoes',
        'potatos': 'potatoes',
        'onions': 'onion',
        'carrots': 'carrot',
        'apples': 'apple',
        'bananas': 'banana',
        'oranges': 'orange'
      };
      
      const correctedName = corrections[cleanName] || cleanName;
      
      // Search for nutritional information
      const searchResults = await this.searchNutritionAPI(correctedName);
      
      if (searchResults) {
        return {
          name: correctedName,
          calories: searchResults.calories || 50,
          cholesterol: searchResults.cholesterol || 0,
          fat: searchResults.fat || 0,
          category: searchResults.category || 'vegetable',
          source: 'online_search',
          confidence: 'high'
        };
      }
      
      return null;
    } catch (error) {
      console.log(`Error searching for ${foodName}:`, error);
      return null;
    }
  }

  // Method to search nutrition API (simulated for now)
  async searchNutritionAPI(foodName) {
    // This would typically call a real nutrition API
    // For now, we'll use a comprehensive lookup table
    const nutritionDatabase = {
      // Breads and Grains
      'sandwich': { calories: 250, cholesterol: 0, fat: 3, category: 'bread' },
      'bread': { calories: 80, cholesterol: 0, fat: 1, category: 'bread' },
      'toast': { calories: 75, cholesterol: 0, fat: 1, category: 'bread' },
      'bagel': { calories: 245, cholesterol: 0, fat: 1, category: 'bread' },
      
      // Vegetables
      'lettuce': { calories: 5, cholesterol: 0, fat: 0, category: 'vegetable' },
      'tomato': { calories: 22, cholesterol: 0, fat: 0, category: 'vegetable' },
      'onion': { calories: 40, cholesterol: 0, fat: 0, category: 'vegetable' },
      'cucumber': { calories: 16, cholesterol: 0, fat: 0, category: 'vegetable' },
      'carrot': { calories: 41, cholesterol: 0, fat: 0, category: 'vegetable' },
      'spinach': { calories: 23, cholesterol: 0, fat: 0, category: 'vegetable' },
      'kale': { calories: 33, cholesterol: 0, fat: 0, category: 'vegetable' },
      'broccoli': { calories: 34, cholesterol: 0, fat: 0, category: 'vegetable' },
      'cauliflower': { calories: 25, cholesterol: 0, fat: 0, category: 'vegetable' },
      
      // Condiments and Sauces
      'mayonnaise': { calories: 94, cholesterol: 6, fat: 10, category: 'condiment' },
      'ketchup': { calories: 19, cholesterol: 0, fat: 0, category: 'condiment' },
      'mustard': { calories: 3, cholesterol: 0, fat: 0, category: 'condiment' },
      'hot sauce': { calories: 5, cholesterol: 0, fat: 0, category: 'condiment' },
      'soy sauce': { calories: 8, cholesterol: 0, fat: 0, category: 'condiment' },
      'ranch': { calories: 73, cholesterol: 8, fat: 7, category: 'condiment' },
      'bbq sauce': { calories: 29, cholesterol: 0, fat: 0, category: 'condiment' },
      
      // Fruits
      'apple': { calories: 52, cholesterol: 0, fat: 0, category: 'fruit' },
      'banana': { calories: 89, cholesterol: 0, fat: 0, category: 'fruit' },
      'orange': { calories: 47, cholesterol: 0, fat: 0, category: 'fruit' },
      'strawberry': { calories: 32, cholesterol: 0, fat: 0, category: 'fruit' },
      'blueberry': { calories: 57, cholesterol: 0, fat: 0, category: 'fruit' },
      'grape': { calories: 62, cholesterol: 0, fat: 0, category: 'fruit' },
      
      // Proteins
      'chicken': { calories: 165, cholesterol: 85, fat: 3.6, category: 'protein' },
      'beef': { calories: 250, cholesterol: 90, fat: 15, category: 'protein' },
      'pork': { calories: 242, cholesterol: 80, fat: 14, category: 'protein' },
      'fish': { calories: 100, cholesterol: 50, fat: 2, category: 'protein' },
      'salmon': { calories: 208, cholesterol: 55, fat: 12, category: 'protein' },
      'tuna': { calories: 144, cholesterol: 30, fat: 1, category: 'protein' },
      'shrimp': { calories: 85, cholesterol: 166, fat: 0.5, category: 'protein' },
      
      // Dairy
      'milk': { calories: 42, cholesterol: 5, fat: 1, category: 'dairy' },
      'cheese': { calories: 113, cholesterol: 30, fat: 9, category: 'dairy' },
      'yogurt': { calories: 59, cholesterol: 5, fat: 0.4, category: 'dairy' },
      'butter': { calories: 102, cholesterol: 31, fat: 12, category: 'dairy' },
      
      // Nuts and Seeds
      'almond': { calories: 164, cholesterol: 0, fat: 14, category: 'nut' },
      'peanut': { calories: 161, cholesterol: 0, fat: 14, category: 'nut' },
      'walnut': { calories: 185, cholesterol: 0, fat: 18, category: 'nut' },
      'cashew': { calories: 157, cholesterol: 0, fat: 12, category: 'nut' },
      
      // Oils and Fats
      'olive oil': { calories: 119, cholesterol: 0, fat: 14, category: 'oil' },
      'vegetable oil': { calories: 120, cholesterol: 0, fat: 14, category: 'oil' },
      'coconut oil': { calories: 117, cholesterol: 0, fat: 14, category: 'oil' }
    };
    
    // Try exact match first
    if (nutritionDatabase[foodName]) {
      return nutritionDatabase[foodName];
    }
    
    // Try partial matches
    for (const [key, value] of Object.entries(nutritionDatabase)) {
      if (key.includes(foodName) || foodName.includes(key)) {
        return value;
      }
    }
    
    // Try common variations
    const variations = {
      'tomatoes': 'tomato',
      'onions': 'onion',
      'carrots': 'carrot',
      'apples': 'apple',
      'bananas': 'banana',
      'oranges': 'orange',
      'strawberries': 'strawberry',
      'blueberries': 'blueberry',
      'grapes': 'grape'
    };
    
    if (variations[foodName] && nutritionDatabase[variations[foodName]]) {
      return nutritionDatabase[variations[foodName]];
    }
    
    return null;
  }
}

// Instantiate the NutritionTracker class
const nutritionTracker = new NutritionTracker();
nutritionTracker.run();