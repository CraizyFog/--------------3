class Statistics {
    constructor() {
        this.statsContainer = document.getElementById('statistics');
        this.showStatsBtn = document.getElementById('show-stats-btn');
        this.statsDateFrom = document.getElementById('stats-date-from');
        this.statsDateTo = document.getElementById('stats-date-to');
        this.updateStatsBtn = document.getElementById('update-stats');
        this.statsData = document.getElementById('stats-data');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.showStatsBtn.addEventListener('click', () => {
            this.statsContainer.style.display = 'block';
            document.getElementById('crossings-table').style.display = 'none';
            document.getElementById('crossing-form').style.display = 'none';
            this.loadStatistics();
        });

        this.updateStatsBtn.addEventListener('click', () => {
            this.loadStatistics();
        });

        // Повернення до таблиці
        document.addEventListener('click', (e) => {
            if (e.target.id === 'add-crossing-btn' || e.target.id === 'apply-filters') {
                this.statsContainer.style.display = 'none';
                document.getElementById('crossings-table').style.display = 'block';
            }
        });
    }

    async loadStatistics() {
        try {
            const params = {
                startDate: this.statsDateFrom.value,
                endDate: this.statsDateTo.value
            };

            const stats = await API.getStatistics(params);
            this.renderStatistics(stats);
        } catch (error) {
            alert('Помилка при завантаженні статистики: ' + error.message);
        }
    }

    renderStatistics(stats) {
        let totalIn = 0;
        let totalOut = 0;
        let nationalityStats = new Map();

        // Обробка даних
        stats.forEach(stat => {
            if (stat._id === 'В\'їзд') {
                totalIn = stat.count;
                stat.byNationality.forEach(entry => {
                    if (!nationalityStats.has(entry.nationality)) {
                        nationalityStats.set(entry.nationality, { in: 0, out: 0 });
                    }
                    nationalityStats.get(entry.nationality).in++;
                });
            } else if (stat._id === 'Виїзд') {
                totalOut = stat.count;
                stat.byNationality.forEach(entry => {
                    if (!nationalityStats.has(entry.nationality)) {
                        nationalityStats.set(entry.nationality, { in: 0, out: 0 });
                    }
                    nationalityStats.get(entry.nationality).out++;
                });
            }
        });

        // Формування HTML
        let html = `
            <div class="stats-summary">
                <h3>Загальна статистика</h3>
                <p>Загальна кількість перетинів: ${totalIn + totalOut}</p>
                <p>В'їзд: ${totalIn}</p>
                <p>Виїзд: ${totalOut}</p>
            </div>

            <div class="stats-by-nationality">
                <h3>Статистика за громадянством</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Громадянство</th>
                            <th>В'їзд</th>
                            <th>Виїзд</th>
                            <th>Всього</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        nationalityStats.forEach((counts, nationality) => {
            html += `
                <tr>
                    <td>${nationality}</td>
                    <td>${counts.in}</td>
                    <td>${counts.out}</td>
                    <td>${counts.in + counts.out}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        this.statsData.innerHTML = html;
    }
}