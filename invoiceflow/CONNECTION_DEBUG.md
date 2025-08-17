# 🔧 Backend-Frontend Connection Debug Guide

## 🚨 Current Issues:
1. **Email sending not working** - Frontend can't reach backend API
2. **User creation not working** - Same connection issue
3. **Environment variables not configured** - Missing backend URL

## 🔍 Step-by-Step Debug Process

### Step 1: Check Current Backend URL
Your current config shows:
```javascript
baseURL: import.meta.env.PROD 
  ? import.meta.env.VITE_API_BASE_URL || 'https://invoicees.onrender.com'
  : ''
```

**Problem**: The fallback URL `https://invoicees.onrender.com` might not be your actual backend URL.

### Step 2: Verify Backend Deployment

1. **Check if your backend is deployed on Render**
   - Go to [render.com](https://render.com)
   - Look for your web service
   - Copy the actual URL (should be something like `https://your-app-name.onrender.com`)

2. **Test backend directly**
   - Visit your backend URL in browser
   - Should see some response (even if it's an error page)
   - If you get "Site not found", the backend isn't deployed

### Step 3: Fix Environment Variables

#### In Netlify Dashboard:
1. Go to your site settings
2. Navigate to "Environment variables"
3. Add/Update:
   ```
   VITE_API_BASE_URL=https://your-actual-backend-url.onrender.com
   ```
4. Replace `your-actual-backend-url` with your real Render backend URL

#### In Render Dashboard:
1. Go to your web service
2. Navigate to "Environment"
3. Add these variables:
   ```
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=your_verified_email@domain.com
   NODE_ENV=production
   PORT=10000
   ```

### Step 4: Test API Endpoints

#### Test Backend Health:
```bash
# Replace with your actual backend URL
curl https://your-backend-url.onrender.com/api/send-email
```

#### Test Frontend Configuration:
1. Open browser console on your deployed site
2. Look for these debug logs:
   ```
   Production mode detected
   VITE_API_BASE_URL: https://your-backend-url.onrender.com
   Final baseURL: https://your-backend-url.onrender.com
   ```

### Step 5: Common Issues & Solutions

#### Issue 1: "Failed to fetch" Error
**Cause**: Backend URL is wrong or backend is down
**Solution**: 
- Verify backend URL in Render dashboard
- Check if backend service is running
- Update `VITE_API_BASE_URL` in Netlify

#### Issue 2: CORS Errors
**Cause**: Backend not configured for frontend domain
**Solution**: 
- Backend already has CORS configured ✅
- Make sure backend URL is correct

#### Issue 3: Environment Variables Not Working
**Cause**: Variables not set or not redeployed
**Solution**:
- Set variables in both Netlify and Render
- Trigger new deployments after setting variables

#### Issue 4: Email Service Not Configured
**Cause**: Resend API key not set
**Solution**:
- Get API key from [resend.com](https://resend.com)
- Set `RESEND_API_KEY` in Render environment variables
- Verify email domain in Resend dashboard

## 🛠️ Quick Fix Commands

### 1. Update Config with Correct URL
Replace the fallback URL in `src/lib/config.ts`:
```javascript
baseURL: import.meta.env.PROD 
  ? import.meta.env.VITE_API_BASE_URL || 'https://YOUR-ACTUAL-BACKEND-URL.onrender.com'
  : ''
```

### 2. Test Backend Locally
```bash
# Test if backend works locally
npm install
node server.js
# Should see "Server running on port 3000"
```

### 3. Test Frontend Build
```bash
# Test if frontend builds correctly
npm run build
# Should create dist/ folder without errors
```

## 📋 Debug Checklist

### Backend (Render) ✅
- [ ] Web service is deployed and running
- [ ] Environment variables are set:
  - [ ] `RESEND_API_KEY`
  - [ ] `RESEND_FROM_EMAIL`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
- [ ] Backend URL is accessible
- [ ] API endpoints respond correctly

### Frontend (Netlify) ✅
- [ ] Environment variable `VITE_API_BASE_URL` is set
- [ ] Variable points to correct backend URL
- [ ] Site is deployed successfully
- [ ] Console shows correct debug logs

### Testing ✅
- [ ] Backend URL works in browser
- [ ] Frontend can reach backend API
- [ ] Email sending works
- [ ] User creation works

## 🎯 Expected Results

After fixing:
- ✅ Frontend console shows correct backend URL
- ✅ API calls succeed (no "Failed to fetch" errors)
- ✅ Email sending works
- ✅ User creation works
- ✅ No CORS errors

## 🚨 Emergency Fix

If you need a quick fix to test:

1. **Find your actual backend URL** from Render dashboard
2. **Update Netlify environment variable** with that URL
3. **Redeploy frontend** in Netlify
4. **Test immediately**

---

**Need immediate help?** Check the browser console on your deployed site for error messages and the debug logs I added to `config.ts`.
