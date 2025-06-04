class Auth {
    constructor() {
        this.currentUser = null;
        this.authForm = document.getElementById('auth-form');
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.registrationForm = document.getElementById('registration-form');
        this.mainInterface = document.getElementById('main-interface');
        this.userInfo = document.getElementById('user-info');
        this.userName = document.getElementById('user-name');
        this.userRank = document.getElementById('user-rank');
        this.logoutBtn = document.getElementById('logout-btn');
        this.adminControls = document.getElementById('admin-controls');
        this.showRegisterBtn = document.getElementById('show-register-btn');
        this.cancelRegisterBtn = document.getElementById('cancel-register-btn');

        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        this.authForm.addEventListener('submit', this.handleLogin.bind(this));
        this.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        this.registrationForm.addEventListener('submit', this.handleRegistration.bind(this));
        
        // Показати форму реєстрації
        this.showRegisterBtn.addEventListener('click', () => {
            this.loginForm.style.display = 'none';
            this.registerForm.style.display = 'block';
        });

        // Скасувати реєстрацію
        this.cancelRegisterBtn.addEventListener('click', () => {
            this.registerForm.style.display = 'none';
            this.loginForm.style.display = 'block';
            this.registrationForm.reset();
        });
    }

    async handleRegistration(event) {
        event.preventDefault();
        
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        if (password !== confirmPassword) {
            alert('Паролі не співпадають');
            return;
        }

        const userData = {
            login: document.getElementById('reg-login').value,
            password: password,
            fullName: document.getElementById('reg-fullname').value,
            rank: document.getElementById('reg-rank').value,
            position: document.getElementById('reg-position').value
        };

        try {
            await API.register(userData);
            alert('Реєстрація успішна! Тепер ви можете увійти в систему.');
            this.registerForm.style.display = 'none';
            this.loginForm.style.display = 'block';
            this.registrationForm.reset();
        } catch (error) {
            alert(error.message);
        }
    }

    async checkAuth() {
        try {
            const user = await API.getCurrentUser();
            this.setCurrentUser(user);
        } catch (error) {
            this.setCurrentUser(null);
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;

        try {
            const { user } = await API.login(login, password);
            this.setCurrentUser(user);
        } catch (error) {
            alert(error.message);
        }
    }

    async handleLogout() {
        try {
            await API.logout();
            this.setCurrentUser(null);
        } catch (error) {
            alert(error.message);
        }
    }

    setCurrentUser(user) {
        this.currentUser = user;

        if (user) {
            this.loginForm.style.display = 'none';
            this.mainInterface.style.display = 'block';
            this.userInfo.style.display = 'flex';
            this.userName.textContent = user.fullName;
            this.userRank.textContent = `${user.rank} - ${user.position}`;
            
            if (user.role === 'admin') {
                this.adminControls.style.display = 'block';
            } else {
                this.adminControls.style.display = 'none';
            }
        } else {
            this.loginForm.style.display = 'block';
            this.mainInterface.style.display = 'none';
            this.userInfo.style.display = 'none';
            this.authForm.reset();
        }
    }
}