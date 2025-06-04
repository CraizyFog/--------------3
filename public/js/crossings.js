class CrossingsManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalItems = 0;
        
        // Форма
        this.crossingForm = document.getElementById('crossing-form');
        this.newCrossingForm = document.getElementById('new-crossing-form');
        this.addCrossingBtn = document.getElementById('add-crossing-btn');
        
        // Таблиця та фільтри
        this.crossingsTable = document.getElementById('crossings-table');
        this.crossingsData = document.getElementById('crossings-data');
        this.searchPassport = document.getElementById('search-passport');
        this.dateFrom = document.getElementById('date-from');
        this.dateTo = document.getElementById('date-to');
        this.filterType = document.getElementById('filter-type');
        this.applyFiltersBtn = document.getElementById('apply-filters');
        
        // Пагінація
        this.prevPageBtn = document.getElementById('prev-page');
        this.nextPageBtn = document.getElementById('next-page');
        this.pageInfo = document.getElementById('page-info');

        this.setupEventListeners();
        this.loadCrossings();
    }

    setupEventListeners() {
        this.addCrossingBtn.addEventListener('click', () => {
            this.crossingForm.style.display = 'block';
        });

        this.newCrossingForm.addEventListener('submit', this.handleNewCrossing.bind(this));
        this.applyFiltersBtn.addEventListener('click', () => {
            this.currentPage = 1;
            this.loadCrossings();
        });

        this.prevPageBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadCrossings();
            }
        });

        this.nextPageBtn.addEventListener('click', () => {
            const maxPages = Math.ceil(this.totalItems / this.itemsPerPage);
            if (this.currentPage < maxPages) {
                this.currentPage++;
                this.loadCrossings();
            }
        });

        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.crossingForm.style.display = 'none';
                this.newCrossingForm.reset();
            });
        });
    }

    async handleNewCrossing(event) {
        event.preventDefault();
        
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            patronymic: document.getElementById('patronymic').value,
            birthDate: document.getElementById('birthDate').value,
            passportNumber: document.getElementById('passportNumber').value,
            nationality: document.getElementById('nationality').value,
            rank: document.getElementById('rank').value,
            crossingType: document.getElementById('crossingType').value,
            crossingPoint: document.getElementById('crossingPoint').value,
            purpose: document.getElementById('purpose').value,
            notes: document.getElementById('notes').value
        };

        try {
            await API.createCrossing(formData);
            this.crossingForm.style.display = 'none';
            this.newCrossingForm.reset();
            this.loadCrossings();
        } catch (error) {
            alert(error.message);
        }
    }

    async loadCrossings() {
        const params = {
            page: this.currentPage,
            limit: this.itemsPerPage,
            passportNumber: this.searchPassport.value,
            startDate: this.dateFrom.value,
            endDate: this.dateTo.value,
            crossingType: this.filterType.value
        };

        try {
            const response = await API.getCrossings(params);
            if (response && response.crossings) {
                this.renderCrossings(response.crossings);
                this.totalItems = response.total;
                this.updatePagination();
            } else {
                this.renderCrossings([]);
                this.totalItems = 0;
                this.updatePagination();
            }
        } catch (error) {
            alert(error.message);
            this.renderCrossings([]);
            this.totalItems = 0;
            this.updatePagination();
        }
    }

    renderCrossings(crossings) {
        if (!Array.isArray(crossings)) {
            console.error('Отримані дані не є масивом:', crossings);
            crossings = [];
        }
        
        this.crossingsData.innerHTML = crossings.map(crossing => `
            <tr>
                <td>${new Date(crossing.crossingDate).toLocaleString()}</td>
                <td>${crossing.lastName} ${crossing.firstName} ${crossing.patronymic}<br><small>${crossing.rank}</small></td>
                <td>${crossing.passportNumber}</td>
                <td>${crossing.nationality}</td>
                <td>${crossing.crossingType}</td>
                <td>${crossing.crossingPoint}</td>
                <td>${crossing.purpose}</td>
                <td>${crossing.registeredBy ? `${crossing.registeredBy.fullName}<br>${crossing.registeredBy.rank}` : 'Не вказано'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="crossingsManager.editCrossing('${crossing._id}')">
                        Редагувати
                    </button>
                    <button class="action-btn delete-btn" onclick="crossingsManager.deleteCrossing('${crossing._id}')">
                        Видалити
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updatePagination() {
        const maxPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.pageInfo.textContent = `Сторінка ${this.currentPage} з ${maxPages}`;
        this.prevPageBtn.disabled = this.currentPage === 1;
        this.nextPageBtn.disabled = this.currentPage === maxPages;
    }

    async editCrossing(id) {
        try {
            const crossing = await API.getCrossing(id);
            // Заповнити форму даними
            Object.keys(crossing).forEach(key => {
                const input = document.getElementById(key);
                if (input && key !== '_id') {
                    if (key === 'birthDate' || key === 'crossingDate') {
                        input.value = new Date(crossing[key]).toISOString().split('T')[0];
                    } else {
                        input.value = crossing[key];
                    }
                }
            });
            
            this.crossingForm.style.display = 'block';
            this.newCrossingForm.dataset.editId = id;
        } catch (error) {
            alert(error.message);
        }
    }

    async deleteCrossing(id) {
        if (confirm('Ви впевнені, що хочете видалити цей запис?')) {
            try {
                await API.deleteCrossing(id);
                this.loadCrossings();
            } catch (error) {
                alert(error.message);
            }
        }
    }
}