# 🥗 Nourish - Intelligent Food Recommendation System

Nourish is a smart food recommendation platform designed to help individuals—especially those with health conditions like diabetes or insulin resistance—make healthier dietary choices. It suggests nutritious alternatives, tracks blood sugar levels, and helps users stay on top of their health goals through progress tracking, gamification, and a WhatsApp chatbot.

---

## 🚀 Features

- 🔍 **Food Search & Recommendations**  
  Search for food items and get healthier alternatives with detailed nutritional info.

- 📈 **Blood Sugar Level Tracking**  
  Log and track blood sugar levels. Get personalized recommendations based on sugar spikes.

- 🧠 **Recommendation Engine**  
  - Content-Based Filtering    
  Built using JavaScript to reduce API call costs and latency.

- 🥦 **Food Image Recognition**  
  Upload food images to get food names and macro information using YOLOv8 (custom-trained on Roboflow).

- 📊 **Progress Tracker**  
  Visualize your dietary progress and sugar levels over time.

- 🧾 **Medical Report Upload & Summarization**  
  Upload medical reports; extract text using PaddleOCR and summarize it into simple language using OpenAI (LLaMA 3.0 Turbo).

- 💬 **WhatsApp Chatbot**  
  AI-powered chatbot for simple food recommendations and interaction.

---

## 🛠 Tech Stack

| Frontend         | Backend            | ML & AI Models       | Other Tools           |
|------------------|--------------------|----------------------|------------------------|
| React.js         | Node.js, Express   | YOLOv8, LLaMA 3.0    | PaddleOCR, Together AI |
| Tailwind CSS     | MongoDB            | Content Based Filtering | Roboflow (Custom Dataset) |
---
