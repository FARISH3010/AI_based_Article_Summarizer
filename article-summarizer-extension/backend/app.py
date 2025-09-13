from flask import Flask, request, jsonify
from newspaper import Article
from flask_cors import CORS
from transformers import pipeline
import torch
import os
from dotenv import load_dotenv
import re
from urllib.parse import urlparse

# Load Hugging Face token from .env
load_dotenv()
HF_TOKEN = os.getenv('HF_TOKEN', None)

app = Flask(__name__)
CORS(app)

# Initialize the summarization pipeline
print("Loading summarization model...")
try:
    summarizer = pipeline(
        "summarization",
        model="facebook/bart-large-cnn",
        token=HF_TOKEN,
        torch_dtype=torch.float32
    )
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    summarizer = None

def is_valid_news_url(url):
    """Check if URL is likely a news article page"""
    parsed_url = urlparse(url)
    path = parsed_url.path.lower()
    
    # Common patterns that indicate search/aggregation pages (not articles)
    search_indicators = [
        'search', 'results', 'topics', 'category', 'tag', 
        'archive', 'all-', 'index', 'list', 'collection'
    ]
    
    # Check if URL contains search indicators
    if any(indicator in path for indicator in search_indicators):
        return False
    
    # Check if URL has query parameters that suggest it's not an article
    query = parsed_url.query.lower()
    if any(indicator in query for indicator in search_indicators):
        return False
    
    return True

@app.route('/summarize', methods=['POST'])
def summarize_article():
    data = request.get_json()
    url = data.get('url')
    length_preference = data.get('length', 'medium')  # Default to medium
    
    if not url:
        return jsonify({'error': 'No URL provided.'}), 400

    print(f"Received URL: {url}")
    print(f"Length preference: {length_preference}")

    # Validate URL before processing
    if not is_valid_news_url(url):
        error_msg = "This appears to be a search or category page, not a news article. Please provide a direct link to a news article."
        print(error_msg)
        return jsonify({'error': error_msg}), 400

    # Scrape the article
    article = Article(url)
    try:
        article.download()
        article.parse()
    except Exception as e:
        error_msg = f'Failed to download or parse article: {str(e)}. This may not be a valid news article page.'
        print(error_msg)
        return jsonify({'error': error_msg}), 500

    if not article.text or len(article.text.strip()) < 100:
        error_msg = 'Could not extract sufficient text from this page. It may not be a standard news article.'
        print(error_msg)
        return jsonify({'error': error_msg}), 500

    article_text = article.text
    print(f"Extracted text length: {len(article_text)} characters")

    # Set summary parameters based on length preference
    length_config = {
        'short': {'max_length': 80, 'min_length': 20},
        'medium': {'max_length': 150, 'min_length': 30},
        'long': {'max_length': 250, 'min_length': 50}
    }
    
    config = length_config.get(length_preference, length_config['medium'])

    # Generate summary using Hugging Face model
    try:
        if summarizer is None:
            raise Exception("Summarization model not loaded")
        
        # Truncate text if too long
        max_input_length = 1024
        if len(article_text) > max_input_length:
            article_text = article_text[:max_input_length]
        
        # Generate summary
        summary_result = summarizer(
            article_text,
            max_length=config['max_length'],
            min_length=config['min_length'],
            do_sample=False,
            truncation=True
        )
        
        summary = summary_result[0]['summary_text']
        print(f"✅ {length_preference.capitalize()} summary generated successfully!")
        
    except Exception as e:
        error_msg = f'Summarization error: {str(e)}'
        print(f"❌ Error: {str(e)}")
        
        # Fallback: simple text extraction
        sentences = re.split(r'[.!?]+', article_text)
        sentences = [s.strip() for s in sentences if s.strip()]
        if len(sentences) > 3:
            summary = '. '.join(sentences[:3]) + '.'
        else:
            summary = article_text[:500] + "..." if len(article_text) > 500 else article_text
        print("Used fallback summarization method")

    return jsonify({'summary': summary})

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint to check if server is running"""
    return jsonify({'status': 'ok', 'model_loaded': summarizer is not None})

if __name__ == '__main__':
    app.run(debug=True, port=5000)