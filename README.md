# 📰 AI Article Summarizer – Chrome Extension  

A Chrome extension powered by **Flask** and **Hugging Face Transformers** that extracts and summarizes online news articles into short, medium, or long summaries.  

It includes:  
✅ Chrome extension frontend (popup UI)  
✅ Flask backend API with Hugging Face summarization model (`facebook/bart-large-cnn`)  
✅ History, copy, export, and settings features  

---

## 🚀 Features  
- Summarize any news article directly from your browser.  
- Choose summary length (**short, medium, long**).  
- Progress tracker with steps (Fetching → Analyzing → Summarizing).  
- Copy, export, or generate a new summary.  
- Saves **recent summaries history** locally.  
- Advanced settings (auto-copy, auto-expand, API timeout).  
- Fallback summarization when AI model fails.  

---

## 📂 Project Structure  
```
article-summarizer-extension/
│── backend/
│   ├── app.py             # Flask API server
│   ├── requirements.txt   # Python dependencies
│   ├── .env.example       # Example environment variables
│   ├── Procfile           # For deployment (Heroku/Render)
│   └── render.yaml        # Render deployment config
│
│── extension/
│   ├── icons/             # Extension icons
│   ├── manifest.json      # Chrome extension manifest
│   ├── popup.html         # Extension popup UI
│   ├── popup.js           # Frontend logic
│   ├── styles.css         # Styling
│
│── .gitignore
```

---

## 🛠️ Installation  
### 1. Clone the repo  
```bash
git clone https://github.com/FARISH3010/article-summarizer-extension.git
cd article-summarizer-extension
```

### 2. Setup backend (Flask + Hugging Face)  
```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/` based on `.env.example`:  
```env
HF_TOKEN=your_huggingface_api_token_here
```

Run the backend:  
```bash
python app.py
```
Backend will run on: `http://localhost:5000`  

### 3. Setup Chrome Extension  
1. Open Chrome and go to `chrome://extensions/`  
2. Enable **Developer mode**  
3. Click **Load unpacked**  
4. Select the `extension/` folder  

Now the extension should appear in your browser.  

---

## ⚡ Usage  
1. Navigate to a news article in Chrome.  
2. Open the extension popup.  
3. Choose summary length (Short / Medium / Long).  
4. Click **SUMMARIZE ARTICLE**.  
5. View the AI-generated summary.  

Extras:  
- Copy summary → 📋 Copy button  
- Export summary → 💾 Export button  
- Generate new summary → 🔄 New button  
- View saved summaries in **History** section  

---

## 🧩 API Endpoints  

### `POST /summarize`  
Request:  
```json
{
  "url": "https://example.com/news/article",
  "length": "medium"
}
```  
Response:  
```json
{
  "summary": "This is the summarized version of the article..."
}
```  

### `GET /health`  
Health check endpoint.  
```json
{
  "status": "ok",
  "model_loaded": true
}
```  

---

## 🌐 Deployment  

The project includes `Procfile` and `render.yaml` for deployment:  

- **Heroku** → Uses `Procfile`  
- **Render** → Uses `render.yaml`  

Once deployed, update the `backendUrl` in `popup.js` to point to your deployed API instead of `http://localhost:5000`.  

```js
const backendUrl = 'https://your-deployed-backend-url/summarize';
```  

---

## 📦 Requirements  
- Python 3.8+  
- Flask  
- Hugging Face `transformers`  
- Torch  
- Newspaper3k  
- Flask-CORS  
- Chrome browser  

Install dependencies with:  
```bash
pip install -r requirements.txt
```  

---

## 🖼️ Preview  
![UI Preview](./843378ad-97b8-4089-a285-7861c878ab36.png)  

---

## 📜 License  
MIT License © 2025  
