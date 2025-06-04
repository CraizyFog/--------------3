class API {
    static BASE_URL = '/api';

    static async register(userData) {
        const response = await fetch(`${this.BASE_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Помилка реєстрації');
        }

        return response.json();
    }

    static async login(login, password) {
        const response = await fetch(`${this.BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login, password }),
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Помилка входу');
        }

        return response.json();
    }

    static async logout() {
        const response = await fetch(`${this.BASE_URL}/users/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Помилка виходу');
        }

        return response.json();
    }

    static async getCurrentUser() {
        const response = await fetch(`${this.BASE_URL}/users/me`, {
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Помилка отримання даних користувача');
        }

        return response.json();
    }

    static async createCrossing(data) {
        const response = await fetch(`${this.BASE_URL}/crossings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Помилка створення запису');
        }

        return response.json();
    }

    static async getCrossings(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${this.BASE_URL}/crossings?${queryString}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Помилка отримання записів');
            }

            const data = await response.json();
            return {
                crossings: data.crossings || [],
                total: data.total || 0,
                page: data.page || 1,
                pages: data.pages || 1
            };
        } catch (error) {
            console.error('Error fetching crossings:', error);
            return {
                crossings: [],
                total: 0,
                page: 1,
                pages: 1
            };
        }
    }

    static async getCrossing(id) {
        const response = await fetch(`${this.BASE_URL}/crossings/${id}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Помилка отримання запису');
        }

        return response.json();
    }

    static async updateCrossing(id, data) {
        const response = await fetch(`${this.BASE_URL}/crossings/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Помилка оновлення запису');
        }

        return response.json();
    }

    static async deleteCrossing(id) {
        const response = await fetch(`${this.BASE_URL}/crossings/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Помилка видалення запису');
        }

        return response.json();
    }

    static async getStatistics(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${this.BASE_URL}/crossings/stats/summary?${queryString}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Помилка отримання статистики');
        }

        return response.json();
    }
}