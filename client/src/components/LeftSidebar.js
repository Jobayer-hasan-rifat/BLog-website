import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import './LeftSidebar.css';

const LeftSidebar = () => {
  const { user } = useContext(AuthContext);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        if (data.success) {
          // Filter out the current user and limit to 5 suggestions
          setSuggestions(data.users.filter(u => u._id !== user.id).slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    // Only for normal users
    if (user && user.role !== 'admin') {
      fetchSuggestions();
    }
  }, [user]);

  const handleConnect = async (userId) => {
    // Placeholder for connect/follow logic
    console.log(`Connecting with user ${userId}`);
    // Optimistically remove from suggestions
    setSuggestions(suggestions.filter(s => s._id !== userId));
  };

  const handleRemove = (userId) => {
    setSuggestions(suggestions.filter(s => s._id !== userId));
  };

  return (
    <div className="left-sidebar">
      {user && (
        <div className="sidebar-profile">
          <div className="avatar small">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" />
            ) : (
              <span>{user.name?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <span>{user.name}</span>
        </div>
      )}

      {/* Hide People You May Know for admin users */}
      {user?.role !== 'admin' && (
        <div className="people-suggestions">
          <h4>People You May Know</h4>
          {suggestions.length > 0 ? (
            <ul>
              {suggestions.map(suggestedUser => (
                <li key={suggestedUser._id} className="suggestion-item">
                  <span>{suggestedUser.name}</span>
                  <div className="suggestion-actions">
                    <button onClick={() => handleConnect(suggestedUser._id)} className="btn-connect">Connect</button>
                    <button onClick={() => handleRemove(suggestedUser._id)} className="btn-remove">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No suggestions right now.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LeftSidebar;
