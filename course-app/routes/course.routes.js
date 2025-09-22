const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Course = require('../models/course.model');
const User = require('../models/user.model');

// Create course
router.post('/', async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json(course);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Register user to course (transaction for consistency)
router.post('/register', async (req, res) => {
    const { userId, courseId } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const [user, course] = await Promise.all([
            User.findById(userId).session(session),
            Course.findById(courseId).session(session)
        ]);
        if (!user || !course) throw new Error('User or Course not found');

        if (!user.enrolledCourses.some(id => id.equals(courseId))) {
            user.enrolledCourses.push(courseId);
        }
        if (!course.students.some(id => id.equals(userId))) {
            course.students.push(userId);
        }

        await user.save({ session });
        await course.save({ session });

        await session.commitTransaction();
        session.endSession();
        res.json({ message: 'Đăng ký thành công' });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ error: err.message });
    }
});

// Get students of course
router.get('/:id/students', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('students', 'name email')
            .lean();
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(course.students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
