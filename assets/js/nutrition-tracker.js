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
  calculateCholesterolFromMeal(mealName, mealNotes) {
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

    // Split text into words and analyze each
    const words = text.split(/\s+/);
    const processedWords = new Set();

    for (const word of words) {
      if (processedWords.has(word)) continue;
      processedWords.add(word);

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
            break;
          }
        }

        // If still not found, add to unrecognized list
        if (!foodFound && word.length > 2 && !['the', 'and', 'with', 'on', 'in', 'at', 'to', 'for', 'of', 'a', 'an'].includes(word)) {
          unrecognizedFoods.push(word);
        }
      }
    }

    // Handle unrecognized foods with conservative estimates
    if (unrecognizedFoods.length > 0) {
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
      });
    }
    
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
        let message = `Meal logged! Estimated: ${nutrition.estimatedCalories} cal, ${nutrition.estimatedCholesterol}mg cholesterol`;
        
        // Check for high cholesterol foods and provide alternatives
        if (nutrition.estimatedCholesterol > 100) {
          const recommendations = this.generateCholesterolRecommendations([meal]);
          if (recommendations.length > 0) {
            message += `\n💡 Tip: ${recommendations[0].message}`;
          }
        }
        
        this.showToast(message, nutrition.estimatedCholesterol > 200 ? 'warning' : 'success');
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

    // Update cholesterol level with alerts
    const cholesterolLevel = document.getElementById('cholesterolLevel');
    if (cholesterolLevel) {
      if (this.cholesterolEntries.length > 0) {
        const latestCholesterol = this.cholesterolEntries[0];
        cholesterolLevel.textContent = `${latestCholesterol.value} mg/dL`;
        
        // Add visual indicator for high cholesterol
        if (latestCholesterol.value >= 240) {
          cholesterolLevel.style.color = '#dc3545';
          cholesterolLevel.style.fontWeight = 'bold';
        } else if (latestCholesterol.value >= 200) {
          cholesterolLevel.style.color = '#ffc107';
          cholesterolLevel.style.fontWeight = 'bold';
        } else {
          cholesterolLevel.style.color = '#28a745';
        }
      } else if (dailyStats.totalCholesterol > 0) {
        // Check daily intake limits
        const limitCheck = this.checkCholesterolLimits(dailyStats.totalCholesterol);
        cholesterolLevel.textContent = `${dailyStats.totalCholesterol} mg (est.)`;
        
        if (limitCheck.status === 'exceeded') {
          cholesterolLevel.style.color = '#dc3545';
          cholesterolLevel.style.fontWeight = 'bold';
          this.showToast(limitCheck.message, 'warning');
        } else if (limitCheck.status === 'warning') {
          cholesterolLevel.style.color = '#ffc107';
          cholesterolLevel.style.fontWeight = 'bold';
        } else {
          cholesterolLevel.style.color = '#28a745';
        }
      } else {
        cholesterolLevel.textContent = '--';
        cholesterolLevel.style.color = '';
        cholesterolLevel.style.fontWeight = '';
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
      let foodsBreakdown = '';
      
      if (meal.hasNutritionData) {
        nutritionInfo = `
          <div class="meal-nutrition">
            <span class="nutrition-item">${meal.estimatedCalories} cal</span>
            <span class="nutrition-item">${meal.estimatedCholesterol}mg chol</span>
            <span class="nutrition-item">${meal.estimatedFat}g fat</span>
          </div>
        `;
        
        // Show detailed foods breakdown
        if (meal.foodsFound && meal.foodsFound.length > 0) {
          const databaseFoods = meal.foodsFound.filter(f => f.source === 'database');
          const categoryFoods = meal.foodsFound.filter(f => f.source === 'category');
          const estimateFoods = meal.foodsFound.filter(f => f.source === 'estimate');
          
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
            ${foodsBreakdown}
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

  setupEventListeners() {
    // Meal form
    const mealForm = document.getElementById('mealForm');
    if (mealForm) {
      mealForm.addEventListener('submit', (e) => this.addMeal(e));
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
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].substring(0, 5);

    const mealDate = document.getElementById('mealDate');
    const mealTime = document.getElementById('mealTime');
    const cholesterolDate = document.getElementById('cholesterolDate');

    if (mealDate) mealDate.value = date;
    if (mealTime) mealTime.value = time;
    if (cholesterolDate) cholesterolDate.value = date;
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

  async addCholesterolEntry(e) {
    e.preventDefault();
    
    if (!this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to log cholesterol', 'error');
      return;
    }

    const formData = new FormData(e.target);
    
    const date = formData.get('date');
    const value = parseFloat(formData.get('value'));
    const notes = formData.get('notes');
    const timestamp = new Date(`${date}T00:00:00`);

    const cholesterolEntry = {
      value: value,
      date: date,
      notes: notes,
      timestamp: timestamp,
      userId: this.currentUser.uid
    };

    try {
      await this.db.collection('cholesterolEntries').add(cholesterolEntry);
      this.showToast('Cholesterol reading logged successfully', 'success');
      e.target.reset();
      this.setDefaultDateTime();
      this.loadNutritionData();
    } catch (error) {
      console.error('Error saving cholesterol entry:', error);
      this.showToast('Error saving cholesterol entry', 'error');
    }
  }

  // Get cholesterol-lowering alternatives for a food
  getCholesterolAlternatives(foodName) {
    const food = this.foodDatabase[foodName.toLowerCase()];
    if (food && food.alternatives) {
      return food.alternatives.map(alt => ({
        name: alt,
        cholesterol: this.foodDatabase[alt]?.cholesterol || 0,
        reduction: food.cholesterol - (this.foodDatabase[alt]?.cholesterol || 0)
      })).filter(alt => alt.reduction > 0);
    }
    return [];
  }

  // Check if daily cholesterol intake exceeds recommended limits
  checkCholesterolLimits(dailyIntake) {
    const recommendedDaily = 300; // mg per day for general population
    const highRiskLimit = 200; // mg per day for people with heart disease
    
    if (dailyIntake > recommendedDaily) {
      return {
        status: 'exceeded',
        limit: recommendedDaily,
        overage: dailyIntake - recommendedDaily,
        message: `You've exceeded the daily recommended limit of ${recommendedDaily}mg by ${dailyIntake - recommendedDaily}mg`
      };
    } else if (dailyIntake > highRiskLimit) {
      return {
        status: 'warning',
        limit: highRiskLimit,
        overage: dailyIntake - highRiskLimit,
        message: `You're approaching the limit for high-risk individuals (${highRiskLimit}mg)`
      };
    } else {
      return {
        status: 'good',
        limit: recommendedDaily,
        remaining: recommendedDaily - dailyIntake,
        message: `Great job! You have ${recommendedDaily - dailyIntake}mg remaining today`
      };
    }
  }

  // Generate cholesterol-lowering recommendations
  generateCholesterolRecommendations(meals) {
    const recommendations = [];
    const highCholesterolFoods = [];
    
    // Analyze meals for high-cholesterol foods
    meals.forEach(meal => {
      if (meal.foodsFound) {
        meal.foodsFound.forEach(food => {
          if (food.cholesterol > 50) { // High cholesterol threshold
            highCholesterolFoods.push({
              food: food.food,
              cholesterol: food.cholesterol,
              meal: meal.name,
              alternatives: this.getCholesterolAlternatives(food.food)
            });
          }
        });
      }
    });

    // Generate specific recommendations
    if (highCholesterolFoods.length > 0) {
      highCholesterolFoods.forEach(item => {
        if (item.alternatives.length > 0) {
          const bestAlternative = item.alternatives[0];
          recommendations.push({
            type: 'substitution',
            food: item.food,
            cholesterol: item.cholesterol,
            alternative: bestAlternative.name,
            reduction: bestAlternative.reduction,
            message: `Replace ${item.food} with ${bestAlternative.name} to reduce cholesterol by ${bestAlternative.reduction}mg`
          });
        }
      });
    }

    return recommendations;
  }
}

// Initialize Nutrition Tracker
window.nutritionTracker = new NutritionTracker(); 