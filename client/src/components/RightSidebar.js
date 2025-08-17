import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './RightSidebar.css';

const RightSidebar = () => {
  const { user } = useContext(AuthContext);
  const [following, setFollowing] = useState([]);
  const [followingLoading, setFollowingLoading] = useState(true);
  const [followingError, setFollowingError] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!user) {
        setFollowingLoading(false);
        return;
      }
      try {
        setFollowingError(null);
        setFollowingLoading(true);
        const response = await fetch(`/api/users/${user.id}/following`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch following list');
        }
        const data = await response.json();
        if (data.success) {
          setFollowing(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch following list');
        }
      } catch (error) {
        console.error('Error fetching following list:', error);
        setFollowingError(error.message);
      } finally {
        setFollowingLoading(false);
      }
    };

    fetchFollowing();
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsError(null);
        setEventsLoading(true);
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        if (data.success) {
          setEvents(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEventsError(error.message);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="right-sidebar">
      <div className="sidebar-section">
        <h4>Events</h4>
        {eventsLoading ? (
          <p>Loading events...</p>
        ) : eventsError ? (
          <p className="error-message">{eventsError}</p>
        ) : events.length > 0 ? (
          <ul className="event-list">
            {events.map((event) => (
              <li key={event._id} className="event-item">
                <div className="event-row">
                  <div>
                    <strong>{event.title}</strong>
                    <p>{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                  <Link className="btn btn--sm" to={`/events/${event._id}`}>View details</Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No events scheduled.</p>
        )}
      </div>
      <div className="sidebar-section">
        <h4>Following</h4>
        {followingLoading ? (
          <p>Loading...</p>
        ) : followingError ? (
          <p className="error-message">{followingError}</p>
        ) : (
          <ul className="contact-list">
            {following.length > 0 ? (
              following.map((followedUser) => (
                <li key={followedUser._id}>
                  <Link to={`/profile/${followedUser._id}`} className="contact-link">
                    <div className="avatar small">
                      {followedUser.avatarUrl ? (
                        <img src={followedUser.avatarUrl} alt="avatar" />
                      ) : (
                        <span>{followedUser.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <span>{followedUser.name}</span>
                  </Link>
                </li>
              ))
            ) : (
              <p>Not following anyone yet.</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
