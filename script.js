document.addEventListener('DOMContentLoaded', () => {
    // Éléments DOM
    const authScreen = document.getElementById('auth-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultsScreen = document.getElementById('results-screen');
    const loginForm = document.querySelector('.auth-form');
    const registerForm = document.querySelectorAll('.auth-form')[1];
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const timeDisplay = document.getElementById('time');
    const scoreDisplay = document.getElementById('current-score');
    const flagImg = document.getElementById('flag-img');
    const countryInput = document.getElementById('country-input');
    const submitAnswerBtn = document.getElementById('submit-answer');
    const feedbackDisplay = document.getElementById('feedback');
    const finalScoreDisplay = document.getElementById('final-score');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const playAgainBtn = document.getElementById('play-again');
    const logoutBtn = document.getElementById('logout-btn');
    // Variables du jeu
    let countries = [];
    let currentGameCountries = [];
    let currentCountryIndex = 0;
    let score = 0;
    let timer;
    let timeLeft = 20;
    let currentUser = null;
    // API URL pour les pays
    const API_URL = 'https://restcountries.com/v3.1/all';
    // Basculer entre les formulaires de connexion et d'inscription
    showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    });
    showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    });
    // Gestion de l'inscription
    console.log('registerBtn:', registerBtn);
    registerBtn.addEventListener('click', () => {
        console.log('Clique sur "S\'inscrire" détecté');
    const username =
    document.getElementById('register-username').value.trim();
    const password =
    document.getElementById('register-password').value.trim();
    console.log('Nom:', username, 'Mot de passe:', password);
    if (!username || !password) {
    alert('Veuillez remplir tous les champs');
    return;
    }
    // Stockage local simple (en production, utiliser un backend)
    const users = JSON.parse(localStorage.getItem('flagQuizUsers'))
    || [];
    if (users.some(user => user.username === username)) {
    alert('Ce nom d\'utilisateur est déjà pris');
    return;
    }
    users.push({ username, password, scores: [] });
    localStorage.setItem('flagQuizUsers', JSON.stringify(users));
    console.log('Utilisateurs enregistrés :', users);
    alert ('Inscription réussie! Vous pouvez maintenant vous connecter.');
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    });
    // Gestion de la connexion
    loginBtn.addEventListener('click', () => {
    const username =
    document.getElementById('login-username').value.trim();
    const password =
    document.getElementById('login-password').value.trim();
    if (!username || !password) {
    alert('Veuillez remplir tous les champs');
    return;
    }
    const users = JSON.parse(localStorage.getItem('flagQuizUsers'))
    || [];
    const user = users.find(u => u.username === username &&
    u.password === password);
    console.log('Tentative de connexion avec :', username, password);
    console.log('Utilisateurs enregistrés dans localStorage :', users);
    if (!user) {
    alert('Nom d\'utilisateur ou mot de passe incorrect');
    return;
    }
    currentUser = user;
    startGame();
    });
    // Déconnexion
    logoutBtn.addEventListener('click', () => {
    currentUser = null;
    authScreen.style.display = 'block';
    gameScreen.style.display = 'none';
    resultsScreen.style.display = 'none';
    });
    // Rejouer
    playAgainBtn.addEventListener('click', startGame);
    // Charger les pays depuis l'API
    async function fetchCountries() {
    try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erreur de chargement des pays');
    const data = await response.json();
    // Filtrer les pays qui ont un drapeau et un nom commun
    return data.filter(country =>
    country.flags?.png && country.name?.common
    ).map(country => ({
    name: country.translations?.fra?.common,
    flag: country.flags.png
    }));
    } catch (error) {
    console.error('Erreur:', error);
    return [];
    }
    }
    // Démarrer une nouvelle partie
    async function startGame() {
    if (countries.length === 0) {
    countries = await fetchCountries();
    if (countries.length === 0) {
    alert('Impossible de charger les pays. Veuillez réessayer plus tard.');
    return;
    }
    }
    // Sélectionner 10 pays aléatoires uniques
    currentGameCountries = [];
    const shuffled = [...countries].sort(() => 0.5 - Math.random());
    currentGameCountries = shuffled.slice(0, 10);
    currentCountryIndex = 0;
    score = 0;
    scoreDisplay.textContent = score;
    authScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    resultsScreen.style.display = 'none';
    loadNextCountry();
    }
    // Charger le pays suivant
    function loadNextCountry() {
    if (currentCountryIndex >= currentGameCountries.length) {
    endGame();
    return;
    }
    const currentCountry =
    currentGameCountries[currentCountryIndex];
    flagImg.src = currentCountry.flag;
    countryInput.value = '';
    countryInput.focus();
    feedbackDisplay.textContent = '';
    feedbackDisplay.className = 'feedback';
    // Réinitialiser et démarrer le timer
    clearInterval(timer);
    timeLeft = 20;
    timeDisplay.textContent = timeLeft;
    timeDisplay.classList.remove('warning');
    timer = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    if (timeLeft <= 5) {
    timeDisplay.classList.add('warning');
    }
    if (timeLeft <= 0) {
    clearInterval(timer);
    handleTimeOut();
    }
    }, 1000);
    }
    // Gérer la fin du temps
    function handleTimeOut() {
    feedbackDisplay.textContent = `Temps écoulé! La réponse était:
    ${currentGameCountries[currentCountryIndex].name}`;
    feedbackDisplay.className = 'feedback incorrect';
    setTimeout(() => {
    currentCountryIndex++;
    loadNextCountry();
    }, 2000);
    }
    // Soumettre la réponse
    submitAnswerBtn.addEventListener('click', checkAnswer);
    countryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
    });
    function checkAnswer() {
    const userAnswer = countryInput.value.trim().toLowerCase();
    const correctAnswer =
    currentGameCountries[currentCountryIndex].name.toLowerCase();
    clearInterval(timer);
    if (userAnswer === correctAnswer) {
    score++;
    scoreDisplay.textContent = score;
    feedbackDisplay.textContent = 'Correct!';
    feedbackDisplay.className = 'feedback correct';
    } else {
    feedbackDisplay.textContent = `Incorrect! La réponse était:
    ${currentGameCountries[currentCountryIndex].name}`;
    feedbackDisplay.className = 'feedback incorrect';
    }
    setTimeout(() => {
    currentCountryIndex++;
    loadNextCountry();
    }, 2000);
    }
    // Terminer la partie
    function endGame() {
    gameScreen.style.display = 'none';
    resultsScreen.style.display = 'block';
    finalScoreDisplay.textContent = score;
    // Enregistrer le score
    if (currentUser) {
    const users =
    JSON.parse(localStorage.getItem('flagQuizUsers'));
    const userIndex = users.findIndex(u => u.username ===
    currentUser.username);
    users[userIndex].scores.push({
    score,
    date: new Date().toISOString()
    });
    // Garder seulement les 10 meilleurs scores
    users[userIndex].scores.sort((a, b) => b.score - a.score);
    if (users[userIndex].scores.length > 10) {
    users[userIndex].scores =
    users[userIndex].scores.slice(0, 10);
    }
    localStorage.setItem('flagQuizUsers',
    JSON.stringify(users));
    }
    // Mettre à jour le classement
    updateLeaderboard();
    }
    // Mettre à jour le tableau des scores
    function updateLeaderboard() {
    const users = JSON.parse(localStorage.getItem('flagQuizUsers'))
    || [];
    // Trier les utilisateurs par leur meilleur score
    const sortedUsers = users.map(user => ({
    username: user.username,
    bestScore: Math.max(...user.scores.map(s => s.score), 0)
    })).sort((a, b) => b.bestScore - a.bestScore);
    leaderboardBody.innerHTML = '';
    sortedUsers.slice(0, 10).forEach((user, index) => {
    const row = document.createElement('tr');
    if (currentUser && user.username === currentUser.username) {
    row.classList.add('current-user');
    }
    row.innerHTML = `
    <td>${index + 1}</td>
    <td>${user.username}</td>
    <td>${user.bestScore}</td>
    `;
    leaderboardBody.appendChild(row);
    });
    }
    });