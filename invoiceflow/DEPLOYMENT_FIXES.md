# 🚨 Deployment Fixes Guide

## Issues Identified & Solutions

### 1. **Missing Netlify Configuration** ✅ FIXED
- **Problem**: No `netlify.toml` file causing build failures
- **Solution**: Created `netlify.toml` with proper build settings

### 2. **Environment Variables Not Configured** ⚠️ NEEDS ACTION
- **Problem**: `VITE_API_BASE_URL` not set in Netlify
- **Solution**: Add environment variables in Netlify dashboard

### 3. **Backend Deployment Issues** ⚠️ NEEDS ACTION
- **Problem**: Backend needs separate deployment
- **Solution**: Deploy backend to Render/Railway

## 🔧 Step-by-Step Fix Instructions

### Step 1: Fix Netlify Frontend Deployment

1. **Go to Netlify Dashboard**
   - Navigate to your site settings
   - Go to "Environment variables"

2. **Add Required Environment Variables**
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com
   ```

3. **Update Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

4. **Trigger New Deployment**
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"

### Step 2: Deploy Backend to Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Name: `invoicees-backend`

3. **Configure Service**
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Node

4. **Add Environment Variables**
   ```
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=your_verified_email@domain.com
   NODE_ENV=production
   PORT=10000
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy the URL (e.g., `https://invoicees-backend.onrender.com`)

### Step 3: Update Frontend Configuration

1. **Update Netlify Environment Variable**
   - Go back to Netlify dashboard
   - Update `VITE_API_BASE_URL` to your Render backend URL
   - Trigger new deployment

2. **Verify Configuration**
   - Check `src/lib/config.ts` is using the environment variable correctly

### Step 4: Test Deployment

1. **Test Frontend**
   - Visit your Netlify URL
   - Check if the app loads without errors
   - Test login functionality

2. **Test Backend**
   - Visit your Render backend URL
   - Should see "Server running on port 10000" or similar

3. **Test API Connection**
   - Try to create an invoice
   - Check if email sending works
   - Verify PDF generation

## 🚨 Common Issues & Solutions

### Issue 1: Build Fails on Netlify
**Error**: "Build command failed"
**Solution**:
```bash
# Check if these files exist:
- netlify.toml ✅ (now created)
- package.json ✅ (exists)
- vite.config.ts ✅ (exists)
```

### Issue 2: Environment Variables Not Working
**Error**: "Cannot read property of undefined"
**Solution**:
1. Ensure environment variables are set in Netlify dashboard
2. Variable names must start with `VITE_` for Vite to expose them
3. Redeploy after adding variables

### Issue 3: Backend Connection Fails
**Error**: "Failed to fetch" or CORS errors
**Solution**:
1. Verify backend URL is correct in `VITE_API_BASE_URL`
2. Check if backend is running on Render
3. Ensure CORS is configured in `server.js` ✅ (already configured)

### Issue 4: Email Not Sending
**Error**: "Email service not configured"
**Solution**:
1. Set `RESEND_API_KEY` in Render environment variables
2. Set `RESEND_FROM_EMAIL` in Render environment variables
3. Verify email domain is verified in Resend dashboard

## 📋 Deployment Checklist

### Frontend (Netlify) ✅
- [ ] `netlify.toml` file created
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Environment variable: `VITE_API_BASE_URL` set
- [ ] Site deploys successfully
- [ ] App loads without errors

### Backend (Render) ⚠️
- [ ] Render account created
- [ ] Web service deployed
- [ ] Environment variables set:
  - [ ] `RESEND_API_KEY`
  - [ ] `RESEND_FROM_EMAIL`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
- [ ] Backend URL copied
- [ ] API endpoints responding

### Testing ✅
- [ ] Frontend loads correctly
- [ ] User can log in
- [ ] Invoices can be created
- [ ] PDFs can be generated
- [ ] Emails can be sent
- [ ] Offline mode works

## 🔍 Debugging Commands

### Check Netlify Build Logs
1. Go to Netlify dashboard
2. Click on failed deployment
3. Check build logs for specific errors

### Check Render Logs
1. Go to Render dashboard
2. Click on your web service
3. Check "Logs" tab for errors

### Test Backend Locally
```bash
# Test if backend works locally
npm install
node server.js
# Should see "Server running on port 3000"
```

### Test Frontend Locally
```bash
# Test if frontend builds correctly
npm run build
# Should create dist/ folder without errors
```

## 📞 Next Steps

1. **Follow the step-by-step instructions above**
2. **Deploy backend to Render first**
3. **Update frontend with backend URL**
4. **Test all functionality**
5. **Contact support if issues persist**

## 🎯 Expected Results

After following these fixes:
- ✅ Frontend deploys successfully on Netlify
- ✅ Backend runs on Render
- ✅ API communication works
- ✅ Email sending functional
- ✅ PDF generation works
- ✅ Offline mode functional

---

**Need Help?** Check the build logs in both Netlify and Render dashboards for specific error messages.
