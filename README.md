# 🥗 Nourish - Intelligent Food Recommendation System

*Nourish* is an AI-powered food recommendation platform designed to help individuals — especially those with *diabetes* or *insulin resistance* — make smarter dietary choices.  
It provides *personalized nutrition recommendations, **tracks blood sugar levels, and enhances user engagement through **progress tracking, **gamification, and an **AI-powered WhatsApp chatbot*.

---

## 🚀 Features

- 🔍 *Food Search & Recommendations*  
  Search for food items and instantly receive healthier alternatives with detailed nutritional information.

- 📈 *Blood Sugar Level Tracking*  
  Log and monitor blood sugar levels over time. Get personalized insights and food suggestions based on sugar spikes and patterns.

- 🧠 *Recommendation Engine*  
  Uses *Content-Based Filtering*, designed in JavaScript to minimize API call costs and improve response speed.  
  It compares nutritional profiles and recommends similar but healthier food options.

- 🥦 *Food Image Recognition*  
  Upload an image of your meal and instantly get the food name along with macro-nutrient breakdown using *YOLOv8, custom-trained on **Roboflow datasets*.

- 📊 *Progress Tracker*  
  Visualizes your dietary improvements and blood sugar trends through clean and interactive charts, motivating users to stay consistent.

- 🧾 *Medical Report Upload & Summarization*  
  Upload your medical reports — the system extracts text using *PaddleOCR* and simplifies complex medical terms using *OpenAI’s LLaMA 3.0 Turbo*, turning data into easy-to-understand insights.

---

## 🔒 AES Encryption for Security

Nourish ensures *top-tier data protection* by integrating *AES (Advanced Encryption Standard)* encryption across all sensitive information stored or transmitted in the application.

### How Security is Implemented

1. *Encryption Key Management*  
   A secure 256-bit AES key is generated and stored in an environment variable. This ensures that even if the database is compromised, user data remains unreadable.

2. *Data Encryption Before Storage*  
   Sensitive details such as user login credentials, medical report content, and blood sugar readings are encrypted before being stored in the database.

3. *Decryption Only During Retrieval*  
   Data is decrypted only when the user requests it and after authentication is verified. This guarantees end-to-end data privacy.

4. *Transport Layer Security*  
   All communication between frontend, backend, and databases is secured using HTTPS and encrypted APIs.

---

## 🛠 Tech Stack

| Frontend         | Backend            | ML & AI Models       | Other Tools              |
|------------------|--------------------|----------------------|---------------------------|
| React.js         | Node.js, Express   | YOLOv8, LLaMA 3.0    | PaddleOCR, Together AI    |
| Tailwind CSS     | MongoDB            | Content-Based Filtering | Roboflow (Custom Dataset) |

---

## ⚙ Implementation - Project Execution Guide

Follow these steps to run *Nourish* locally or in a production environment.

### 1. Clone the Repository
Clone the Nourish repository to your local system using Git.

### 2. Install Dependencies
Navigate to both frontend and backend folders and install all required dependencies using npm install.

### 3. Setup Environment Variables
Create a .env file in the backend directory and include:
- MongoDB connection URL  
- AES encryption key  
- OpenAI or Together AI API key  
- JWT secret  
- Any other API credentials for third-party integrations

### 4. Start the Backend Server
Run the backend using npm start or nodemon to start the Express server.

### 5. Start the Frontend
Run the frontend React app using npm run dev or npm start.

### 6. Access the Application
Once both servers are running, open the app in your browser.

## GitHub Link : https://github.com/heet2604/food_recommendation_using_ML
