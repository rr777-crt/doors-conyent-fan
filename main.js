// main.js
// main.js

// Состояние игры
let gameState = {
    currentRoom: 1,
    visitedRooms: new Set(),
    totalRooms: 25,
    roomsToWin: 100,
    roomsCompleted: 0,
    lives: 1,
    monstersMet: 0,
    temporalActive: false,
    temporalTimer: null,
    gameActive: false,
    hasKey: false,
    index: {
        temporal: { name: "Временной", description: "Появляется при открытии двери с 15% шансом. Убивает через 5 секунд, но вы в безопасности, если откроете другую дверь.", met: false },
        redCreature: { name: "Красная тварь", description: "Требует нажать кнопку в течение 1.5 секунд.", met: false },
        greenCreature: { name: "Зеленая тварь", description: "Нельзя нажимать кнопку в течение 1.5 секунд.", met: false },
        eyePerformer: { name: "Совершитель глаз", description: "Появляется при открытии двери с 20% шансом (макс 2 раза за игру).", met: false, count: 0 },
        darkness: { name: "Тьма", description: "В тёмной комнате не работает фонарик.", met: false },
        bright: { name: "ЯРКИЙ", description: "Ослепляет экран на 10 секунд. Нужно нажать 20 раз чтобы победить.", met: false }
    }
};

// Инициализация игры
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем сохраненный индекс из localStorage
    loadGameState();
    
    // Кнопка начала игры
    const playBtn = document.querySelector('.play-game');
    if (playBtn) {
        playBtn.addEventListener('click', startGame);
    }

    // Кнопка возврата в меню
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', returnToMenu);
    }

    // Кнопка просмотра индекса
    const indexBtn = document.querySelector('.index-see');
    if (indexBtn) {
        indexBtn.addEventListener('click', showIndex);
    }

    // Кнопка возврата из индекса
    const indexBackBtn = document.getElementById('index-back-btn');
    if (indexBackBtn) {
        indexBackBtn.addEventListener('click', returnToMenu);
    }
});

// Загрузка состояния игры
function loadGameState() {
    const savedState = localStorage.getItem('roomGameIndex');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        gameState.index = { ...gameState.index, ...parsed };
        updateIndexDisplay();
    }
}

// Сохранение состояния игры
function saveGameState() {
    localStorage.setItem('roomGameIndex', JSON.stringify(gameState.index));
}

// Начало игры
function startGame() {
    gameState = {
        ...gameState,
        currentRoom: 1,
        visitedRooms: new Set([1]),
        roomsCompleted: 0,
        lives: 1,
        monstersMet: 0,
        temporalActive: false,
        temporalTimer: null,
        gameActive: true,
        hasKey: false
    };

    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    loadRoom(1);
}

// Загрузка комнаты
function loadRoom(roomNumber) {
    gameState.currentRoom = roomNumber;
    gameState.visitedRooms.add(roomNumber);
    gameState.roomsCompleted++;
    gameState.hasKey = false;
    
    updateStats();
    createRoomContent();
    
    // Сбрасываем состояние временного
    if (gameState.temporalActive) {
        clearTimeout(gameState.temporalTimer);
        gameState.temporalActive = false;
        document.body.classList.remove('temporal-warning');
    }

    // Проверка победы
    if (gameState.roomsCompleted >= gameState.roomsToWin) {
        gameWin();
    }
}

// Создание содержимого комнаты
function createRoomContent() {
    const roomContainer = document.getElementById('room-container');
    roomContainer.innerHTML = '';
    
    // Создаем ключ (50% шанс)
    if (Math.random() < 0.5) {
        const key = document.createElement('button');
        key.className = 'btn key';
        key.textContent = 'Взять ключ';
        key.addEventListener('click', takeKey);
        roomContainer.appendChild(key);
    }
    
    // Создаем двери (только если есть ключ или это первая комната)
    if (gameState.hasKey || gameState.currentRoom === 1) {
        createDoors();
    } else {
        const message = document.createElement('p');
        message.textContent = 'Найдите ключ чтобы открыть дверь';
        message.style.color = '#e74c3c';
        roomContainer.appendChild(message);
    }
}

// Взять ключ
function takeKey() {
    gameState.hasKey = true;
    document.querySelector('.key').textContent = 'Ключ получен!';
    document.querySelector('.key').disabled = true;
    
    // Создаем двери после получения ключа
    createDoors();
}

// Создание дверей
function createDoors() {
    const roomContainer = document.getElementById('room-container');
    
    // Удаляем сообщение о необходимости ключа если было
    const messages = roomContainer.querySelectorAll('p');
    messages.forEach(msg => msg.remove());
    
    // Создаем 3-5 случайных дверей
    const doorCount = Math.floor(Math.random() * 3) + 3;
    const availableRooms = [];
    
    // Собираем доступные комнаты (1-25)
    for (let i = 1; i <= gameState.totalRooms; i++) {
        if (!availableRooms.includes(i)) {
            availableRooms.push(i);
        }
    }
    
    // Перемешиваем и берем нужное количество
    shuffleArray(availableRooms);
    const selectedRooms = availableRooms.slice(0, doorCount);
    
    // Создаем элементы дверей
    selectedRooms.forEach(room => {
        const door = document.createElement('div');
        door.className = 'door';
        door.innerHTML = `Комната ${room}<div class="door-knob"></div>`;
        door.addEventListener('click', () => openDoor(room));
        
        roomContainer.appendChild(door);
    });
}

// Открытие двери
function openDoor(roomNumber) {
    if (!gameState.gameActive || !gameState.hasKey) return;
    
    // Проверка на появление временного (15% шанс)
    if (Math.random() < 0.15 && !gameState.temporalActive) {
        spawnTemporal();
        gameState.index.temporal.met = true;
        saveGameState();
        updateIndexDisplay();
    }
    
    // Если временной активен, мы в безопасности при открытии двери
    if (gameState.temporalActive) {
        clearTimeout(gameState.temporalTimer);
        gameState.temporalActive = false;
        document.body.classList.remove('temporal-warning');
    }
    
    // Переход в новую комнату
    loadRoom(roomNumber);
}

// Появление временного
function spawnTemporal() {
    gameState.temporalActive = true;
    gameState.monstersMet++;
    
    // Визуальное предупреждение
    document.body.classList.add('temporal-warning');
    
    // Сообщение игроку
    showMessage('Появился ВРЕМЕННОЙ! Откройте дверь чтобы спастись!', 'danger');
    
    // Таймер смерти через 5 секунд
    gameState.temporalTimer = setTimeout(() => {
        if (gameState.temporalActive) {
            playerDeath("Временной поймал вас!");
        }
    }, 5000);
    
    updateStats();
}

// Смерть игрока
function playerDeath(reason) {
    gameState.gameActive = false;
    gameState.lives--;
    
    // Показываем сообщение о смерти
    showMessage(`Вы умерли! Причина: ${reason}`, 'danger');
    
    setTimeout(() => {
        returnToMenu();
    }, 3000);
}

// Победа в игре
function gameWin() {
    gameState.gameActive = false;
    showMessage('Поздравляем! Вы прошли 100 комнат и выиграли!', 'success');
    
    setTimeout(() => {
        returnToMenu();
    }, 5000);
}

// Показать сообщение
function showMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 30px;
        background: ${type === 'danger' ? '#e74c3c' : '#2ecc71'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        font-weight: bold;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Возврат в меню
function returnToMenu() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('index-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    
    // Сброс состояния временного
    if (gameState.temporalActive) {
        clearTimeout(gameState.temporalTimer);
        gameState.temporalActive = false;
        document.body.classList.remove('temporal-warning');
    }
}

// Показать индекс
function showIndex() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('index-screen').classList.remove('hidden');
    updateIndexDisplay();
}

// Обновление отображения индекса
function updateIndexDisplay() {
    const indexContainer = document.getElementById('index-container');
    if (!indexContainer) return;
    
    indexContainer.innerHTML = '';
    
    Object.entries(gameState.index).forEach(([key, monster]) => {
        const item = document.createElement('div');
        item.className = 'index-item';
        item.innerHTML = `
            <h3>${monster.name} ${monster.met ? '✓' : '?'}</h3>
            <p>${monster.description}</p>
        `;
        indexContainer.appendChild(item);
    });
}

// Обновление статистики
function updateStats() {
    const roomsVisited = document.getElementById('rooms-visited');
    const livesCount = document.getElementById('lives-count');
    const monstersMet = document.getElementById('monsters-met');
    const roomTitle = document.getElementById('room-title');
    const progress = document.getElementById('progress');
    
    if (roomsVisited) roomsVisited.textContent = gameState.roomsCompleted;
    if (livesCount) livesCount.textContent = gameState.lives;
    if (monstersMet) monstersMet.textContent = gameState.monstersMet;
    if (roomTitle) roomTitle.textContent = `Комната ${gameState.currentRoom}`;
    if (progress) progress.textContent = `${gameState.roomsCompleted}/${gameState.roomsToWin}`;
}

// Вспомогательная функция для перемешивания массива
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Добавляем CSS
const style = document.createElement('style');
style.textContent = `
    .temporal-warning {
        background-color: #330000 !important;
        animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
        0% { background-color: #330000; }
        50% { background-color: #660000; }
        100% { background-color: #330000; }
    }
    
    .hidden {
        display: none !important;
    }
    
    .key {
        background-color: #FFD700 !important;
        color: #000 !important;
        margin-bottom: 20px;
    }
    
    .key:hover {
        background-color: #FFC400 !important;
    }
    
    .key:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .index-item {
        background: #2c3e50;
        margin: 10px 0;
        padding: 15px;
        border-radius: 5px;
        text-align: left;
    }
    
    .index-item h3 {
        color: #e74c3c;
        margin-bottom: 10px;
    }
`;
document.head.appendChild(style);
