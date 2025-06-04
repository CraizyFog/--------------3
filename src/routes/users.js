const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Реєстрація нового користувача
router.post('/users/register', async (req, res) => {
    try {
        // Перевірка чи існує користувач з таким логіном
        const existingUser = await User.findOne({ login: req.body.login });
        if (existingUser) {
            return res.status(400).json({ error: 'Користувач з таким логіном вже існує' });
        }

        const user = new User({
            ...req.body,
            role: 'user' // За замовчуванням всі нові користувачі отримують роль 'user'
        });
        
        await user.save();
        res.status(201).json({ message: 'Реєстрація успішна' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Логін
router.post('/users/login', async (req, res) => {
    try {
        const { login, password } = req.body;
        const user = await User.findOne({ login });
        
        if (!user || !(await user.comparePassword(password))) {
            throw new Error('Невірний логін або пароль');
        }

        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });
        
        res.json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Отримання профілю
router.get('/users/me', auth, async (req, res) => {
    res.json(req.user);
});

// Вихід
router.post('/users/logout', auth, async (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Успішний вихід' });
});

// Отримання списку всіх користувачів (тільки адмін)
router.get('/users', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Оновлення користувача
router.patch('/users/:id', auth, adminOnly, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['password', 'fullName', 'rank', 'position'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Неприпустимі поля для оновлення' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        updates.forEach(update => user[update] = req.body[update]);
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Видалення користувача
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }
        res.json({ message: 'Користувача видалено' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;