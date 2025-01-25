// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import axios from 'axios';
// import Navbar from './components/Navbar';
// import Footer from './components/Footer';
// import Homepage from './pages/HomePage'; // Make sure this points to Homepage.js
// import EventDetailsPage from './pages/EventDetailsPage';
// import DashboardPage from './pages/DashboardPage';
// import UserDashboardPage from './pages/UserDashboardPage';
// import CreateEventPage from './pages/CreateEventPage';
// import AdminDashboardPage from './pages/AdminDashboardPage';
// import LoginPage from './pages/LoginPage';
// import SignupPage from './pages/SignupPage';
// import EditEventPage from './pages/EditEventPage';
// import Chat from './components/chat';
// import UserProfilePage from './pages/UserProfilePage.js';
// import './assets/styles/global.css';
// import './assets/styles/homepage.css'; // Custom styles for homepage
// import '@fortawesome/fontawesome-free/css/all.min.css';
// import ForgotPasswordPage from './pages/ForgotPasswordPage.js';
// import ResetPasswordPage from './pages/ResetPasswordPage.js';

// const App = () => {
//   const [user, setUser] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   useEffect(() => {
//     const fetchUser = async () => {
//       const token = localStorage.getItem('token');
//       if (token) {
//         try {
//           const response = await axios.get('http://localhost:5000/api/auth/me', {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           setIsLoggedIn(true);
//           setUser(response.data.user);
//         } catch (error) {
//           console.error('Error fetching user:', error);
//           localStorage.removeItem('token');
//           setIsLoggedIn(false);
//         }
//       }
//     };

//     fetchUser();
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     setIsLoggedIn(false);
//     alert('You have logged out!');
//   };

//   return (
//     <Router>
//       <div className="app">
//         <Navbar user={user} handleLogout={handleLogout} />
//         <div className="main-content">
//           <Routes>
//           <Route path="/me"/>
//             <Route path="/" element={<Homepage />} />
//             <Route path="/events/:id" element={<EventDetailsPage />} />
//             <Route
//               path="/rsvp-events"
//               element={user ? (<UserDashboardPage />) : (<Navigate to="/login" replace />)}
//             />
//             <Route path="/profile" element={<UserProfilePage />} />
//             <Route path="/profile-picture" element={<UserProfilePage />} />
//             <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//             <Route path="/reset-password" element={<ResetPasswordPage />} />
//             <Route path="/event/:eventId/chat" element={<Chat />} />
//             <Route
//               path="/dashboard"
//               element={
//                 user?.role === 'organizer' || user?.role === 'admin' ? (
//                   <DashboardPage />
//                 ) : (
//                   <Navigate to="/" replace />
//                 )
//               }
//             />
//             <Route
//               path="/create-event"
//               element={
//                 user?.role === 'organizer' || user?.role === 'admin' ? (
//                   <CreateEventPage />
//                 ) : (
//                   <Navigate to="/" replace />
//                 )
//               }
//             />
//             <Route
//               path="/edit-event/:id"
//               element={
//                 user?.role === 'organizer' || user?.role === 'admin' ? (
//                   <EditEventPage />
//                 ) : (
//                   <Navigate to="/" replace />
//                 )
//               }
//             />
//             <Route
//               path="/admin-dashboard"
//               element={
//                 user?.role === 'admin' ? (
//                   <AdminDashboardPage />
//                 ) : (
//                   <Navigate to="/" replace />
//                 )
//               }
//             />
//             <Route path="/login" element={<LoginPage setUser={setUser} />} />
//             <Route path="/signup" element={<SignupPage />} />
//           </Routes>
//         </div>
//         <Footer />
//       </div>
//     </Router>
//   );
// };

// export default App;


import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Homepage from './pages/HomePage';
import EventDetailsPage from './pages/EventDetailsPage';
import UserDashboardPage from './pages/UserDashboardPage';
import UserProfilePage from './pages/UserProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Chat from './components/chat';
import DashboardPage from './pages/DashboardPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import './assets/styles/global.css';

const App = () => {
  const [user, setUser] = useState(null);

  // Fetch user data if token exists in localStorage
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('token');
          console.error('Error fetching user:', error);
        }
      }
    };

    fetchUser();
  }, []);

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    alert('You have logged out!');
  };

  // Define routes
  const appRoutes = [
    { path: "/", element: <Homepage /> },
    { path: "/events/:id", element: <EventDetailsPage /> },
    {
      path: "/rsvp-events",
      element: user ? <UserDashboardPage /> : <Navigate to="/login" />,
    },
    { path: "/profile", element: <UserProfilePage /> },
    { path: "/profile-picture", element: <UserProfilePage /> },
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
    { path: "/reset-password", element: <ResetPasswordPage /> },
    { path: "/event/:eventId/chat", element: <Chat /> },
    {
      path: "/dashboard",
      element:
        user?.role === "organizer" || user?.role === "admin" ? (
          <DashboardPage />
        ) : (
          <Navigate to="/" />
        ),
    },
    {
      path: "/create-event",
      element:
        user?.role === "organizer" || user?.role === "admin" ? (
          <CreateEventPage />
        ) : (
          <Navigate to="/" />
        ),
    },
    {
      path: "/edit-event/:id",
      element:
        user?.role === "organizer" || user?.role === "admin" ? (
          <EditEventPage />
        ) : (
          <Navigate to="/" />
        ),
    },
    {
      path: "/admin-dashboard",
      element: user?.role === "admin" ? <AdminDashboardPage /> : <Navigate to="/" />,
    },
    { path: "/login", element: <LoginPage setUser={setUser} /> },
    { path: "/signup", element: <SignupPage /> },
  ];

  return (
    <Router>
      <div className="app">
        <Navbar user={user} handleLogout={handleLogout} />
        <div className="main-content">
          <Routes>
            {appRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
