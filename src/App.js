  import React from 'react';
  import './index.css';
  import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
  import Landing from './Landing/landing.jsx';
  import Login from './Login/Login.jsx';
  import Signup from './Signup/Signup.jsx';
  import Home from './Home/home';
  import Vitals from './Vitals/vitals';
  import FoodDetails from './FoodDetails/food_details';
  import Recommendations from './Recommendations/recommendations';
  import User_details from './User_Details/user_details';
  import Search from './Search/search';
  import ProtectedRoute from './protectedRoute';
  import CalcForm from "./CalcForm/CalcForm";
  import ProfilePage from "./Profile/profile";
  import Welcome from "./Login/Welcome.jsx"
  import Premium from "./Premium/premium.jsx";
  import Medical from './Medical/medical.jsx';

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
            <Route path="/welcome" element={<ProtectedRoute><Welcome/></ProtectedRoute>}></Route>
            <Route path="/premium" element={<ProtectedRoute><Premium/></ProtectedRoute>}></Route>
            <Route path="/medical" element={<ProtectedRoute><Medical/></ProtectedRoute>}></Route>
          </Routes>
        </Router>
      </div>
    );
  }

  export default App;
