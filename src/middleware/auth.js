const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Необхідна авторизація' });
    }
};

const adminOnly = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Доступ заборонено' });
        }
        next();
    } catch (error) {
        res.status(403).json({ error: 'Доступ заборонено' });
    }
};

module.exports = { auth, adminOnly };