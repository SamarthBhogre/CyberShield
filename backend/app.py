from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
import json
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
import requests
from bs4 import BeautifulSoup

# --- Configuration ---
api_key = os.getenv("GEMINI_API_KEY", "AIzaSyDZ7f-127bm2MC-WogoD8UN4xFH0kaTfbE")
if api_key == "AIzaSyDZ7f-127bm2MC-WogoD8UN4xFH0kaTfbE":
    print("✅ Using provided API key.")
genai.configure(api_key=api_key)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- Database connection helper ---
def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "Samarth#05"),
            database=os.getenv("DB_NAME", "cybershield")
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to database: {err}")
        return None

# --- Retrieve user_id for a given username ---
def get_user_id_by_username(username):
    conn = get_db_connection()
    if not conn:
        return None
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
        result = cursor.fetchone()
        return result[0] if result else None
    finally:
        cursor.close()
        conn.close()

# --- Helper for Gemini API calls ---
def call_gemini_with_json_response(prompt):
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-lite')
        response = model.generate_content(prompt)
        raw_text = response.text
        cleaned_text = raw_text.strip().replace("```json", "").replace("```", "")
        return json.loads(cleaned_text)
    except Exception as e:
        print(f"Gemini API error: {e}")
        return {"error": f"An error occurred with the AI model: {str(e)}"}

# --- Web Scraper Helper ---
def scrape_article_text(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        paragraphs = soup.find_all('p')
        article_text = ' '.join([p.get_text() for p in paragraphs])
        return article_text[:4000]
    except requests.RequestException as e:
        print(f"Error scraping URL {url}: {e}")
        return None

# --- Registration endpoint ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')

    if not all([username, email, phone, password]):
        return jsonify({'error': 'All fields are required'}), 400

    hashed_password = generate_password_hash(password)
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, email, phone, password) VALUES (%s, %s, %s, %s)",
            (username, email, phone, hashed_password)
        )
        conn.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except mysql.connector.Error as err:
        if err.errno == 1062:
            if 'username' in err.msg:
                return jsonify({'error': 'Username already exists'}), 409
            if 'email' in err.msg:
                return jsonify({'error': 'Email address already registered'}), 409
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        conn.close()

# --- Login endpoint (UPDATED) ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    identifier = data.get('identifier') # Can be username or email
    password = data.get('password')

    if not identifier or not password:
        return jsonify({'error': 'Identifier and password are required'}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        # Check if the identifier is a username or an email
        query = "SELECT * FROM users WHERE username = %s OR email = %s"
        cursor.execute(query, (identifier, identifier))
        user = cursor.fetchone()
        
        if user and check_password_hash(user['password'], password):
            # Return the actual username for the frontend context
            return jsonify({
                'message': 'Login successful',
                'user_id': user['id'],
                'username': user['username'] 
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        conn.close()

# --- Generate passwords endpoint ---
@app.route('/api/generate-passwords', methods=['POST'])
def generate_passwords_endpoint():
    prompt = """
      Generate 3 unique, strong, and random passwords.
      Each password should be between 14 and 18 characters long.
      Include a mix of uppercase letters, lowercase letters, numbers, and special characters (!@#$%^&*).
      Return the result as a valid JSON object with a single key "passwords" which is an array of strings.
      Example: {"passwords": ["p@ssW0rd1!", "an0ther$ecurePa55", "3rd!P@ssw0rd"]}
    """
    result = call_gemini_with_json_response(prompt)
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result), 200

# --- Analyze password endpoint ---
@app.route('/api/analyze-password', methods=['POST'])
def analyze_password_endpoint():
    data = request.json
    password = data.get('password', '')
    username = data.get('username', 'user')
    website = data.get('website', 'example.com')
    if not password:
        return jsonify({"error": "Password not provided"}), 400
    prompt = f"""
        Analyze the following password based on 7 security criteria. The user's username is "{username}" and the website is "{website}".
        Password to analyze: "{password}"
        Criteria:
        1. Length: Score from 1 (very short) to 5 (very long, >16 chars).
        2. Variety: Score based on the mix of lowercase, uppercase, numbers, and special characters. 1 (one type) to 5 (all four types).
        3. Entropy: Score based on randomness. Penalize sequences like 'abc' or '123'. 1 (predictable) to 5 (highly random).
        4. DictionaryResistance: Score based on resistance to dictionary attacks. Penalize common words or names. 1 (common word) to 5 (no dictionary words).
        5. Repetition: Score based on lack of repeating characters. 1 (highly repetitive) to 5 (no significant repetition).
        6. PersonalInfo: Score based on avoiding personal info. If the password contains "{username}" or parts of "{website}", score 1. Otherwise, score 5.
        7. BreachMatch: Simulate a check against known data breaches. If the password is a common example like "password123", score 1. Otherwise, score 5.
        Return ONLY a valid JSON object with a single key "analysis" containing the scores.
        Example: {{"analysis": {{"Length": 5, "Variety": 5, "Entropy": 4, "DictionaryResistance": 5, "Repetition": 4, "PersonalInfo": 5, "BreachMatch": 5}}}}
    """
    result = call_gemini_with_json_response(prompt)
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result), 200

# --- Check URL endpoint ---
@app.route('/api/check-url', methods=['POST'])
def check_url_endpoint():
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    prompt = f"""
        Act as a cybersecurity analyst. Analyze the following URL for potential threats: "{url}"
        Evaluate it based on these criteria:
        1.  Phishing Indicators: Look for signs of brand impersonation or misleading subdomains.
        2.  Malware Scan: Simulate a check against known malware distribution domains.
        3.  Domain Reputation: Assess the domain's general reputation.
        4.  HTTPS Usage: Check if the URL uses a secure HTTPS connection.
        5.  Typosquatting Risk: Analyze if the domain name is a common misspelling of a popular website.
        Based on your analysis, provide a final verdict: "Safe", "Suspicious", or "Malicious".
        Return ONLY a valid JSON object. Provide a brief, clear summary for each point.
        Example format:
        {{
          "verdict": "Safe", "summary": "This URL appears to be safe.",
          "checks": {{ "https_usage": "Yes", "domain_reputation": "Good", "phishing_indicators": "No obvious signs of phishing detected.", "malware_scan": "No malware detected in simulated scan.", "typosquatting_risk": "Low" }}
        }}
    """
    result = call_gemini_with_json_response(prompt)
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result), 200

# --- Analyze Email endpoint ---
@app.route('/api/analyze-email', methods=['POST'])
def analyze_email_endpoint():
    data = request.json
    from_email = data.get('from_email')
    email_content = data.get('email_content')
    if not from_email or not email_content:
        return jsonify({'error': 'Sender email and content are required'}), 400
    prompt = f"""
        Act as a senior cybersecurity analyst specializing in phishing detection. Analyze the provided email.
        Sender Address: "{from_email}"
        Email Content: --- {email_content} ---
        Evaluate the email based on these criteria:
        1.  **Sender Address Analysis**: Does the 'From' address look legitimate?
        2.  **Subject & Tone Analysis**: Does the subject line create a false sense of urgency or fear?
        3.  **Content & Grammar**: Check for poor grammar, spelling mistakes, and generic greetings.
        4.  **Links & Attachments**: Analyze any links mentioned. Do they point to a suspicious domain?
        5.  **Malicious Intent**: Does the email ask for personal information, login credentials, or financial details?
        Provide a final verdict: "Safe", "Suspicious", or "Phishing".
        Provide a risk score from 0 (Safe) to 100 (Definitely Phishing).
        Return ONLY a valid JSON object.
        Example format:
        {{
          "verdict": "Phishing", "score": 95, "summary": "This email is a classic phishing attempt, impersonating a known brand to steal credentials.",
          "analysis": {{ "sender_address": "Warning: The sender domain is suspicious.", "subject_and_tone": "High Risk: The subject uses urgent language.", "content_and_grammar": "Suspicious: The email has grammatical errors.", "links_and_attachments": "Critical: The link directs to a malicious domain.", "malicious_intent": "Confirmed: The email asks for credentials." }}
        }}
    """
    result = call_gemini_with_json_response(prompt)
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result), 200

# --- Fake News Detector endpoint ---
@app.route('/api/check-news', methods=['POST'])
def check_news_endpoint():
    data = request.json
    url = data.get('url')
    title = data.get('title', '')
    source = data.get('source', '')
    author = data.get('author', '')
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    article_text = scrape_article_text(url)
    if not article_text:
        return jsonify({'error': 'Failed to fetch or parse article content from the URL.'}), 500
    prompt = f"""
        Act as a professional fact-checker. Analyze the following article for authenticity using the provided metadata and scraped text.
        Provided Metadata:
        - Article URL: "{url}"
        - Title: "{title if title else 'Not provided'}"
        - Source Website: "{source if source else 'Not provided'}"
        - Author: "{author if author else 'Not provided'}"
        Scraped Article Text: --- {article_text} ---
        Perform the following checks:
        1.  **Source Reliability**: Based on the Source Website ("{source}") and URL, assess its reliability.
        2.  **Author Credibility**: Based on the Author ("{author}"), assess their credibility.
        3.  **Claim Verification**: Cross-verify the main claims against information from established news sources (e.g., Reuters, Associated Press).
        4.  **Bias and Language Analysis**: Analyze the Title ("{title}") and text for biased or sensationalist language.
        Provide a final verdict: "Likely True", "Likely Fake", or "Not Verified".
        Provide a confidence score from 0 to 100.
        Provide a concise, one-sentence summary for your verdict.
        Return ONLY a valid JSON object.
        Example:
        {{
          "verdict": "Likely Fake", "confidence": 94, "summary": "The claims are not supported by credible outlets and the source is unreliable.",
          "details": {{ "source_reliability": "Poor: The source is a known conspiracy site.", "author_credibility": "Questionable: The author writes biased articles.", "claim_verification": "Failed: No reputable sources corroborate the claims.", "bias_and_language_analysis": "High: The title is inflammatory." }}
        }}
    """
    result = call_gemini_with_json_response(prompt)
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result), 200

# --- Store password endpoint ---
@app.route('/api/store-password', methods=['POST'])
def store_password():
    data = request.json
    username = data.get('username')
    website = data.get('website')
    password = data.get('password')
    if not all([username, website, password]):
        return jsonify({'error': 'Missing fields'}), 400
    user_id = get_user_id_by_username(username)
    if not user_id:
        return jsonify({'error': 'User not found'}), 404
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO passwords (user_id, website, password) VALUES (%s, %s, %s)", (user_id, website, password))
        conn.commit()
        return jsonify({'message': 'Password stored successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# --- Retrieve user's passwords endpoint ---
@app.route('/api/user-passwords/<username>', methods=['GET'])
def user_passwords(username):
    user_id = get_user_id_by_username(username)
    if not user_id:
        return jsonify({'error': 'User not found'}), 404
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, website, password FROM passwords WHERE user_id = %s", (user_id,))
        passwords = cursor.fetchall()
        return jsonify({'passwords': passwords})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# --- Delete password endpoint ---
@app.route('/api/delete-password/<int:id>', methods=['DELETE'])
def delete_password(id):
    data = request.json
    username = data.get('username')
    if not username:
        return jsonify({'error': 'Username required'}), 400
    user_id = get_user_id_by_username(username)
    if not user_id:
        return jsonify({'error': 'User not found'}), 404
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM passwords WHERE id = %s AND user_id = %s", (id, user_id))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({'error': 'No password entry deleted. Check id and user.'}), 404
        return jsonify({'message': 'Password deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    app.run(debug=True, port=5000)

