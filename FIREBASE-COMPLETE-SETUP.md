# 🔥 Complete Firebase Setup Guide for Bradley Health

This guide provides a comprehensive overview of all Firebase requirements for the Bradley Health app, including the newly added nutrition and weight loss features.

## 📋 Required Firebase Collections

The app uses the following Firestore collections:

### **Core Health Data**
- `users` - User profiles and settings
- `bloodPressure` - Blood pressure readings
- `medications` - Medication management
- `moodEntries` - Mood tracking data
- `moodFactors` - Mood tracking factors
- `goals` - Health goals
- `reminders` - Reminder notifications
- `notifications` - Notification settings
- `exports` - Data exports
- `emergencyContacts` - Emergency contact information
- `healthMetrics` - Health metrics data
- `settings` - App settings

### **Limb Care & Medical Equipment**
- `limbAssessments` - Limb assessment data
- `prostheticCare` - Prosthetic care tracking
- `painTracking` - Pain tracking data
- `careReminders` - Care-specific reminders
- `durableMedicalEquipment` - DME tracking

### **Nutrition & Weight Loss (NEW)**
- `meals` - Meal tracking and nutrition data
- `cholesterolEntries` - Cholesterol monitoring
- `weightEntries` - Weight tracking data
- `weightGoals` - Weight loss goals
- `weightLossPlans` - AI-generated meal/exercise plans
- `nutritionEntries` - General nutrition tracking

### **Additional Health Data**
- `physicalActivity` - Exercise tracking
- `sleepEntries` - Sleep tracking
- `medicalHistory` - Medical history records
- `immunizations` - Immunization records
- `profiles` - User profiles (separate from users)

## 🔐 Security Rules Setup

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **bradley-health**
3. In the left sidebar, click **Firestore Database**
4. Click on the **Rules** tab

### Step 2: Deploy Updated Rules
Copy and paste the contents of `firestore.rules` into the Firebase Console rules editor.

**New Collections Added:**
- ✅ `meals` - Nutrition tracking
- ✅ `cholesterolEntries` - Cholesterol monitoring
- ✅ `weightEntries` - Weight tracking
- ✅ `weightGoals` - Weight loss goals
- ✅ `weightLossPlans` - AI-generated plans
- ✅ `physicalActivity` - Exercise tracking
- ✅ `sleepEntries` - Sleep tracking
- ✅ `medicalHistory` - Medical history
- ✅ `immunizations` - Immunization records
- ✅ `profiles` - User profiles
- ✅ `nutritionEntries` - General nutrition

### Step 3: Publish Rules
1. Click **Publish** to save the rules
2. Wait 1-2 minutes for rules to take effect

## 📊 Indexes Setup

### Step 1: Access Indexes
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **bradley-health**
3. In the left sidebar, click **Firestore Database**
4. Click on the **Indexes** tab

### Step 2: Deploy Updated Indexes
Copy and paste the contents of `firestore-indexes.json` into the Firebase Console indexes editor.

**New Indexes Added:**
- ✅ `meals` - userId + timestamp
- ✅ `cholesterolEntries` - userId + timestamp
- ✅ `weightEntries` - userId + timestamp
- ✅ `weightGoals` - userId + timestamp
- ✅ `weightLossPlans` - userId + timestamp
- ✅ `moodFactors` - userId + timestamp
- ✅ `physicalActivity` - userId + timestamp
- ✅ `sleepEntries` - userId + timestamp
- ✅ `medicalHistory` - userId + timestamp
- ✅ `immunizations` - userId + timestamp
- ✅ `nutritionEntries` - userId + timestamp

### Step 3: Create Indexes
1. Click **Create Index** for each new collection
2. Set the fields in the specified order
3. Set query scope to "Collection"
4. Click **Create**

## 🧪 Testing All Features

After setting up Firebase, test each feature:

### **Core Features**
1. **Blood Pressure**: Add reading → Should save successfully
2. **Medications**: Add medication → Should save without errors
3. **Mood Tracking**: Track mood → Should save successfully
4. **Goals**: Set health goal → Should save without errors
5. **Profile**: Update profile → Should save successfully

### **Limb Care Features**
1. **Limb Assessments**: Add assessment → Should save successfully
2. **Prosthetic Care**: Log care activity → Should save without errors
3. **Pain Tracking**: Log pain level → Should save successfully
4. **DME Tracking**: Add equipment → Should save without errors

### **Nutrition & Weight Loss Features (NEW)**
1. **Meal Tracking**: Log meal → Should save successfully
2. **Cholesterol Monitoring**: Log cholesterol reading → Should save without errors
3. **Weight Tracking**: Log weight → Should save successfully
4. **Weight Goals**: Set weight goal → Should generate AI plans
5. **AI Meal Plans**: Should display personalized meal plans
6. **AI Exercise Plans**: Should display personalized exercise plans

### **Additional Features**
1. **Physical Activity**: Log exercise → Should save successfully
2. **Sleep Tracking**: Log sleep → Should save without errors
3. **Medical History**: Add history → Should save successfully
4. **Immunizations**: Add immunization → Should save without errors

## 🔧 Troubleshooting

### **Common Issues**

#### "Missing or insufficient permissions"
- **Cause**: Rules not published or incorrect
- **Solution**: Check that rules are published and wait 2 minutes

#### "Permission denied"
- **Cause**: User not authenticated or rules too restrictive
- **Solution**: Ensure user is logged in and rules allow authenticated access

#### "Index not found"
- **Cause**: Index not created yet
- **Solution**: Wait for index creation (5-10 minutes) or check index status

#### "Document does not exist"
- **Cause**: Trying to update a document that doesn't exist
- **Solution**: Use `set()` with merge instead of `update()`

### **Feature-Specific Issues**

#### **Nutrition Tracking Issues**
- **Problem**: Meals not saving
- **Solution**: Check `meals` collection rules and indexes
- **Check**: Ensure `userId` field is included in meal documents

#### **Weight Loss Issues**
- **Problem**: Weight entries not saving
- **Solution**: Check `weightEntries` collection rules and indexes
- **Check**: Ensure `userId` field is included in weight documents

#### **AI Plan Generation Issues**
- **Problem**: AI plans not generating
- **Solution**: Check `weightLossPlans` collection rules
- **Check**: Ensure weight goal is set before generating plans

## 📈 Performance Optimization

### **Index Benefits**
- ✅ **Faster queries** - Reduced loading times
- ✅ **Better user experience** - Responsive app performance
- ✅ **Scalability** - Handles growing data efficiently
- ✅ **Reliability** - Fewer timeout errors

### **Collection Optimization**
- ✅ **User-specific queries** - All collections use `userId` filtering
- ✅ **Timestamp ordering** - Efficient chronological data retrieval
- ✅ **Proper indexing** - Optimized for common query patterns

## 🚀 Deployment Checklist

### **Pre-Deployment**
- [ ] All security rules updated and published
- [ ] All indexes created and enabled
- [ ] Firebase project configured correctly
- [ ] Authentication enabled
- [ ] Firestore database created

### **Post-Deployment**
- [ ] Test all core features
- [ ] Test all limb care features
- [ ] Test all nutrition features
- [ ] Test all weight loss features
- [ ] Test all additional features
- [ ] Verify data persistence
- [ ] Check error logs

## 📞 Support

If you encounter issues:

1. **Check Firebase Console** for error messages
2. **Verify authentication** is working
3. **Ensure rules are published** and active
4. **Check index status** in Firebase Console
5. **Test with simpler rules** first if needed
6. **Review browser console** for JavaScript errors

## 🔒 Security Notes

- **Never use testing rules in production**
- **Always verify user authentication**
- **Use proper data validation**
- **Monitor Firebase usage and costs**
- **Regularly review security rules**

## 📊 Monitoring

### **Firebase Console Monitoring**
- Monitor Firestore usage
- Check for permission errors
- Review query performance
- Track storage usage

### **App Performance Monitoring**
- Monitor query response times
- Check for timeout errors
- Track user engagement
- Monitor feature usage

---

**🎉 Your Bradley Health app is now fully configured with all Firebase requirements!** 