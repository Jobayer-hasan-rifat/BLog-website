import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DraftsContext } from '../context/DraftsContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { drafts } = useContext(DraftsContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="nav">
      <div className="nav__inner">
        <Link to="/" className="nav__brand">MiniBlog</Link>
        <div className="nav__links">
          <Link to="/" className="nav__link">Home</Link>
          {user && <Link to="/events" className="nav__link">Events</Link>}
          {user && (
            <>
              <Link to="/events/create" className="nav__link">Create Event</Link>
              {user.role !== 'admin' && (
                <>
                  <Link to="/drafts" className="nav__link">Drafts {drafts.length > 0 && `(${drafts.length})`}</Link>
                  <Link to="/bookmarks" className="nav__link">Bookmarks</Link>
                </>
              )}
              {user.role === 'admin' ? (
                <Link to="/admin" className="nav__link">Admin</Link>
              ) : (
                <Link to="/dashboard" className="nav__link">Dashboard</Link>
              )}
              <button className="btn btn--secondary" onClick={handleLogout}>Logout</button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className="btn">Login</Link>
              <Link to="/register" className="btn btn--secondary">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
