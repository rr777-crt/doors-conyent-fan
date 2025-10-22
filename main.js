// Глобальное состояние игры
const gameState = {
    currentRoom: 1,
    hasKey: false,
    monstersMet: 0,
    temporalActive: false,
    temporalTimer: null,
    gameActive: false,
    index: {
        temporal: { 
            name: "Временной", 
            description: "Появляется при открытии двери с 15% шансом. Убивает через 5 секунд, но вы в безопасности, если откроете другую дверь.", 
            met: false 
        },
        redCreature: { 
            name: "Красная тварь", 
            description: "Появляется каждые 10-15 секунд с шансом 10-15%. Требует нажать кнопку в течение 1.5 секунд.", 
            met: false 
        },
        greenCreature: { 
            name: "Зеленая тварь", 
            description: "Появляется каждые 10-15 секунд с шансом 10-15%. Нельзя нажимать кнопку в течение 1.5 секунд.", 
            met: false 
        },
        eyePerformer: { 
            name: "Совершитель глаз", 
            description: "Появляется при открытии двери с 20% шансом (максимум 2 раза за игру). Требует выполнения меняющихся требований.", 
            met: false,
            count: 0
        },
        darkness: { 
            name: "Тьма", 
            description: "В тёмной комнате не работает фонарик. Появляется при открытии двери с 35% шансом.", 
            met: false 
        },
        bright: { 
            name: "ЯРКИЙ", 
            description: "Появляется при открытии двери с 10% шансом. Ослепляет экран на 10 секунд. Нужно нажать 20 раз чтобы победить.", 
            met: false 
        }
    }
};

// Определения комнат
const roomDefinitions = {
    1: {
        title: "Комната 1",
        content: `
            <div class="room-section">
                <button class="key" onclick="takeKey()">🔑 Взять ключ</button>
            </div>
            <div class="room-section">
                <div class="door" onclick="openDoor(2)">
                    Дверь
                    <div class="door-knob"></div>
                </div>
            </div>
        `
    },
    2: {
        title: "Комната 2",
        content: `
            <div class="room-section">
                <div class="door" onclick="openDoor(3)">
                    Дверь
                    <div class="door-knob"></div>
                </div>
            </div>
        `
    },
    3: {
        title: "Комната 3",
        content: `
            <div class="long-room">
                <div class="room-section">
                    <p>Длинный коридор...</p>
                </div>
                <div class="room-section">
                    <div class="door" onclick="openDoor(4)">
                        Дверь
                        <div class="door-knob"></div>
                    </div>
                </div>
            </div>
        `
    },
    4: {
        title: "Комната 4",
        content: `
            <div class="room-section">
                <p>Выберите правильную дверь</p>
            </div>
            <div class="two-doors">
                <div class="door wrong-door" onclick="showMessage('Неправильная дверь!', 'error')">
                    Ловушка
                    <div class="door-knob"></div>
                </div>
                <div class="door" onclick="openDoor(5)">
                    Дверь
                    <div class="door-knob"></div>
                </div>
            </div>
        `
    },
    5: {
        title: "Комната 5",
        content: `
            <div class="long-room">
                <div class="room-section">
                    <button class="key" onclick="takeKey()">🔑 Взять ключ</button>
                </div>
                <div class="room-section">
                    <div class="door" onclick="openDoor(6)">
                        Дверь
                        <div class="door-knob"></div>
                    </div>
                </div>
            </div>
        `
    },
    6: {
        title: "Комната 6",
        content: `
            <div class="room-section">
                <p>Найдите спрятанный ключ</p>
            </div>
            <div class="room-section">
                <div class="key hidden-object" onclick="takeKey()" style="opacity: 0.3;">🔑</div>
                <div class="door" onclick="checkDoor(7)">
                    Дверь
                    <div class="door-knob"></div>
                </div>
            </div>
        `
    },
    7: {
        title: "Комната 7",
        content: `
            <div class="room-section">
                <p>Только одна дверь правильная</p>
            </div>
            <div class="two-doors">
                <div class="door wrong-door" onclick="showMessage('Ловушка!', 'error')">
                    Дверь 1
                    <div class="door-knob"></div>
                </div>
                <div class="door" onclick="openDoor(8)">
                    Дверь 2
                    <div class="door-knob"></div>
                </div>
                <div class="door wrong-door" onclick="showMessage('Ловушка!', 'error')">
                    Дверь 3
                    <div class="door-knob"></div>
                </div>
            </div>
        `
    },
    8: {
        title: "Комната 8",
        content: `
            <div class="long-room" style="min-height: 700px;">
                <div class="room-section">
                    <p>Очень длинный коридор...</p>
                </div>
                <div class="room-section">
                    <p>Идём дальше...</p>
                </div>
                <div class="room-section">
                    <div class="door" onclick="openDoor(9)">
                        Дверь
                        <div class="door-knob"></div>
                    </div>
                </div>
            </div>
        `
    },
    9: {
        title: "Комната 9",
        content: `
            <div class="room-section">
                <p>Комната для отдыха</p>
            </div>
            <div class="room-section">
                <div class="door" onclick="openDoor(10)">
                    Дверь
                    <div class="door-knob"></div>
                </div>
            </div>
        `
    },
    10: {
        title: "Комната 10",
        content: `
            <div class="room-section">
                <button class="key" onclick="takeKey()">🔑 Взять ключ</button>
            </div>
            <div class="room-section">
                <div class="door small-door" onclick="openDoor(11)">
                    Маленькая дверь
                    <div class="door-knob"></div>
                </div>
            </div>
        `
    },
    11: {
        title: "Комната 11",
        content: `
            <div class="room-section">
                <p>Зажмите камень чтобы отодвинуть</p>
            </div>
            <div class="room-section">
                <div class="stone" onmousedown="moveStone(this)" ontouchstart="moveStone(this)">
                    Камень
                </div>
            </div>
            <div class="room-section">
                <div class="door" onclick="openDoor(12)" style="display: none;" id="hidden-door">
                    Дверь
                    <div class="door-knob"></div>
                </div>
            </div>
        `
    },
    12: {
        title: "Комната 12",
        content: `
            <div class="room-section">
                <p>Найдите 2 правильные двери из 10</p>
            </div>
            <div class="many-doors">
                ${Array.from({length: 10}, (_, i) => `
                    <div class="door ${i < 8 ? 'wrong-door' : ''}" onclick="${i < 8 ? 'showMessage(\"Ловушка!\", \"error\")' : 'openDoor(' + (13 + i - 8) + ')'}">
                        Дверь ${i + 1}
                        <div class="door-knob"></div>
                    </div>
                `).join('')}
            </div>
        `
    },
    13: {
        title: "Комната 13",
        content: `
            <div class="room-section">
                <button class="key" onclick="takeKey()">🔑 Взять ключ</button>
            </div>
            <div class="room-section">
                <div class="stone" onmousedown="moveStone(this)" ontouchstart="moveStone(this)">
                    Камень
                </div>
            </div>
            <div class="room-section">
                <div class="door" onclick="openDoor(14)" style="display: none;" id="hidden-door">
                    Дверь
                    <div class="door-knob"></div>
                </div>
            </div>
        `
    },
    14: {
        title: "Комната 14",
        content: `
            <div class="long-room" style="min-height: 800px;">
                <div class="room-section">
                    <p>Очень длинный коридор с камнем...</p>
                </div>
                <div class="room-section">
                    <div class="stone" onmousedown="moveStone(this)" ontouchstart="moveStone(this)">
                        Камень
                    </div>
                </div>
                <div class="room-section">
                    <div class="door" onclick="openDoor(15)" style="display: none;" id="hidden-door">
                        Дверь
                        <div class="door-knob"></div>
                    </div>
                </div>
            </div>
        `
    },
    15: {
        title: "Комната 15",
        content: `
            <div class="room-section">
                <p>Туалет</p>
            </div>
            <div class="room-section">
                <div class="toilet"></div>
            </div>
            <div class="room-section">
                <div class="door" onclick="openDoor(1)">
                    Дверь
                    <div class="door-knob"></div>
                </div>
            </div>
        `
    }
};

// Инициализация игры
document.addEventListener('DOMContentLoaded', function() {
    loadGameState();
    
    // Кнопки меню
    document.querySelector('.play-game').addEventListener('click', startGame);
    document.querySelector('.index-see').addEventListener('click', showIndex);
    
    // Кнопки навигации
    document.getElementById('back-btn').addEventListener('click', returnToMenu);
    document.getElementById('index-back-btn').addEventListener('click', returnToMenu);
});

// Загрузка сохраненного состояния
function loadGameState() {
    const savedState = localStorage.getItem('roomGameIndex');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        gameState.index = { ...gameState.index, ...parsed };
    }
}

// Сохранение состояния
function saveGameState() {
    localStorage.setItem('roomGameIndex', JSON.stringify(gameState.index));
}

// Начало игры
function startGame() {
    gameState.currentRoom = 1;
    gameState.hasKey = false;
    gameState.monstersMet = 0;
    gameState.temporalActive = false;
    gameState.gameActive = true;

    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('index-screen').style.display = 'none';
    
    loadRoom(1);
}

// Загрузка комнаты
function loadRoom(roomNumber) {
    gameState.currentRoom = roomNumber;
    
    const room = roomDefinitions[roomNumber];
    if (room) {
        document.getElementById('room-title').textContent = room.title;
        document.getElementById('room-content').innerHTML = room.content;
        updateKeyStatus();
        updateMonstersCount();
    }
}

// Взять ключ
function takeKey() {
    gameState.hasKey = true;
    updateKeyStatus();
    showMessage('Ключ получен!', 'success');
}

// Обновить статус ключа
function updateKeyStatus() {
    document.getElementById('key-status').textContent = gameState.hasKey ? '✅' : '❌';
}

// Обновить счетчик монстров
function updateMonstersCount() {
    document.getElementById('monsters-count').textContent = gameState.monstersMet;
}

// Открыть дверь
function openDoor(nextRoom) {
    if (!gameState.gameActive) return;
    
    if (!gameState.hasKey && gameState.currentRoom !== 1) {
        showMessage('Сначала найдите ключ!', 'warning');
        return;
    }

    // Проверка на временного (15% шанс)
    if (Math.random() < 0.15 && !gameState.temporalActive) {
        spawnTemporal(nextRoom);
        gameState.index.temporal.met = true;
        saveGameState();
    } else {
        proceedToRoom(nextRoom);
    }
}

// Проверить дверь (для комнат где ключ обязателен)
function checkDoor(nextRoom) {
    if (!gameState.hasKey) {
        showMessage('Сначала найдите ключ!', 'warning');
        return;
    }
    openDoor(nextRoom);
}

// Появление временного
function spawnTemporal(nextRoom) {
    gameState.temporalActive = true;
    gameState.monstersMet++;
    
    document.getElementById('temporal-warning').style.display = 'flex';
    updateMonstersCount();
    
    showMessage('Появился ВРЕМЕННОЙ! Откройте дверь чтобы спастись!', 'error');

    // Таймер смерти через 5 секунд
    gameState.temporalTimer = setTimeout(() => {
        if (gameState.temporalActive) {
            gameOver();
        }
    }, 5000);

    // Сохраняем следующую комнату для перехода
    const temporalWarning = document.getElementById('temporal-warning');
    temporalWarning.onclick = () => {
        if (gameState.temporalActive) {
            clearTimeout(gameState.temporalTimer);
            gameState.temporalActive = false;
            temporalWarning.style.display = 'none';
            proceedToRoom(nextRoom);
        }
    };
}

// Переход в комнату
function proceedToRoom(nextRoom) {
    gameState.hasKey = false;
    updateKeyStatus();
    loadRoom(nextRoom);
}

// Движение камня
function moveStone(stone) {
    stone.style.transform = 'translateX(100px)';
    stone.style.background = 'linear-gradient(135deg, #6d4c41, #5d4037)';
    stone.textContent = 'Отодвинут';
    stone.style.cursor = 'default';
    stone.onmousedown = null;
    stone.ontouchstart = null;
    
    setTimeout(() => {
        const hiddenDoor = document.getElementById('hidden-door');
        if (hiddenDoor) {
            hiddenDoor.style.display = 'flex';
            showMessage('Камень отодвинут! Появилась дверь.', 'success');
        }
    }, 1000);
}

// Конец игры
function gameOver() {
    gameState.gameActive = false;
    showMessage('ВРЕМЕННОЙ поймал вас! Игра окончена.', 'error');
    setTimeout(() => {
        returnToMenu();
    }, 3000);
}

// Вернуться в меню
function returnToMenu() {
    document.getElementById('main-menu').style.display = 'block';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('index-screen').style.display = 'none';
    
    if (gameState.temporalActive) {
        clearTimeout(gameState.temporalTimer);
        gameState.temporalActive = false;
        document.getElementById('temporal-warning').style.display = 'none';
    }
}

// Показать индекс
function showIndex() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('index-screen').style.display = 'block';
    
    updateIndexDisplay();
}

// Обновление отображения индекса
function updateIndexDisplay() {
    const indexContainer = document.getElementById('index-container');
    indexContainer.innerHTML = '';
    
    Object.entries(gameState.index).forEach(([key, monster]) => {
        const item = document.createElement('div');
        item.className = `index-item ${monster.met ? 'unlocked' : ''}`;
        item.innerHTML = `
            <h3>${monster.name}</h3>
            <p>${monster.description}</p>
        `;
        indexContainer.appendChild(item);
    });
}

// Показать сообщение
function showMessage(text, type) {
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}
