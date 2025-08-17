const express = require('express');
const { getEvents, createEvent, getEvent, getMyEvents } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public: list upcoming events, get event detail
router.route('/')
  .get(getEvents);
router.route('/:id')
  .get(getEvent);

// Authenticated: create and list own events
router.route('/me/history')
  .get(protect, getMyEvents);
router.route('/')
  .post(protect, createEvent);

module.exports = router;
