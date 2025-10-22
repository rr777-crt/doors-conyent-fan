// Глобальное состояние игры
const gameState = {
    currentRoom: 1,
    hasKey: false,
    temporalActive: false,
    temporalTimer: null,
    gameActive: false,
    index: {
        temporal: { 
            name: "Временной", 
            description: "Появляется при открытии двери с 15% шансом. Убивает через 5 секунд.", 
            met: false 
        }
    }
};

// Определения комнат (только комната и ключ где нужно)
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
        `,
        needsKey: true
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
        `,
        needsKey: false
    },
    3: {
        title: "Комната 3",
        content: `
            <div class="long-room">
                <div class="room-text">Длинный коридор...</div>
                <div class="room-section">
                    <div class="door" onclick="openDoor(4)">
                        Дверь
                        <div class="door-knob"></div>
                    </div>
                </div>
            </div>
        `,
        needsKey: false
    },
    4: {
        title: "Комната 4",
        content: `
            <div class="room-text">Выберите правильную дверь</div>
            <div class="two-doors">
                <div class="door wrong-door" onclick="showMessage('Ловушка!', 'error')">
                    Ловушка
                    <div class="door-knob"></div>
                </div>
                <div class="door" onclick="openDoor(5)">
                    Дверь
                    <div class="door-knob"></div>
                </div>
            </div>
        `,
        needsKey: false
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
        `,
        needsKey: true
    },
    6: {
        title: "Комната 6",
        content: `
            <div class="room-text">Найдите спрятанный ключ</div>
            <div class="room-section">
                <div class="key hidden-object" onclick="takeKey()" style="opacity: 0.3;">🔑</div>
                <div class="door" onclick="openDoor(7)">
                    Дверь
                    <div class="door-knob"></div>
                </div>
            </div>
        `,
        needsKey: true
    },
    7: {
        title: "Комната 7",
        content: `
            <div class="room-text">Только одна дверь правильная</div>
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
        `,
        needsKey: false
    },
    8: {
        title: "Комната 8",
        content: `
            <div class="long-room">
                <div class="room-text">Очень длинный коридор...</div>
                <div class="room-text">Идём дальше...</div>
                <div class="room-section">
                    <div class="door" onclick="openDoor(9)">
                        Дверь
                        <div class="door-knob"></div>
                    </div>
                </div>
            </div>
        `,
        needsKey: false
    },
    9: {
        title: "Комната 9",
        content: `
            <div class="room-text">Комната для отдыха</div>
            <div class="room-section">
                <div class="door" onclick="openDoor(10)">
                    Дверь
                    <div class="door-knob"></div>
                </div>
            </div>
        `,
        needsKey: false
    },
    10: {
        title: "Комната 10",
        content: `
            <div class="room-section">
                <button class="key" onclick="takeKey()">🔑 Взять ключ</button>
            </div>
            <div class="room-section">
                <div class="door small-door" onclick="openDoor(11)">
                    Дверь
                    <div class="door-knob"></div>
                </div>
            </div>
        `,
        needsKey: true
    },
    11: {
        title: "Комната 11",
        content: `
            <div class="room-text">Зажмите камень чтобы отодвинуть</div>
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
        `,
        needsKey: false
    },
    12: {
        title: "Комната 12",
        content: `
            <div class="room-text">Найдите 2 правильные двери из 10</div>
            <div class="many-doors">
                <div class="door wrong-door" onclick="showMessage('Ловушка!', 'error')">1<div class="door-knob"></div></div>
                <div class="door wrong-door" onclick="showMessage('Ловушка!', 'error')">2<div class="door-knob"></div></div>
                <div class="door wrong-door" onclick="showMessage('Ловушка!', 'error')">3<div class="door-knob"></div></div>
                <div class="door wrong-door" onclick="showMessage('Ловушка!', 'error')">4<div class="door-knob"></div></div>
                <div class="door wrong-door" onclick="showMessage('Ловушка!', 'error')">5<div class="door-knob"></div></div>
                <div class="door wrong-door" onclick="showMessage('Ловушка!', 'error')">6<div class="door-knob"></div></div>
                <div class="door wrong-door" onclick="showMessage('Ловушка!', 'error')">7<div class="door-knob"></div></div>
                <div class="door wrong-door" onclick="showMessage('Ловушка!', 'error')">8<div class="door-knob"></div></div>
                <div class="door" onclick="openDoor(13)">9<div class="door-knob"></div></div>
                <div class="door" onclick="openDoor(14)">10<div class="door-knob"></div></div>
            </div>
        `,
        needsKey: false
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
        `,
        needsKey: true
    },
    14: {
        title: "Комната 14",
        content: `
            <div class="long-room">
                <div class="room-text">Длинный коридор с камнем...</div>
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
        `,
        needsKey: false
    },
    15: {
        title: "Комната 15",
        content: `
            <div class="room-text">Туалет</div>
            <div class="room-section">
                <div class="toilet"></div>
            </div>
            <div class="room-section">
                <div class="door" onclick="openDoor(1)">
                    Дверь
                    <div class="door-knob"></div>
                </div>
            </div>
        `,
        needsKey: false
    }
};

// Инициализация игры
document.addEventListener('DOMContentLoaded', function() {
    loadGameState();
    
    document.querySelector('.play-game').addEventListener('click', startGame);
    document.querySelector('.index-see').addEventListener('click', showIndex);
    document.getElementById('back-btn').addEventListener('click', returnToMenu);
    document.getElementById('index-back-btn').addEventListener('click', returnToMenu);
});

function loadGameState() {
    const savedState = localStorage.getItem('doorsOffIndex');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        gameState.index = { ...gameState.index, ...parsed };
    }
}

function saveGameState() {
    localStorage.setItem('doorsOffIndex', JSON.stringify(gameState.index));
}

function startGame() {
    gameState.currentRoom = 1;
    gameState.hasKey = false;
    gameState.temporalActive = false;
    gameState.gameActive = true;

    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('index-screen').style.display = 'none';
    
    loadRoom(1);
}

function loadRoom(roomNumber) {
    if (roomNumber < 1 || roomNumber > 15) roomNumber = 1;
    
    gameState.currentRoom = roomNumber;
    
    const room = roomDefinitions[roomNumber];
    if (room) {
        document.getElementById('room-title').textContent = room.title;
        document.getElementById('room-content').innerHTML = room.content;
    }
}

function takeKey() {
    gameState.hasKey = true;
    showMessage('Ключ получен!', 'success');
}

function openDoor(nextRoom) {
    if (!gameState.gameActive) return;
    
    const currentRoom = roomDefinitions[gameState.currentRoom];
    if (currentRoom.needsKey && !gameState.hasKey) {
        showMessage('Нужен ключ!', 'warning');
        return;
    }

    if (Math.random() < 0.15 && !gameState.temporalActive) {
        spawnTemporal(nextRoom);
        gameState.index.temporal.met = true;
        saveGameState();
    } else {
        proceedToRoom(nextRoom);
    }
}

function spawnTemporal(nextRoom) {
    gameState.temporalActive = true;
    
    document.getElementById('temporal-warning').style.display = 'flex';
    showMessage('ВРЕМЕННОЙ! Беги!', 'error');

    gameState.temporalTimer = setTimeout(() => {
        if (gameState.temporalActive) gameOver();
    }, 5000);

    const temporalWarning = document.getElementById('temporal-warning');
    temporalWarning.onclick = () => {
        if (gameState.temporalActive) {
            clearTimeout(gameState.temporalTimer);
            gameState.temporalActive = false;
            temporalWarning.style.display = 'none';
            temporalWarning.onclick = null;
            proceedToRoom(nextRoom);
        }
    };
}

function proceedToRoom(nextRoom) {
    gameState.hasKey = false;
    loadRoom(nextRoom);
}

function moveStone(stone) {
    stone.style.transform = 'translateX(80px)';
    stone.style.background = '#6d4c41';
    stone.textContent = '✓';
    stone.style.cursor = 'default';
    stone.onmousedown = null;
    stone.ontouchstart = null;
    
    setTimeout(() => {
        const hiddenDoor = document.getElementById('hidden-door');
        if (hiddenDoor) {
            hiddenDoor.style.display = 'flex';
            showMessage('Дверь открыта!', 'success');
        }
    }, 800);
}

function gameOver() {
    gameState.gameActive = false;
    showMessage('ВРЕМЕННОЙ поймал вас!', 'error');
    setTimeout(returnToMenu, 3000);
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
