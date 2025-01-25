import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Navbar.css';

const Navbar = ({ user, handleLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">TechEvents</Link>
        <p>Welcome {user ? user.name : 'Guest'}</p>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        {(user?.role === 'organizer' || user?.role === 'admin') && <Link to="/dashboard">Dashboard</Link>}
        {(user?.role === 'organizer'|| user?.role === 'admin') && <Link to="/create-event">CreateEvent</Link>}
        {user?.role === 'admin' && <Link to="/admin-dashboard">Admin Dashboard</Link>}
        
        {user ? (
          <>
            <Link to="/rsvp-events">MyEvents</Link>
            <Link to="/profile">MyProfile</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
