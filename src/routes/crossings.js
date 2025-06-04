const express = require('express');
const Crossing = require('../models/crossing');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Створення нового запису про перетин кордону
router.post('/crossings', auth, async (req, res) => {
    try {
        const crossing = new Crossing({
            ...req.body,
            registeredBy: req.user._id
        });
        await crossing.save();
        res.status(201).json(crossing);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Отримання всіх записів з можливістю фільтрації
router.get('/crossings', auth, async (req, res) => {
    try {
        const match = {};
        const sort = {};
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Фільтри
        if (req.query.crossingType) {
            match.crossingType = req.query.crossingType;
        }
        if (req.query.startDate) {
            match.crossingDate = { $gte: new Date(req.query.startDate) };
        }
        if (req.query.endDate) {
            match.crossingDate = { ...match.crossingDate, $lte: new Date(req.query.endDate) };
        }
        if (req.query.nationality) {
            match.nationality = req.query.nationality;
        }
        if (req.query.passportNumber) {
            match.passportNumber = req.query.passportNumber;
        }

        // Сортування
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        } else {
            // За замовчуванням сортуємо за датою створення
            sort.createdAt = -1;
        }

        const [crossings, total] = await Promise.all([
            Crossing.find(match)
                .populate('registeredBy', 'fullName rank position')
                .sort(sort)
                .limit(limit)
                .skip(skip),
            Crossing.countDocuments(match)
        ]);

        res.json({
            crossings: crossings || [], // Забезпечуємо, що завжди буде масив
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Отримання запису за ID
router.get('/crossings/:id', auth, async (req, res) => {
    try {
        const crossing = await Crossing.findById(req.params.id)
            .populate('registeredBy', 'fullName rank position');
        
        if (!crossing) {
            return res.status(404).json({ error: 'Запис не знайдено' });
        }
        
        res.json(crossing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Оновлення запису
router.patch('/crossings/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['purpose', 'notes'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Неприпустимі поля для оновлення' });
    }

    try {
        const crossing = await Crossing.findById(req.params.id);
        
        if (!crossing) {
            return res.status(404).json({ error: 'Запис не знайдено' });
        }

        updates.forEach(update => crossing[update] = req.body[update]);
        await crossing.save();
        res.json(crossing);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Видалення запису
router.delete('/crossings/:id', auth, async (req, res) => {
    try {
        const crossing = await Crossing.findById(req.params.id);
        
        if (!crossing) {
            return res.status(404).json({ error: 'Запис не знайдено' });
        }

        await Crossing.deleteOne({ _id: req.params.id });
        res.json({ message: 'Запис видалено' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Отримання статистики
router.get('/crossings/stats/summary', auth, async (req, res) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(0);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        const stats = await Crossing.aggregate([
            {
                $match: {
                    crossingDate: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: '$crossingType',
                    count: { $sum: 1 },
                    byNationality: {
                        $push: {
                            nationality: '$nationality',
                            passportNumber: '$passportNumber'
                        }
                    }
                }
            }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;