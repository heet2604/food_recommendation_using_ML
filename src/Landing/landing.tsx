// import React , {useEffect} from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';


// function Landing() {

//   useEffect(() => {
//     axios.get('http://localhost:3000')
//       .then(response => {
//         console.log('Data fetched from backend:', response.data);
//       })
//       .catch(error => {
//         console.error('Error fetching data:', error);
//       });
//   }, []);

//   return (
//     <div
//       className="relative flex flex-col justify-center items-center h-screen text-center text-white bg-cover bg-center"
//       style={{
//         backgroundImage: `url('./apple.jpg')`,
//       }}
//     >

//       <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
      
//       <h1 className="text-6xl font-bold mb-4 z-10">Welcome to the world of <span className='text-green-500'>REAL</span> Fitness</h1>
//       <h2 className="text-2xl md:text-3xl text-gray-300 z-10">Be fit from Within</h2>
//       <br />
      
//       <div className="z-10 flex space-x-6 mt-6 gap-20">
//         <Link to="/login">
//           <button className="bg-black text-white py-3 px-6 rounded-3xl border-none">
//             Log-in
//           </button>
//         </Link>
//         <Link to="/signup">
//           <button className="bg-white text-black py-3 px-6 rounded-3xl border-none">
//             Sign-up
//           </button>
//         </Link>
//       </div>
//     </div>
//   );
// }

// export default Landing;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";


function Landing() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    axios.get('http://localhost:3000')
      .then(response => {
        console.log('Data fetched from backend:', response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div
      className="relative flex flex-col justify-center items-center min-h-screen text-center text-white bg-cover bg-center overflow-hidden"
      // style={{
      //   backgroundImage: `url('./apple.jpg')`,
      // }}
    >
      {/* Overlay with darker gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/90 to-black/90 z-0"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-600 rounded-full mix-blend-overlay opacity-20 filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-green-700 rounded-full mix-blend-overlay opacity-20 filter blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
      </div>
      
      {/* Content container with animation */}
      <div className={`relative z-10 w-full max-w-4xl px-6 py-12 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Logo or brand mark */}
        {/* <div className="mx-auto w-20 h-20 mb-8 bg-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
          <span className="text-black text-3xl font-bold">N</span>
        </div> */}
        

          <div className="flex items-center justify-center relative mb-5">
              {/* Glowing Green FontAwesome Icon */}
              <FontAwesomeIcon
                icon={faLeaf}
                className="text-green-400 text-3xl drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"
              />
          
              {/* Glowing Green Text */}
              <h1
                className="ml-3 text-2xl font-semibold text-green-400 relative
                  before:absolute before:-inset-1 before:bg-green-400 before:blur-lg before:opacity-50
                  drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"
              >
              </h1>
            </div>


        
        {/* Main heading with animated gradient text */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          Welcome to{" "}
          <span className="inline-block relative">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 animate-pulse">
              Nourish
            </span>
            <span className="absolute inset-0 bg-green-500/20 blur-sm rounded-lg transform -skew-x-12"></span>
          </span>
        </h1>
        
        {/* Subheading with slight delay */}
        <h2 className={`text-xl md:text-3xl text-gray-300 font-light mb-10 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          Be fit from <span className="italic font-medium text-green-300">Within</span>
        </h2>
        
        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="p-4 rounded-xl bg-black/40 backdrop-blur-sm">
            <div className="w-12 h-12 mb-3 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">Personalized Plans</h3>
            <p className="text-sm text-gray-300">Tailored to your unique goals</p>
          </div>
          
          <div className="p-4 rounded-xl bg-black/40 backdrop-blur-sm">
            <div className="w-12 h-12 mb-3 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">Track Progress</h3>
            <p className="text-sm text-gray-300">Monitor your fitness journey</p>
          </div>
          
          <div className="p-4 rounded-xl bg-black/40 backdrop-blur-sm">
            <div className="w-12 h-12 mb-3 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">Expert Community</h3>
            <p className="text-sm text-gray-300">Learn from fitness professionals</p>
          </div>
        </div>
        
        {/* CTA buttons with animation */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Link to="/login">
            <button className="group relative w-48 h-14 overflow-hidden rounded-full bg-gradient-to-r from-green-600 to-emerald-700 text-white font-medium shadow-lg shadow-green-500/30 transition-all duration-300 hover:shadow-green-500/50 hover:scale-105">
              <span className="relative z-10 flex items-center justify-center w-full h-full">
                <span>Login</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white transition-all duration-300 opacity-0 group-hover:opacity-20"></div>
            </button>
          </Link>
          
          <Link to="/signup">
            <button className="group relative w-48 h-14 overflow-hidden rounded-full bg-black/40 backdrop-blur-sm border border-green-500/30 text-white font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
              <span className="relative z-10 flex items-center justify-center w-full h-full">
                <span>Sign Up</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300 opacity-0 group-hover:opacity-20"></div>
            </button>
          </Link>
        </div>
        
        {/* Footer text */}
        <div className="mt-16 text-sm text-gray-400">
          Start your journey to a healthier lifestyle today
        </div>
      </div>
    </div>
  );
}

export default Landing;
