// Глобальное состояние игры
const gameState = {
    currentRoom: 1,
    hasKey: false,
    temporalActive: false,
    temporalTimer: null,
    gameActive: false,
    monsterActive: false, // Флаг что монстр активен
    index: {
        temporal: { name: "Временной", description: "Появляется при открытии двери с 15% шансом. Убивает через 5 секунд.", met: false },
        redCreature: { name: "Красная тварь", description: "Появляется каждые 10-15 секунд. Требует нажать кнопку за 1.5 секунды.", met: false },
        greenCreature: { name: "Зеленая тварь", description: "Появляется каждые 10-15 секунд. Нельзя нажимать кнопку 1.5 секунды.", met: false },
        eyePerformer: { name: "Совершитель глаз", description: "Появляется при открытии двери с 20% шансом (макс 2 раза). Требует выполнения команд.", met: false },
        bright: { name: "ЯРКИЙ", description: "Появляется при открытии двери с 10% шансом. Нужно нажать 20 раз на шар.", met: false },
        darkness: { name: "Тьма", description: "Появляется при открытии двери с 35% шансом. Комната становится темной.", met: false }
    },
    monsters: {
        temporal: { chance: 0.15, active: false },
        redCreature: { chance: 0.12, active: false, timer: null },
        greenCreature: { chance: 0.12, active: false, timer: null },
        eyePerformer: { chance: 0.20, active: false, count: 0, maxCount: 2 },
        bright: { chance: 0.10, active: false, clicks: 0, needed: 20 },
        darkness: { chance: 0.35, active: false }
    }
};

// Генерация комнат с номерами 001-100
const roomDefinitions = {};

for (let i = 1; i <= 100; i++) {
    const roomNumber = i.toString().padStart(3, '0');
    let content = '';
    let needsKey = i !== 1;

    if (i === 1) {
        content = `
            <div class="room-section">
                <button class="key" onclick="takeKey()">🔑 Взять ключ</button>
            </div>
            <div class="room-section">
                <div class="door" onclick="openDoor(2)">
                    ${roomNumber}
                    <div class="door-knob"></div>
                </div>
            </div>
        `;
    } else if (i % 4 === 0) {
        const correctDoor = Math.floor(Math.random() * 3) + 1;
        content = `
            <div class="room-text">Выбери правильную дверь</div>
            <div class="two-doors">
                ${[1, 2, 3].map(num => `
                    <div class="door ${num === correctDoor ? '' : 'wrong-door'}" 
                         onclick="${num === correctDoor ? `openDoor(${i + 1})` : `showMessage('Ловушка!', 'error')`}">
                        ${roomNumber}-${num}
                        <div class="door-knob"></div>
                    </div>
                `).join('')}
            </div>
        `;
        needsKey = Math.random() > 0.5;
    } else if (i % 7 === 0) {
        content = `
            <div class="long-room">
                <div class="room-text">Длинный коридор... ${roomNumber}</div>
                <div style="height: 800px;"></div>
                <div class="room-section">
                    <div class="door" onclick="openDoor(${i + 1})">
                        ${roomNumber}
                        <div class="door-knob"></div>
                    </div>
                </div>
            </div>
        `;
        needsKey = Math.random() > 0.3;
    } else if (i % 10 === 0) {
        const correctDoors = [Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 6];
        content = `
            <div class="room-text">Найди 2 правильные двери</div>
            <div class="many-doors">
                ${Array.from({length: 10}, (_, idx) => {
                    const doorNum = idx + 1;
                    const isCorrect = correctDoors.includes(doorNum);
                    return `
                        <div class="door ${isCorrect ? '' : 'wrong-door'}" 
                             onclick="${isCorrect ? `openDoor(${i + 1})` : `showMessage('Ловушка!', 'error')`}">
                            ${roomNumber}-${doorNum.toString().padStart(2, '0')}
                            <div class="door-knob"></div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        needsKey = true;
    } else {
        content = `
            <div class="room-section">
                <div class="door" onclick="openDoor(${i + 1})">
                    ${roomNumber}
                    <div class="door-knob"></div>
                </div>
            </div>
        `;
        needsKey = Math.random() > 0.7;
    }
    
    if (needsKey && i !== 1) {
        const keyX = Math.random() * 80 + 10;
        const keyY = Math.random() * 80 + 10;
        content = `
            <button class="key" onclick="takeKey()" style="left: ${keyX}%; top: ${keyY}%;">🔑</button>
            ${content}
        `;
    }
    
    roomDefinitions[i] = {
        title: `Комната ${roomNumber}`,
        content: content,
        needsKey: needsKey
    };
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.play-game').addEventListener('click', startGame);
    document.querySelector('.index-see').addEventListener('click', showIndex);
    document.getElementById('index-back-btn').addEventListener('click', returnToMenu);
});

function startGame() {
    gameState.currentRoom = 1;
    gameState.hasKey = false;
    gameState.gameActive = true;
    gameState.monsterActive = false;
    
    Object.values(gameState.monsters).forEach(monster => {
        monster.active = false;
        if (monster.timer) clearTimeout(monster.timer);
    });

    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('index-screen').style.display = 'none';
    
    loadRoom(1);
    startMonsterTimers();
}

function loadRoom(roomNumber) {
    if (roomNumber > 100) roomNumber = 1;
    
    gameState.currentRoom = roomNumber;
    
    const room = roomDefinitions[roomNumber];
    if (room) {
        document.getElementById('room-title').textContent = room.title;
        document.getElementById('room-content').innerHTML = room.content;
        
        if (Math.random() < gameState.monsters.darkness.chance) {
            document.body.style.background = '#000000';
            gameState.index.darkness.met = true;
            setTimeout(() => {
                if (gameState.gameActive) document.body.style.background = '#0a0a0a';
            }, 5000);
        }
    }
}

function takeKey() {
    gameState.hasKey = true;
    showMessage('Ключ получен!', 'success');
}

function openDoor(nextRoom) {
    if (!gameState.gameActive || gameState.monsterActive) return;
    
    const currentRoom = roomDefinitions[gameState.currentRoom];
    if (currentRoom.needsKey && !gameState.hasKey) {
        showMessage('Нужен ключ!', 'warning');
        return;
    }

    checkDoorMonsters(nextRoom);
}

function checkDoorMonsters(nextRoom) {
    const monsters = gameState.monsters;
    
    if (Math.random() < monsters.temporal.chance && !monsters.temporal.active) {
        spawnTemporal(nextRoom);
        return;
    }
    
    if (Math.random() < monsters.eyePerformer.chance && !monsters.eyePerformer.active && 
        monsters.eyePerformer.count < monsters.eyePerformer.maxCount) {
        spawnEyePerformer(nextRoom);
        return;
    }
    
    if (Math.random() < monsters.bright.chance && !monsters.bright.active) {
        spawnBright(nextRoom);
        return;
    }
    
    proceedToRoom(nextRoom);
}

function spawnTemporal(nextRoom) {
    const monster = gameState.monsters.temporal;
    monster.active = true;
    gameState.monsterActive = true;
    gameState.index.temporal.met = true;
    
    document.getElementById('temporal-warning').style.display = 'flex';
    showMessage('ВРЕМЕННОЙ! Беги!', 'error');

    monster.timer = setTimeout(() => {
        if (monster.active) gameOver();
    }, 5000);

    const temporalWarning = document.getElementById('temporal-warning');
    temporalWarning.onclick = () => {
        if (monster.active) {
            clearTimeout(monster.timer);
            monster.active = false;
            gameState.monsterActive = false;
            temporalWarning.style.display = 'none';
            temporalWarning.onclick = null;
            proceedToRoom(nextRoom);
        }
    };
}

function spawnEyePerformer(nextRoom) {
    const monster = gameState.monsters.eyePerformer;
    monster.active = true;
    gameState.monsterActive = true;
    monster.count++;
    gameState.index.eyePerformer.met = true;
    
    let progress = 50;
    let requirement = 'ПОДГОТОВКА...';
    let lastAction = 'press';
    let preparationTime = 2.0;
    
    document.getElementById('eye-performer-overlay').style.display = 'flex';
    document.getElementById('eye-progress').style.width = progress + '%';
    document.getElementById('eye-requirement').textContent = requirement;
    document.getElementById('eye-timer').textContent = preparationTime.toFixed(1);
    
    // Подготовка 2 секунды
    const preparationTimer = setInterval(() => {
        if (!monster.active) {
            clearInterval(preparationTimer);
            return;
        }
        
        preparationTime -= 0.1;
        document.getElementById('eye-timer').textContent = preparationTime.toFixed(1);
        
        if (preparationTime <= 0) {
            clearInterval(preparationTimer);
            startEyePerformerGame(nextRoom, monster);
        }
    }, 100);
    
    function startEyePerformerGame(nextRoom, monster) {
        document.getElementById('eye-timer').style.display = 'none';
        
        const requirementTimer = setInterval(() => {
            if (!monster.active) {
                clearInterval(requirementTimer);
                return;
            }
            
            lastAction = Math.random() > 0.5 ? 'press' : 'dont';
            requirement = lastAction === 'press' ? 'НАЖМИ!' : 'НЕ НАЖИМАЙ!';
            document.getElementById('eye-requirement').textContent = requirement;
        }, 1000);
        
        const gameTimer = setInterval(() => {
            if (!monster.active) {
                clearInterval(gameTimer);
                clearInterval(requirementTimer);
                return;
            }
            
            progress -= 2; // -10% каждые 0.5 сек
            document.getElementById('eye-progress').style.width = progress + '%';
            
            if (progress <= 0) {
                clearInterval(gameTimer);
                clearInterval(requirementTimer);
                gameOver();
            } else if (progress >= 100) {
                clearInterval(gameTimer);
                clearInterval(requirementTimer);
                monster.active = false;
                gameState.monsterActive = false;
                document.getElementById('eye-performer-overlay').style.display = 'none';
                proceedToRoom(nextRoom);
            }
        }, 500);
        
        const requirementElement = document.getElementById('eye-requirement');
        requirementElement.onclick = function() {
            if (lastAction === 'press') {
                progress += 20;
                showMessage('+20%!', 'success');
            } else {
                progress -= 10;
                showMessage('-10%! Ошибка!', 'error');
            }
            progress = Math.max(0, Math.min(100, progress));
            document.getElementById('eye-progress').style.width = progress + '%';
        };
    }
}

function spawnBright(nextRoom) {
    const monster = gameState.monsters.bright;
    monster.active = true;
    gameState.monsterActive = true;
    monster.clicks = 0;
    gameState.index.bright.met = true;
    
    document.getElementById('bright-overlay').style.display = 'flex';
    document.getElementById('bright-counter').textContent = '0/20';
    
    const brightTimer = setTimeout(() => {
        if (monster.active) gameOver();
    }, 10000);
    
    window.defeatBright = function() {
        clearTimeout(brightTimer);
        monster.active = false;
        gameState.monsterActive = false;
        document.getElementById('bright-overlay').style.display = 'none';
        proceedToRoom(nextRoom);
    };
}

function clickBright() {
    const monster = gameState.monsters.bright;
    monster.clicks++;
    document.getElementById('bright-counter').textContent = monster.clicks + '/20';
    
    // Анимация при нажатии
    const ball = document.getElementById('bright-ball');
    ball.style.transform = 'scale(0.8)';
    setTimeout(() => ball.style.transform = 'scale(1)', 100);
    
    if (monster.clicks >= monster.needed) {
        defeatBright();
    }
}

function startMonsterTimers() {
    setInterval(() => {
        if (!gameState.gameActive || gameState.monsterActive) return;
        
        const monsters = gameState.monsters;
        
        if (Math.random() < monsters.redCreature.chance && !monsters.redCreature.active) {
            spawnRedCreature();
        } else if (Math.random() < monsters.greenCreature.chance && !monsters.greenCreature.active) {
            spawnGreenCreature();
        }
    }, 10000 + Math.random() * 5000);
}

function spawnRedCreature() {
    const monster = gameState.monsters.redCreature;
    monster.active = true;
    gameState.monsterActive = true;
    gameState.index.redCreature.met = true;
    
    let timeLeft = 1.5;
    document.getElementById('red-creature-overlay').style.display = 'flex';
    document.getElementById('red-timer').textContent = timeLeft.toFixed(1);
    
    const timer = setInterval(() => {
        if (!monster.active) {
            clearInterval(timer);
            return;
        }
        
        timeLeft -= 0.1;
        document.getElementById('red-timer').textContent = timeLeft.toFixed(1);
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            gameOver();
        }
    }, 100);
    
    monster.timer = timer;
}

function defeatRedCreature() {
    const monster = gameState.monsters.redCreature;
    monster.active = false;
    gameState.monsterActive = false;
    clearInterval(monster.timer);
    document.getElementById('red-creature-overlay').style.display = 'none';
    showMessage('Красная тварь побеждена!', 'success');
}

function spawnGreenCreature() {
    const monster = gameState.monsters.greenCreature;
    monster.active = true;
    gameState.monsterActive = true;
    gameState.index.greenCreature.met = true;
    
    let timeLeft = 1.5;
    document.getElementById('green-creature-overlay').style.display = 'flex';
    document.getElementById('green-timer').textContent = timeLeft.toFixed(1);
    
    // Делаем кнопку неактивной
    const greenButton = document.getElementById('green-button');
    greenButton.onclick = failGreenCreature;
    
    const timer = setInterval(() => {
        if (!monster.active) {
            clearInterval(timer);
            return;
        }
        
        timeLeft -= 0.1;
        document.getElementById('green-timer').textContent = timeLeft.toFixed(1);
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            monster.active = false;
            gameState.monsterActive = false;
            document.getElementById('green-creature-overlay').style.display = 'none';
            showMessage('Зеленая тварь ушла!', 'success');
        }
    }, 100);
    
    monster.timer = timer;
}

function failGreenCreature() {
    gameOver();
}

function proceedToRoom(nextRoom) {
    gameState.hasKey = false;
    loadRoom(nextRoom);
}

function gameOver() {
    gameState.gameActive = false;
    gameState.monsterActive = false;
    showMessage('Ты умер!', 'error');
    
    // Скрываем всех монстров
    document.getElementById('temporal-warning').style.display = 'none';
    document.getElementById('red-creature-overlay').style.display = 'none';
    document.getElementById('green-creature-overlay').style.display = 'none';
    document.getElementById('eye-performer-overlay').style.display = 'none';
    document.getElementById('bright-overlay').style.display = 'none';
    
    // Сброс таймеров
    Object.values(gameState.monsters).forEach(monster => {
        monster.active = false;
        if (monster.timer) {
            clearTimeout(monster.timer);
            clearInterval(monster.timer);
        }
    });
    
    setTimeout(() => {
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('main-menu').style.display = 'block';
        document.body.style.background = '#0a0a0a';
    }, 3000);
}

function showIndex() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('index-screen').style.display = 'block';
    updateIndexDisplay();
}

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

function showMessage(text, type) {
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) messageDiv.remove();
    }, 3000);
}
