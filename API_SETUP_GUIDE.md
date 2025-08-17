# 🚀 Quick API Setup Guide

## Your Gemini API Key
**API Key**: `AIzaSyCLxCR0_HOX-abVRWhWdIlRqujwxEaupvk`

## How to Set Up (Choose One Method)

### Method 1: Environment Variable (Recommended)
```bash
# Set the environment variable directly
set GEMINI_API_KEY=AIzaSyCLxCR0_HOX-abVRWhWdIlRqujwxEaupvk

# Then restart your application
python run.py
```

### Method 2: Create .env File
1. Create a file named `.env` in your project root
2. Add this line to the file:
   ```
   GEMINI_API_KEY=AIzaSyCLxCR0_HOX-abVRWhWdIlRqujwxEaupvk
   ```
3. Restart your application

### Method 3: Direct in Code (Temporary)
Edit `app.py` and change this line:
```python
# Initialize Gemini AI if API key is available
try:
    gemini_ai = GeminiAI("AIzaSyCLxCR0_HOX-abVRWhWdIlRqujwxEaupvk")
    logger.info("Gemini AI initialized successfully")
except Exception as e:
    logger.warning(f"Gemini AI not available: {str(e)}")
    gemini_ai = None
```

## Test Your Setup
1. Go to: `http://localhost:5000`
2. Click "AI-Powered Dashboard"
3. Check if the AI status shows "Connected and ready!"
4. Try any AI feature button

## Current Status
- ✅ Application running on port 5000
- ✅ AI dashboard created at `/ai-dashboard`
- ✅ All Gemini AI endpoints ready
- ⚠️ API key needs to be configured

## Features Available
1. **AI Business Analysis** - Strategic insights
2. **Executive Summary** - Board-ready reports
3. **Trend Predictions** - Future forecasting
4. **AI Recommendations** - Strategic actions
5. **AI Reports** - Comprehensive analysis
6. **Quick Actions** - Run all features at once

## Demo Mode
If API key is not configured, the system runs in demo mode with sample AI responses. 