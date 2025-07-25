// Medication Database with Auto-Complete
class MedicationDatabase {
  constructor() {
    this.medications = [
      // Blood Pressure Medications
      { name: "Lisinopril", category: "ACE Inhibitor", dosage: "5mg, 10mg, 20mg, 40mg" },
      { name: "Amlodipine", category: "Calcium Channel Blocker", dosage: "2.5mg, 5mg, 10mg" },
      { name: "Metoprolol", category: "Beta Blocker", dosage: "25mg, 50mg, 100mg" },
      { name: "Losartan", category: "ARB", dosage: "25mg, 50mg, 100mg" },
      { name: "Hydrochlorothiazide", category: "Diuretic", dosage: "12.5mg, 25mg, 50mg" },
      { name: "Valsartan", category: "ARB", dosage: "40mg, 80mg, 160mg, 320mg" },
      { name: "Carvedilol", category: "Beta Blocker", dosage: "3.125mg, 6.25mg, 12.5mg, 25mg" },
      { name: "Diltiazem", category: "Calcium Channel Blocker", dosage: "30mg, 60mg, 90mg, 120mg" },
      
      // Diabetes Medications
      { name: "Metformin", category: "Biguanide", dosage: "500mg, 850mg, 1000mg" },
      { name: "Glipizide", category: "Sulfonylurea", dosage: "5mg, 10mg" },
      { name: "Glimepiride", category: "Sulfonylurea", dosage: "1mg, 2mg, 4mg" },
      { name: "Sitagliptin", category: "DPP-4 Inhibitor", dosage: "25mg, 50mg, 100mg" },
      { name: "Empagliflozin", category: "SGLT2 Inhibitor", dosage: "10mg, 25mg" },
      { name: "Dapagliflozin", category: "SGLT2 Inhibitor", dosage: "5mg, 10mg" },
      { name: "Liraglutide", category: "GLP-1 Agonist", dosage: "0.6mg, 1.2mg, 1.8mg" },
      { name: "Semaglutide", category: "GLP-1 Agonist", dosage: "0.25mg, 0.5mg, 1mg" },
      
      // Cholesterol Medications
      { name: "Atorvastatin", category: "Statin", dosage: "10mg, 20mg, 40mg, 80mg" },
      { name: "Simvastatin", category: "Statin", dosage: "5mg, 10mg, 20mg, 40mg, 80mg" },
      { name: "Rosuvastatin", category: "Statin", dosage: "5mg, 10mg, 20mg, 40mg" },
      { name: "Pravastatin", category: "Statin", dosage: "10mg, 20mg, 40mg, 80mg" },
      { name: "Ezetimibe", category: "Cholesterol Absorption Inhibitor", dosage: "10mg" },
      { name: "Fenofibrate", category: "Fibrate", dosage: "48mg, 145mg" },
      { name: "Gemfibrozil", category: "Fibrate", dosage: "600mg" },
      
      // Pain Medications
      { name: "Ibuprofen", category: "NSAID", dosage: "200mg, 400mg, 600mg, 800mg" },
      { name: "Acetaminophen", category: "Analgesic", dosage: "325mg, 500mg, 650mg" },
      { name: "Naproxen", category: "NSAID", dosage: "220mg, 250mg, 375mg, 500mg" },
      { name: "Meloxicam", category: "NSAID", dosage: "7.5mg, 15mg" },
      { name: "Celecoxib", category: "COX-2 Inhibitor", dosage: "100mg, 200mg, 400mg" },
      { name: "Tramadol", category: "Opioid", dosage: "50mg, 100mg" },
      { name: "Hydrocodone", category: "Opioid", dosage: "5mg, 7.5mg, 10mg" },
      { name: "Oxycodone", category: "Opioid", dosage: "5mg, 10mg, 15mg, 20mg" },
      
      // Mental Health Medications
      { name: "Sertraline", category: "SSRI", dosage: "25mg, 50mg, 100mg, 200mg" },
      { name: "Fluoxetine", category: "SSRI", dosage: "10mg, 20mg, 40mg, 60mg" },
      { name: "Escitalopram", category: "SSRI", dosage: "5mg, 10mg, 20mg" },
      { name: "Bupropion", category: "NDRI", dosage: "75mg, 100mg, 150mg, 300mg" },
      { name: "Venlafaxine", category: "SNRI", dosage: "37.5mg, 75mg, 150mg, 225mg" },
      { name: "Duloxetine", category: "SNRI", dosage: "20mg, 30mg, 60mg" },
      { name: "Alprazolam", category: "Benzodiazepine", dosage: "0.25mg, 0.5mg, 1mg, 2mg" },
      { name: "Lorazepam", category: "Benzodiazepine", dosage: "0.5mg, 1mg, 2mg" },
      { name: "Clonazepam", category: "Benzodiazepine", dosage: "0.25mg, 0.5mg, 1mg, 2mg" },
      
      // Heart Medications
      { name: "Aspirin", category: "Antiplatelet", dosage: "81mg, 325mg" },
      { name: "Clopidogrel", category: "Antiplatelet", dosage: "75mg" },
      { name: "Warfarin", category: "Anticoagulant", dosage: "1mg, 2mg, 2.5mg, 3mg, 4mg, 5mg, 6mg, 7.5mg, 10mg" },
      { name: "Apixaban", category: "Anticoagulant", dosage: "2.5mg, 5mg" },
      { name: "Rivaroxaban", category: "Anticoagulant", dosage: "10mg, 15mg, 20mg" },
      { name: "Digoxin", category: "Cardiac Glycoside", dosage: "0.125mg, 0.25mg" },
      { name: "Amiodarone", category: "Antiarrhythmic", dosage: "100mg, 200mg, 400mg" },
      { name: "Diltiazem", category: "Calcium Channel Blocker", dosage: "30mg, 60mg, 90mg, 120mg" },
      
      // Thyroid Medications
      { name: "Levothyroxine", category: "Thyroid Hormone", dosage: "25mcg, 50mcg, 75mcg, 88mcg, 100mcg, 112mcg, 125mcg, 137mcg, 150mcg, 175mcg, 200mcg, 300mcg" },
      { name: "Liothyronine", category: "Thyroid Hormone", dosage: "5mcg, 25mcg, 50mcg" },
      { name: "Methimazole", category: "Antithyroid", dosage: "5mg, 10mg, 15mg, 20mg" },
      { name: "Propylthiouracil", category: "Antithyroid", dosage: "50mg, 100mg" },
      
      // Gastrointestinal Medications
      { name: "Omeprazole", category: "PPI", dosage: "10mg, 20mg, 40mg" },
      { name: "Pantoprazole", category: "PPI", dosage: "20mg, 40mg" },
      { name: "Esomeprazole", category: "PPI", dosage: "20mg, 40mg" },
      { name: "Lansoprazole", category: "PPI", dosage: "15mg, 30mg" },
      { name: "Ranitidine", category: "H2 Blocker", dosage: "75mg, 150mg, 300mg" },
      { name: "Famotidine", category: "H2 Blocker", dosage: "10mg, 20mg, 40mg" },
      { name: "Metoclopramide", category: "Prokinetic", dosage: "5mg, 10mg" },
      { name: "Ondansetron", category: "Antiemetic", dosage: "4mg, 8mg, 16mg" },
      
      // Respiratory Medications
      { name: "Albuterol", category: "Bronchodilator", dosage: "90mcg inhaler, 2mg/5ml solution" },
      { name: "Fluticasone", category: "Corticosteroid", dosage: "44mcg, 110mcg, 220mcg inhaler" },
      { name: "Budesonide", category: "Corticosteroid", dosage: "90mcg, 180mcg inhaler" },
      { name: "Montelukast", category: "Leukotriene Receptor Antagonist", dosage: "4mg, 5mg, 10mg" },
      { name: "Ipratropium", category: "Anticholinergic", dosage: "18mcg inhaler" },
      { name: "Tiotropium", category: "Anticholinergic", dosage: "18mcg inhaler" },
      
      // Antibiotics
      { name: "Amoxicillin", category: "Penicillin", dosage: "250mg, 500mg, 875mg" },
      { name: "Azithromycin", category: "Macrolide", dosage: "250mg, 500mg" },
      { name: "Ciprofloxacin", category: "Fluoroquinolone", dosage: "250mg, 500mg, 750mg" },
      { name: "Doxycycline", category: "Tetracycline", dosage: "50mg, 100mg" },
      { name: "Cephalexin", category: "Cephalosporin", dosage: "250mg, 500mg" },
      { name: "Clindamycin", category: "Lincosamide", dosage: "150mg, 300mg" },
      { name: "Metronidazole", category: "Nitroimidazole", dosage: "250mg, 500mg" },
      { name: "Trimethoprim/Sulfamethoxazole", category: "Sulfonamide", dosage: "80mg/400mg, 160mg/800mg" },
      
      // Vitamins and Supplements
      { name: "Vitamin D3", category: "Vitamin", dosage: "400IU, 1000IU, 2000IU, 5000IU" },
      { name: "Vitamin B12", category: "Vitamin", dosage: "500mcg, 1000mcg, 2500mcg" },
      { name: "Folic Acid", category: "Vitamin", dosage: "400mcg, 800mcg, 1mg, 5mg" },
      { name: "Iron Sulfate", category: "Mineral", dosage: "65mg, 325mg" },
      { name: "Calcium Carbonate", category: "Mineral", dosage: "500mg, 1000mg" },
      { name: "Magnesium", category: "Mineral", dosage: "200mg, 400mg" },
      { name: "Zinc", category: "Mineral", dosage: "15mg, 30mg, 50mg" },
      { name: "Omega-3", category: "Supplement", dosage: "1000mg, 2000mg" },
      
      // Sleep Medications
      { name: "Zolpidem", category: "Non-Benzodiazepine", dosage: "5mg, 10mg" },
      { name: "Eszopiclone", category: "Non-Benzodiazepine", dosage: "1mg, 2mg, 3mg" },
      { name: "Zaleplon", category: "Non-Benzodiazepine", dosage: "5mg, 10mg" },
      { name: "Ramelteon", category: "Melatonin Receptor Agonist", dosage: "8mg" },
      { name: "Doxepin", category: "Tricyclic Antidepressant", dosage: "3mg, 6mg" },
      { name: "Trazodone", category: "SARI", dosage: "25mg, 50mg, 100mg, 150mg" },
      
      // Allergy Medications
      { name: "Cetirizine", category: "Antihistamine", dosage: "5mg, 10mg" },
      { name: "Loratadine", category: "Antihistamine", dosage: "10mg" },
      { name: "Fexofenadine", category: "Antihistamine", dosage: "60mg, 120mg, 180mg" },
      { name: "Diphenhydramine", category: "Antihistamine", dosage: "25mg, 50mg" },
      { name: "Fluticasone Nasal", category: "Nasal Corticosteroid", dosage: "50mcg/spray" },
      { name: "Mometasone Nasal", category: "Nasal Corticosteroid", dosage: "50mcg/spray" },
      
      // Muscle Relaxants
      { name: "Cyclobenzaprine", category: "Muscle Relaxant", dosage: "5mg, 10mg" },
      { name: "Methocarbamol", category: "Muscle Relaxant", dosage: "500mg, 750mg" },
      { name: "Baclofen", category: "Muscle Relaxant", dosage: "10mg, 20mg" },
      { name: "Tizanidine", category: "Muscle Relaxant", dosage: "2mg, 4mg" },
      { name: "Carisoprodol", category: "Muscle Relaxant", dosage: "250mg, 350mg" },
      
      // Migraine Medications
      { name: "Sumatriptan", category: "Triptan", dosage: "25mg, 50mg, 100mg" },
      { name: "Rizatriptan", category: "Triptan", dosage: "5mg, 10mg" },
      { name: "Eletriptan", category: "Triptan", dosage: "20mg, 40mg" },
      { name: "Zolmitriptan", category: "Triptan", dosage: "2.5mg, 5mg" },
      { name: "Frovatriptan", category: "Triptan", dosage: "2.5mg" },
      { name: "Naratriptan", category: "Triptan", dosage: "1mg, 2.5mg" },
      { name: "Almotriptan", category: "Triptan", dosage: "6.25mg, 12.5mg" },
      
      // Erectile Dysfunction
      { name: "Sildenafil", category: "PDE5 Inhibitor", dosage: "25mg, 50mg, 100mg" },
      { name: "Tadalafil", category: "PDE5 Inhibitor", dosage: "2.5mg, 5mg, 10mg, 20mg" },
      { name: "Vardenafil", category: "PDE5 Inhibitor", dosage: "5mg, 10mg, 20mg" },
      { name: "Avanafil", category: "PDE5 Inhibitor", dosage: "50mg, 100mg, 200mg" }
    ];
    
    this.init();
  }

  init() {
    this.setupAutoComplete();
  }

  setupAutoComplete() {
    const medicationInput = document.getElementById('medicationName');
    if (!medicationInput) return;

    // Create dropdown container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.id = 'medicationDropdown';
    dropdownContainer.className = 'medication-dropdown';
    dropdownContainer.style.display = 'none';
    medicationInput.parentNode.insertBefore(dropdownContainer, medicationInput.nextSibling);

    medicationInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      if (query.length < 2) {
        dropdownContainer.style.display = 'none';
        return;
      }

      const matches = this.searchMedications(query);
      this.displayResults(matches, dropdownContainer, medicationInput);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!medicationInput.contains(e.target) && !dropdownContainer.contains(e.target)) {
        dropdownContainer.style.display = 'none';
      }
    });

    // Handle keyboard navigation
    medicationInput.addEventListener('keydown', (e) => {
      const activeItem = dropdownContainer.querySelector('.dropdown-item.active');
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateDropdown(dropdownContainer, 'down', activeItem);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateDropdown(dropdownContainer, 'up', activeItem);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeItem) {
          this.selectMedication(activeItem, medicationInput, dropdownContainer);
        }
      } else if (e.key === 'Escape') {
        dropdownContainer.style.display = 'none';
      }
    });
  }

  searchMedications(query) {
    return this.medications.filter(med => 
      med.name.toLowerCase().includes(query) ||
      med.category.toLowerCase().includes(query)
    ).slice(0, 10); // Limit to 10 results
  }

  displayResults(matches, container, input) {
    if (matches.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.innerHTML = '';
    matches.forEach((med, index) => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.dataset.index = index;
      item.innerHTML = `
        <div class="med-name">${this.highlightMatch(med.name, input.value)}</div>
        <div class="med-category">${med.category}</div>
        <div class="med-dosage">${med.dosage}</div>
      `;
      
      item.addEventListener('click', () => {
        this.selectMedication(item, input, container);
      });

      item.addEventListener('mouseenter', () => {
        container.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });

      container.appendChild(item);
    });

    container.style.display = 'block';
  }

  selectMedication(item, input, container) {
    const medName = item.querySelector('.med-name').textContent;
    const medCategory = item.querySelector('.med-category').textContent;
    const medDosage = item.querySelector('.med-dosage').textContent;
    
    input.value = medName;
    
    // Auto-fill category if field exists
    const categoryField = document.getElementById('medicationCategory');
    if (categoryField) {
      categoryField.value = medCategory;
    }
    
    // Auto-fill dosage if field exists
    const dosageField = document.getElementById('medicationDosage');
    if (dosageField) {
      dosageField.value = medDosage.split(', ')[0]; // Take first dosage option
    }
    
    container.style.display = 'none';
    
    // Trigger change event
    input.dispatchEvent(new Event('change'));
  }

  navigateDropdown(container, direction, activeItem) {
    const items = container.querySelectorAll('.dropdown-item');
    if (items.length === 0) return;

    let nextItem;
    if (!activeItem) {
      nextItem = direction === 'down' ? items[0] : items[items.length - 1];
    } else {
      const currentIndex = Array.from(items).indexOf(activeItem);
      if (direction === 'down') {
        nextItem = items[currentIndex + 1] || items[0];
      } else {
        nextItem = items[currentIndex - 1] || items[items.length - 1];
      }
    }

    items.forEach(item => item.classList.remove('active'));
    nextItem.classList.add('active');
    nextItem.scrollIntoView({ block: 'nearest' });
  }

  highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  }

  // Get medication by name
  getMedication(name) {
    return this.medications.find(med => 
      med.name.toLowerCase() === name.toLowerCase()
    );
  }

  // Get all medications in a category
  getMedicationsByCategory(category) {
    return this.medications.filter(med => 
      med.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Get all categories
  getCategories() {
    return [...new Set(this.medications.map(med => med.category))];
  }
}

// Initialize medication database when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.medicationDatabase = new MedicationDatabase();
}); 