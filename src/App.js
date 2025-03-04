  import React from 'react';
  import './index.css';
  import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
  import Landing from './Landing/landing.tsx';
  import Login from './Login/Login.tsx';
  import Signup from './Signup/Signup.tsx';
  import Home from './Home/home';
  import Vitals from './Vitals/vitals';
  import FoodDetails from './FoodDetails/food_details';
  import Recommendations from './Recommendations/recommendations';
  import User_details from './User_Details/user_details';
  import Search from './Search/search';
  import ProtectedRoute from './protectedRoute';
  import CalcForm from "./CalcForm/CalcForm";
  import ProfilePage from "./Profile/profile";

  function App() {
    return (
      <div>
        
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/food_details" element={<ProtectedRoute><FoodDetails /></ProtectedRoute>} />
            <Route path="/vitals" element={<ProtectedRoute><Vitals /></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute><Recommendations/></ProtectedRoute>}/>
            <Route path="/user_details" element={<ProtectedRoute><User_details/></ProtectedRoute>}/>
            <Route path="/search" element={<ProtectedRoute><Search/></ProtectedRoute>}/>
            <Route path="/calculateGoal" element={<ProtectedRoute><CalcForm/></ProtectedRoute>}/>
            <Route path="/profile" element={<ProtectedRoute><ProfilePage/></ProtectedRoute>}></Route>
          </Routes>
        </Router>
      </div>
    );
  }

  export default App;
