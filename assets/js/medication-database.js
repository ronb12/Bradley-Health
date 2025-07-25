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
      { name: "Carvedilol", category: "Beta Blocker", dosage: "3.125mg, 6.25mg, 12.5mg, 25mg, 50mg" },
      { name: "Atenolol", category: "Beta Blocker", dosage: "25mg, 50mg, 100mg" },
      { name: "Enalapril", category: "ACE Inhibitor", dosage: "2.5mg, 5mg, 10mg, 20mg" },
      { name: "Ramipril", category: "ACE Inhibitor", dosage: "1.25mg, 2.5mg, 5mg, 10mg" },
      // Diabetes Medications
      { name: "Metformin", category: "Biguanide", dosage: "500mg, 850mg, 1000mg" },
      { name: "Glipizide", category: "Sulfonylurea", dosage: "2.5mg, 5mg, 10mg" },
      { name: "Glyburide", category: "Sulfonylurea", dosage: "1.25mg, 2.5mg, 5mg" },
      { name: "Sitagliptin", category: "DPP-4 Inhibitor", dosage: "25mg, 50mg, 100mg" },
      { name: "Insulin Glargine", category: "Insulin", dosage: "100 units/mL" },
      { name: "Insulin Aspart", category: "Insulin", dosage: "100 units/mL" },
      // Cholesterol Medications
      { name: "Atorvastatin", category: "Statin", dosage: "10mg, 20mg, 40mg, 80mg" },
      { name: "Simvastatin", category: "Statin", dosage: "5mg, 10mg, 20mg, 40mg, 80mg" },
      { name: "Rosuvastatin", category: "Statin", dosage: "5mg, 10mg, 20mg, 40mg" },
      { name: "Pravastatin", category: "Statin", dosage: "10mg, 20mg, 40mg, 80mg" },
      { name: "Ezetimibe", category: "Cholesterol Absorption Inhibitor", dosage: "10mg" },
      // Pain/Other
      { name: "Acetaminophen", category: "Analgesic", dosage: "325mg, 500mg, 650mg" },
      { name: "Ibuprofen", category: "NSAID", dosage: "200mg, 400mg, 600mg, 800mg" },
      { name: "Aspirin", category: "NSAID", dosage: "81mg, 325mg, 500mg" },
      { name: "Naproxen", category: "NSAID", dosage: "220mg, 250mg, 375mg, 500mg" },
      // ... add more as needed ...
    ];
    console.log('Medication Database: Initialized with', this.medications.length, 'medications');
  }

  // Search for medications by name (case-insensitive, partial match)
  searchMedications(query) {
    if (!query) return [];
    const q = query.toLowerCase();
    const results = this.medications.filter(med => med.name.toLowerCase().includes(q));
    console.log('Medication Database: Search for "' + query + '" returned', results.length, 'results');
    return results;
  }
}

// Initialize medication database when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.medicationDatabase = new MedicationDatabase();
  console.log('Medication Database: Made available globally as window.medicationDatabase');
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
  // DOM is still loading, the event listener above will handle it
} else {
  // DOM is already loaded, initialize immediately
  window.medicationDatabase = new MedicationDatabase();
  console.log('Medication Database: Initialized immediately (DOM already loaded)');
} 