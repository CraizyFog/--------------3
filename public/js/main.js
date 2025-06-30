// Ініціалізація компонентів після завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
    // Ініціалізація класів
    window.auth = new Auth();
    window.crossingsManager = new CrossingsManager();
    window.statistics = new Statistics();

    // Обробка помилок
    window.addEventListener('unhandledrejection', event => {
        console.error('Необроблена помилка:', event.reason);
        alert('Виникла помилка: ' + (event.reason.message || 'Невідома помилка'));
    });

    // Обробник події для кнопки 'Головна сторінка'
    document.getElementById('home-page-btn').addEventListener('click', () => {
        document.getElementById('main-interface').style.display = 'block';
        document.getElementById('crossings-table').style.display = 'block';
        window.crossingsManager.loadCrossings();
    });
});