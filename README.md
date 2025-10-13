🥗 Nourish - Intelligent Food Recommendation System
Nourish is a smart food recommendation platform designed to help individuals—especially those with health conditions like diabetes or insulin resistance—make healthier dietary choices.

🚀 Features
🔍 Food Search & Recommendations
Search for food items and get healthier alternatives with detailed nutritional info.

📈 Blood Sugar Level Tracking
Log and track blood sugar levels with secure encrypted storage.

🔒 AES-256 Data Encryption
All sensitive health data is encrypted using AES-256-CBC before MongoDB storage.

🧠 JavaScript Recommendation Engine
Content-based filtering built in JavaScript for low latency and cost efficiency.

🥦 Food Image Recognition
Upload food images to identify items using custom-trained YOLOv8 model.

📊 Progress Dashboard
Visualize your health metrics and dietary progress over time.

🧾 Medical Report Analysis
Upload reports for OCR text extraction and AI-powered summarization.

💬 WhatsApp Chatbot
AI-powered food recommendations via WhatsApp.

🛠 Tech Stack
Frontend: React.js, Tailwind CSS
Backend: Node.js, Express.js
Database: MongoDB with AES-256 encryption
AI/ML: YOLOv8, LLaMA 3.0, Content-Based Filtering
Tools: PaddleOCR, Together AI, Roboflow

🔐 Security
AES-256-CBC encryption for all sensitive health data

Encryption handled at application level before database storage

Secure key management via environment variables

Random IV generation for each encryption operation

Compliant with healthcare data protection standards
