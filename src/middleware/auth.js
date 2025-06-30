const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error('Токен не надано');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Перевірка терміну дії токена
        if (Date.now() >= decoded.exp * 1000) {
            throw new Error('Термін дії токена закінчився');
        }

        const user = await User.findOne({ _id: decoded._id });

        if (!user) {
            throw new Error('Користувача не знайдено');
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ 
            error: error.message || 'Необхідна авторизація'
        });
    }
};

const adminOnly = (req, res, next) => {
    try {
        if (!req.user) {
            throw new Error('Користувача не авторизовано');
        }
        
        if (req.user.role !== 'admin') {
            throw new Error('Недостатньо прав для виконання операції');
        }
        
        next();
    } catch (error) {
        res.status(403).json({ 
            error: error.message || 'Доступ заборонено'
        });
    }
};

module.exports = { auth, adminOnly };