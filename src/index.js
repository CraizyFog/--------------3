require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

// Імпорт маршрутів
const userRouter = require('./routes/users');
const crossingRouter = require('./routes/crossings');

// Ініціалізація Express
const app = express();
const port = process.env.PORT || 3000;

// Підключення до MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/border-crossing', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Статичні файли
app.use(express.static(path.join(__dirname, '../public')));

// Маршрути
app.use('/api', userRouter);
app.use('/api', crossingRouter);

// Обробка помилок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Щось пішло не так!' });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущено на порту ${port}`);
});