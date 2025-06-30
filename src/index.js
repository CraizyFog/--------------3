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
}).then(() => {
    console.log('Успішне підключення до MongoDB');
}).catch((error) => {
    console.error('Помилка підключення до MongoDB:', error);
    process.exit(1);
});

// Перевірка стану підключення
mongoose.connection.on('error', (error) => {
    console.error('Помилка MongoDB:', error);
});

mongoose.connection.on('disconnected', () => {
    console.error('MongoDB відключено. Спроба перепідключення...');
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS налаштування
const frontendPort = process.env.FRONTEND_PORT || 8080;
app.use(cors({
    origin: process.env.FRONTEND_URL || `http://localhost:${frontendPort}`,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Статичні файли
app.use(express.static(path.join(__dirname, '../public')));

// Маршрути
app.use('/api', userRouter);
app.use('/api', crossingRouter);

// Обробка помилок
app.use((err, req, res, next) => {
    console.error(err);
    
    if (err instanceof mongoose.Error) {
        return res.status(400).json({ 
            error: 'Помилка бази даних',
            details: err.message 
        });
    }
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({ 
            error: 'Помилка валідації',
            details: err.message 
        });
    }
    
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
            error: 'Помилка авторизації',
            details: err.message 
        });
    }
    
    res.status(err.status || 500).json({ 
        error: err.message || 'Внутрішня помилка сервера',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Запуск сервера (тільки якщо є підключення до БД)
mongoose.connection.once('open', () => {
    app.listen(port, () => {
        console.log(`Сервер запущено на порту ${port}`);
    });
});