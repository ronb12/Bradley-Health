# 🚀 Bradley Health - Deployment Guide

## 📋 Overview

Bradley Health is configured for **automatic deployment** to Firebase Hosting. This guide explains how the deployment system works and how to use it.

## 🌐 Live URLs

- **Production**: https://bradley-health.web.app
- **Firebase Console**: https://console.firebase.google.com/project/bradley-health/hosting

## 🔄 Automatic Deployment

### How It Works

1. **Push to `main` branch** → Automatically deploys to live site
2. **Create Pull Request** → Creates preview deployment
3. **Merge PR** → Deploys to live site

### GitHub Actions Workflows

- **`.github/workflows/firebase-hosting-merge.yml`** - Deploys on push to main
- **`.github/workflows/firebase-hosting-pull-request.yml`** - Creates previews on PRs

## 🛠️ Manual Deployment

### Quick Deploy
```bash
./deploy-to-firebase.sh
```

### Step-by-Step Manual Deploy
```bash
# 1. Sync files to public directory
./sync-to-public.sh

# 2. Deploy to Firebase
firebase deploy --only hosting
```

## 📁 File Structure

```
Bradley Health/
├── public/                 # Firebase hosting directory
│   ├── index.html         # Main app
│   ├── manifest.json      # PWA manifest
│   ├── service-worker.js  # Service worker
│   ├── assets/            # All assets
│   └── build-info.json    # Build metadata
├── .github/workflows/     # GitHub Actions
├── sync-to-public.sh      # Sync script
└── deploy-to-firebase.sh  # Deployment script
```

## 🔧 Configuration Files

### Firebase Configuration
- **`firebase.json`** - Firebase project configuration
- **`.firebaserc`** - Project aliases
- **`firestore.rules`** - Database security rules
- **`firestore-indexes.json`** - Database indexes

### GitHub Actions
- **`firebase-hosting-merge.yml`** - Main deployment workflow
- **`firebase-hosting-pull-request.yml`** - PR preview workflow

## 📊 Deployment Process

1. **File Sync**: `sync-to-public.sh` copies all necessary files to `public/`
2. **Build Info**: Creates `build-info.json` with metadata
3. **Firebase Deploy**: Deploys `public/` directory to Firebase Hosting
4. **Live Site**: Available at https://bradley-health.web.app

## 🚨 Troubleshooting

### Common Issues

1. **"Site Not Found"**
   - Check if files are in `public/` directory
   - Run `./sync-to-public.sh` to sync files

2. **Deployment Fails**
   - Check Firebase CLI is installed: `firebase --version`
   - Check you're logged in: `firebase projects:list`
   - Check project is set: `firebase use bradley-health`

3. **GitHub Actions Fail**
   - Check Firebase service account secret is set
   - Check workflow files are in `.github/workflows/`

### Debug Commands

```bash
# Check Firebase status
firebase projects:list
firebase use bradley-health

# Check local files
ls -la public/

# Test deployment locally
firebase serve --only hosting

# Check GitHub Actions
# Go to: https://github.com/ronb12/Bradley-Health/actions
```

## 🔐 Security

- **Firebase Service Account**: Stored as GitHub secret
- **Firestore Rules**: Configured for user-based access
- **HTTPS**: All traffic encrypted
- **CORS**: Properly configured

## 📈 Monitoring

- **Firebase Console**: Monitor deployments and usage
- **GitHub Actions**: Monitor build status
- **Firebase Analytics**: Track app usage (if enabled)

## 🎯 Best Practices

1. **Always test locally** before pushing
2. **Use feature branches** for new features
3. **Test PR previews** before merging
4. **Monitor deployment logs** in GitHub Actions
5. **Keep `public/` directory clean** (don't edit directly)

## 📞 Support

- **Firebase Console**: https://console.firebase.google.com/project/bradley-health
- **GitHub Repository**: https://github.com/ronb12/Bradley-Health
- **GitHub Actions**: https://github.com/ronb12/Bradley-Health/actions

---

**Bradley Health** - Empowering better health through technology.
