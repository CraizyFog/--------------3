const mongoose = require('mongoose');
const User = require('./models/user');

const createAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/border-crossing', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const adminExists = await User.findOne({ role: 'admin' });
        
        if (!adminExists) {
            const admin = new User({
                login: 'admin',
                password: 'admin123',
                fullName: 'Головний адміністратор',
                rank: 'Полковник',
                position: 'Керівник підрозділу',
                role: 'admin'
            });

            await admin.save();
            console.log('Адміністратор створений успішно');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Помилка при створенні адміністратора:', error);
        process.exit(1);
    }
};

createAdminUser();