# 🍽️ MealMaster - Personalized Meal Planning App

**MealMaster** is a full-stack web application that helps users plan meals, track their nutrition, and adopt healthier eating habits. Designed for busy individuals, the app offers personalized meal plans based on dietary preferences, fitness goals, and restrictions.

---

## 🚀 Deploy Link

🌐 **Live App**: [https://your-frontend-app.onrender.com](https://your-frontend-app.onrender.com)  
🔧 **Backend API**: [https://your-backend-api.onrender.com](https://your-backend-api.onrender.com)

> _Replace the above links with your actual Render deployment URLs._

---

## 🎥 Demo Video

▶️ [Watch the Demo on YouTube](https://your-demo-video-link.com)

> _Link to a walkthrough/demo showing key features like registration, meal planner, recipe search, nutrition tracking, and AI suggestions._

---

## 📋 Table of Contents

- [Context](#context)
- [Project Goal](#project-goal)
- [Features](#features)
  - [L1: Minimum Viable Features](#l1-minimum-viable-features)
  - [L2: Unique Features](#l2-unique-features)
  - [L3: Challenging Features](#l3-challenging-features)
  - [Additional Features](#additional-features)
- [🛠 Tech Stack](#-tech-stack)
- [📦 Installation & Setup](#-installation--setup)
- [📂 Folder Structure](#-folder-structure)
- [📮 API Testing](#-api-testing)
- [📈 Future Improvements](#-future-improvements)
- [🧑‍💻 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🧠 Context

In today’s fast-paced world, maintaining a healthy and balanced diet is challenging. MealMaster aims to simplify this by providing users with tools to plan meals, track nutrition, and receive meal suggestions that align with their health goals.

---

## 🎯 Project Goal

Build a comprehensive meal planning application that enables users to:

- Create meal plans
- Track daily food intake
- Get AI-based meal suggestions
- Analyze nutritional habits
- Improve diet consistency

---

## ✨ Features

### ✅ L1: Minimum Viable Features

#### 🔐 User Authentication
- Secure login & registration using Email/Password and Social Login (Google, Facebook)
- Stores dietary preferences, allergies, and fitness goals

#### 👤 Profile Creation
- Dietary restrictions: Vegetarian, Vegan, Gluten-Free, etc.
- Fitness goals: Weight Loss, Muscle Gain
- Filled via onboarding questionnaire

#### 🗓️ Meal Plan Creation
- Weekly calendar-based meal planner with drag-and-drop
- Add meals from database or user-created ones
- Save favorite meals

#### 🍳 Recipe Database
- Search recipes by ingredients, dietary type, or meal type
- Each recipe includes calories and macronutrient data

#### 📊 Nutritional Tracking
- Log meals and calculate daily caloric/macronutrient intake
- Manual input or select from recipe database

---

### 🔍 L2: Unique Features

#### 🛒 Grocery List Generator
- Automatically generates grocery list from meal plan
- Allows removing items already available

#### ⏰ Meal Prep Reminders
- Notifications for prep/cook times
- Customizable by meal

#### 🎯 Calorie & Macro Goals
- Set daily goals
- Dashboard with progress bars showing remaining nutrients/calories

---

### 💡 L3: Challenging Features

#### 🤖 AI-Based Meal Suggestions
- Learns from user activity
- Suggests meals aligned with dietary habits and feedback

#### 🌍 Community Recipes
- Users can upload, rate, and save community-contributed meals
- Encourage recipe sharing and discovery

#### 📈 Nutritional Analysis & Feedback
- Personalized insights into eating habits
- Suggestions for improvement (e.g. low protein, high sugar)

---

### 🌟 Additional Features

- UI Theme Customization
- Fully responsive and mobile-friendly
- Fitness tracker integration (future)
- Printable meal plans & grocery lists

---

## 🛠 Tech Stack

**Frontend:**
- React.js (with Tailwind CSS)
- @dnd-kit/core for drag-and-drop interactions
- Axios for API requests

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT-based Authentication
- Gemini API for AI-based suggestions

**Others:**
- Postman for API testing
- Framer Motion for animations
- Deployment: **Render**

---

## 📦 Installation & Setup

> Make sure Node.js, MongoDB, and npm/yarn are installed.

### 1. Clone the Repository
bash
git clone https://github.com/akash-collab/MealMaster/tree/main/
cd MealMaster_App

### 2. Install Dependencies
Backend
cd backend
npm install

Frontend
cd ../frontend
npm install

3. Create .env Files
Backend.env
PORT=5050
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret

Frontend.env 
VITE_API_BASE_URL=https://your-backend-api.onrender.com

Run the App Locally
Start Backend
cd backend
npm run dev

Start frontend
cd frontend
npm run dev

Visit the app at http://localhost:5173

Folder Structure
MealMaster_App/
├── backend/
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── controllers/    # Route logic
│   ├── middleware/     # Auth, error handling
│   └── utils/          # Helper functions
├── frontend/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Main views/pages
│   ├── context/        # Auth and global state
│   ├── services/       # API requests (axios)
│   └── assets/         # Images, icons, etc.

API Testing

Route
Use Postman to test endpoints:

Route   Description
Description POST /auth/register
Register new user
POST /auth/login
User login
GET /meals
Fetch meals
POST /meals
Add a new meal
GET /recipes
Search recipes
POST /planner
Save weekly meal plan
POST /ai/suggestions
Get Gemini-powered meal ideas

Future Improvements
	•	AI chatbot meal planner
	•	OCR ingredient scanner via mobile camera
	•	Offline mode using local storage
	•	Admin panel for community recipe moderation
	•	Deep integration with wearable fitness devices (Fitbit, Apple Watch, etc.)

License

This project is licensed under the MIT License.
You are free to use, modify, and distribute it.






