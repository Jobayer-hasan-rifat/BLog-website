const Event = require('../models/Event');

// @desc    Get all upcoming events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } })
      .sort({ date: 1 })
      .populate('user', 'name');

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single event by id
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('user', 'name');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location } = req.body;
    if (!title || !description || !date) {
      return res.status(400).json({ success: false, message: 'title, description and date are required' });
    }
    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      location,
      user: req.user.id,
    });
    await event.populate('user', 'name');
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Get events created by current user (history)
// @route   GET /api/events/me/history
// @access  Private
exports.getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};
