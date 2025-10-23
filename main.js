// Глобальное состояние игры
const gameState = {
    currentRoom: 1,
    hasKey: false,
    temporalActive: false,
    temporalTimer: null,
    gameActive: false,
    monsterActive: false,
    seekCooldown: 0,
    isHiding: false,
    currentCloset: null,
    
    achievements: {
        welcome: { name: "Добро пожаловать!", description: "Начать игру", unlocked: false },
        beatRed: { name: "Бить!", description: "Отбить красную тварь", unlocked: false },
        dontBeatGreen: { name: "Она тоже самое?", description: "Не бить зеленую тварь", unlocked: false },
        blind: { name: "ОСЛЕПНУТЬ!", description: "Умереть от ЯРКОГО", unlocked: false },
        tickTock: { name: "Тик-так", description: "Встретить 3 раза подряд временного", unlocked: false },
        youCant: { name: "ТЫ НЕ МОЖЕШЬ", description: "Пройти ВВЕРХ монстра", unlocked: false },
        controller: { name: "Я контролер", description: "Пройти мини-игру с требованиями", unlocked: false },
        memory: { name: "Память", description: "Пройти комнату 050", unlocked: false },
        theEnd: { name: "Это конец", description: "Пройти игру", unlocked: false },
        darkness: { name: "Темно", description: "4 раза подряд тёмная комната", unlocked: false },
        serious: { name: "Это серьёзно?", description: "Попасть на 30 ловушек за одну игру", unlocked: false },
        seekSurvivor: { name: "Выживший", description: "Пережить атаку Поедателя", unlocked: false }
    },
    stats: {
        temporalCount: 0,
        trapCount: 0,
        darkRoomCount: 0,
        consecutiveDark: 0,
        lastTemporalRoom: 0,
        seekAttacks: 0
    },
    index: {
        temporal: { name: "Временной", description: "Появляется при открытии двери с 15% шансом. Убивает через 5 секунд.", met: false },
        redCreature: { name: "Красная тварь", description: "Появляется каждые 10-15 секунд. Требует нажать кнопку за 1.5 секунды.", met: false },
        greenCreature: { name: "Зеленая тварь", description: "Появляется каждые 10-15 секунд. Нельзя нажимать кнопку 1.5 секунды.", met: false },
        eyePerformer: { name: "Совершитель глаз", description: "Появляется при открытии двери с 20% шансом (макс 2 раза). Требует выполнения команд.", met: false },
        bright: { name: "ЯРКИЙ", description: "Появляется при открытии двери с 10% шансом. Нужно нажать 20 раз на шар.", met: false },
        darkness: { name: "Тьма", description: "Появляется при открытии двери с 35% шансом. Комната становится темной.", met: false },
        figure: { name: "ВВЕРХ", description: "Появляется в комнате 030. Нужно пройти 15 дверей за 30 секунд.", met: false },
        guard: { name: "СТРАЖ", description: "Охраняет комнаты 050 и 100. Требует решения головоломок.", met: false },
        seek: { name: "Поедатель", description: "Появляется в комнатах со шкафами с 10% шансом. Нужно спрятаться в шкаф.", met: false }
    },
    monsters: {
        temporal: { chance: 0.15, active: false },
        redCreature: { chance: 0.12, active: false, timer: null },
        greenCreature: { chance: 0.12, active: false, timer: null },
        eyePerformer: { chance: 0.20, active: false, count: 0, maxCount: 2 },
        bright: { chance: 0.10, active: false, clicks: 0, needed: 20 },
        darkness: { chance: 0.35, active: false },
        figure: { active: false, timer: null, doorsPassed: 0, totalDoors: 15, timeLeft: 30 },
        guard50: { active: false, code: "", booksOpened: 0, minigameActive: false },
        guard100: { active: false, keysCollected: 0, keysNeeded: 20, squares: [] },
        seek: { active: false, attackTimer: null, flickerTimer: null }
    }
};

// Генерация комнат
const roomDefinitions = {};

function roomHasClosets(roomNumber) {
    return [3, 4, 6, 8, 11, 13, 14, 15].includes(roomNumber);
}

function generateRoomWithClosets(roomNumber) {
    if (!roomHasClosets(roomNumber)) return '';
    
    const closetCount = Math.floor(Math.random() * 3) + 1;
    let closetHTML = `<div class="closet-container" id="closet-container-${roomNumber}">`;
    
    for (let i = 0; i < closetCount; i++) {
        const left = Math.random() * 80 + 10;
        const top = Math.random() * 60 + 20;
        closetHTML += `
            <div class="closet" onclick="toggleCloset(this)" 
                 style="left: ${left}%; top: ${top}%;">
                Шкаф ${i+1}
            </div>
        `;
    }
    closetHTML += '</div>';
    
    return closetHTML;
}

for (let i = 1; i <= 100; i++) {
    const roomNumber = i.toString().padStart(3, '0');
    let content = '';
    let needsKey = i !== 1;

    const closetHTML = generateRoomWithClosets(i);

    if (i === 1) {
        content = `
            <div class="room-section">
                <button class="key" onclick="takeKey()">🔑 Взять ключ</button>
            </div>
            ${closetHTML}
            <div class="room-section">
                <div class="door" onclick="openDoor(2)">
                    ${roomNumber}
                    <div class="door-knob"></div>
                </div>
            </div>
        `;
    } else if (i === 11) {
        content = `
            <div class="room-text">Зажмите камень чтобы отодвинуть</div>
            ${closetHTML}
            <div class="room-section">
                <div class="stone" onmousedown="moveStone(this)" ontouchstart="moveStone(this)">
                    Камень
                </div>
            </div>
            <div class="room-section">
                <div class="door" onclick="openDoor(12)" style="display: none;" id="hidden-door">
                    ${roomNumber}
                    <div class="door-knob"></div>
                </div>
            </div>
        `;
        needsKey = false;
    } else if (i === 13) {
        content = `
            <div class="room-section">
                <button class="key" onclick="takeKey()">🔑 Взять ключ</button>
            </div>
            ${closetHTML}
            <div class="room-section">
                <div class="stone" onmousedown="moveStone(this)" ontouchstart="moveStone(this)">
                    Камень
                </div>
            </div>
            <div class="room-section">
                <div class="door" onclick="openDoor(14)" style="display: none;" id="hidden-door">
                    ${roomNumber}
                    <div class="door-knob"></div>
                </div>
            </div>
        `;
        needsKey = true;
    } else if (i === 14) {
        content = `
            <div class="long-room">
                <div class="room-text">Длинный коридор с камнем... ${roomNumber}</div>
                ${closetHTML}
                <div style="height: 600px;"></div>
                <div class="room-section">
                    <div class="stone" onmousedown="moveStone(this)" ontouchstart="moveStone(this)">
                        Камень
                    </div>
                </div>
                <div style="height: 200px;"></div>
                <div class="room-section">
                    <div class="door" onclick="openDoor(15)" style="display: none;" id="hidden-door">
                        ${roomNumber}
                        <div class="door-knob"></div>
                    </div>
                </div>
            </div>
        `;
        needsKey = false;
    } else if (i === 25) {
        content = `
            <div class="very-long-room">
                <div class="room-text">ОЧЕНЬ длинный коридор... ${roomNumber}</div>
                ${closetHTML}
                <div style="height: 1800px;"></div>
                <div class="room-section">
                    <button class="key" onclick="takeKey()">🔑 Взять ключ</button>
                </div>
                <div style="height: 200px;"></div>
                <div class="room-section">
                    <div class="door" onclick="openDoor(26)">
                        ${roomNumber}
                        <div class="door-knob"></div>
                    </div>
                </div>
            </div>
        `;
        needsKey = true;
    } else if (i === 37) {
        const doorX = Math.random() * 70 + 15;
        const doorY = Math.random() * 70 + 15;
        content = `
            <div class="room-text">Найди дверь! ${roomNumber}</div>
            ${closetHTML}
            <div class="door" onclick="openDoor(38)" style="position: absolute; left: ${doorX}%; top: ${doorY}%;">
                ${roomNumber}
                <div class="door-knob"></div>
            </div>
        `;
        needsKey = false;
    } else if (i === 42) {
        content = `
            <div class="toilet-room">
                <div class="room-text">Найди ключ и отодвинь туалет ${roomNumber}</div>
                ${closetHTML}
                <button class="key" onclick="takeKey()" style="position: absolute; left: ${Math.random() * 70 + 15}%; top: ${Math.random() * 70 + 15}%;">🔑</button>
                <div class="movable-toilet" onclick="moveToilet(this)" id="toilet-42">
                    Туалет
                </div>
                <div class="door" onclick="openDoor(43)" style="display: none;" id="hidden-door-42">
                    ${roomNumber}
                    <div class="door-knob"></div>
                </div>
            </div>
        `;
        needsKey = true;
    } else if (i === 30) {
        content = `
            ${closetHTML}
            <div class="room-section">
                <div class="door" onclick="openDoor(31)">
                    ${roomNumber}
                    <div class="door-knob"></div>
                </div>
            </div>
        `;
        needsKey = false;
    } else if (i === 50) {
        content = `
            ${closetHTML}
            <div class="room-section">
                <div class="door" onclick="startGuard50()">
                    ${roomNumber}
                    <div class="door-knob"></div>
                </div>
            </div>
        `;
        needsKey = false;
    } else if (i === 100) {
        content = `
            ${closetHTML}
            <div class="room-section">
                <div class="door" onclick="startGuard100()">
                    ${roomNumber}
                    <div class="door-knob"></div>
                </div>
            </div>
        `;
        needsKey = false;
    } else if (i % 4 === 0) {
        const correctDoor = Math.floor(Math.random() * 3) + 1;
        content = `
            <div class="room-text">Выбери правильную дверь</div>
            ${closetHTML}
            <div class="two-doors">
                ${[1, 2, 3].map(num => `
                    <div class="door ${num === correctDoor ? '' : 'wrong-door'}" 
                         onclick="${num === correctDoor ? `openDoor(${i + 1})` : `failTrap()`}">
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
                ${closetHTML}
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
            ${closetHTML}
            <div class="many-doors">
                ${Array.from({length: 10}, (_, idx) => {
                    const doorNum = idx + 1;
                    const isCorrect = correctDoors.includes(doorNum);
                    return `
                        <div class="door ${isCorrect ? '' : 'wrong-door'}" 
                             onclick="${isCorrect ? `openDoor(${i + 1})` : `failTrap()`}">
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
            ${closetHTML}
            <div class="room-section">
                <div class="door" onclick="openDoor(${i + 1})">
                    ${roomNumber}
                    <div class="door-knob"></div>
                </div>
            </div>
        `;
        needsKey = Math.random() > 0.7;
    }
    
    if (needsKey && i !== 1 && i !== 11 && i !== 13 && i !== 14 && i !== 25 && i !== 42) {
        const keyX = Math.random() * 80 + 10;
        const keyY = Math.random() * 60 + 20;
        content = `
            <button class="key" onclick="takeKey()" style="position: absolute; left: ${keyX}%; top: ${keyY}%; z-index: 10;">🔑</button>
            ${content}
        `;
    }
    
    roomDefinitions[i] = {
        title: `Комната ${roomNumber}`,
        content: content,
        needsKey: needsKey,
        hasClosets: roomHasClosets(i)
    };
}

// Основные функции игры
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.play-game').addEventListener('click', startGame);
    document.querySelector('.index-see').addEventListener('click', showIndex);
    document.querySelector('.achievements-btn').addEventListener('click', showAchievements);
    document.getElementById('index-back-btn').addEventListener('click', returnToMenu);
    document.getElementById('achievements-back-btn').addEventListener('click', returnToMenu);
    
    loadGameProgress();
});

function loadGameProgress() {
    const saved = localStorage.getItem('doorsOffProgress');
    if (saved) {
        const progress = JSON.parse(saved);
        gameState.achievements = { ...gameState.achievements, ...progress.achievements };
        gameState.index = { ...gameState.index, ...progress.index };
    }
}

function saveGameProgress() {
    const progress = {
        achievements: gameState.achievements,
        index: gameState.index
    };
    localStorage.setItem('doorsOffProgress', JSON.stringify(progress));
}

function unlockAchievement(key) {
    if (!gameState.achievements[key].unlocked) {
        gameState.achievements[key].unlocked = true;
        showMessage(`Достижение разблокировано: ${gameState.achievements[key].name}`, 'success');
        saveGameProgress();
    }
}

function showMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

function startGame() {
    gameState.currentRoom = 1;
    gameState.hasKey = false;
    gameState.gameActive = true;
    gameState.monsterActive = false;
    gameState.seekCooldown = 0;
    gameState.isHiding = false;
    gameState.currentCloset = null;
    
    gameState.stats = {
        temporalCount: 0,
        trapCount: 0,
        darkRoomCount: 0,
        consecutiveDark: 0,
        lastTemporalRoom: 0,
        seekAttacks: 0
    };
    
    Object.values(gameState.monsters).forEach(monster => {
        monster.active = false;
        if (monster.timer) clearTimeout(monster.timer);
        if (monster.flickerTimer) clearTimeout(monster.flickerTimer);
        if (monster.attackTimer) clearTimeout(monster.attackTimer);
        if (monster.count) monster.count = 0;
        if (monster.clicks) monster.clicks = 0;
    });

    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('index-screen').style.display = 'none';
    document.getElementById('achievements-screen').style.display = 'none';
    
    document.body.style.background = '#0a0a0a';
    document.body.style.opacity = '1';
    
    unlockAchievement('welcome');
    loadRoom(1);
    startMonsterTimers();
}

function startMonsterTimers() {
    // Красная тварь
    gameState.monsters.redCreature.timer = setInterval(() => {
        if (gameState.gameActive && !gameState.monsterActive && Math.random() < gameState.monsters.redCreature.chance) {
            spawnRedCreature();
        }
    }, 10000 + Math.random() * 5000);

    // Зеленая тварь
    gameState.monsters.greenCreature.timer = setInterval(() => {
        if (gameState.gameActive && !gameState.monsterActive && Math.random() < gameState.monsters.greenCreature.chance) {
            spawnGreenCreature();
        }
    }, 10000 + Math.random() * 5000);
}

function loadRoom(roomNumber) {
    if (roomNumber > 100) roomNumber = 1;
    
    gameState.currentRoom = roomNumber;
    
    const room = roomDefinitions[roomNumber];
    if (room) {
        document.getElementById('room-title').textContent = room.title;
        document.getElementById('room-content').innerHTML = room.content;
        
        document.body.style.opacity = '1';
        document.body.classList.remove('light-flicker');
        
        // Выходим из шкафа при смене комнаты
        if (gameState.isHiding && gameState.currentCloset) {
            gameState.currentCloset.classList.remove('hiding');
            gameState.isHiding = false;
            gameState.currentCloset = null;
        }
        
        // Специальные комнаты
        if (roomNumber === 30 && !gameState.monsters.figure.active) {
            setTimeout(() => spawnFigure(), 1000);
        }
        
        // Проверка на появление тьмы
        if (Math.random() < gameState.monsters.darkness.chance) {
            activateDarkness();
        }
        
        // Проверка на Поедателя
        if (room.hasClosets && gameState.seekCooldown === 0) {
            setTimeout(() => spawnSeek(), 2000);
        }
    }
}

function activateDarkness() {
    gameState.index.darkness.met = true;
    gameState.stats.darkRoomCount++;
    gameState.stats.consecutiveDark++;
    
    if (gameState.stats.consecutiveDark >= 4) {
        unlockAchievement('darkness');
    }
    
    document.body.style.background = '#000000';
    document.body.style.opacity = '0.2';
    
    setTimeout(() => {
        if (gameState.gameActive) {
            document.body.style.background = '#0a0a0a';
            document.body.style.opacity = '1';
            gameState.stats.consecutiveDark = 0;
        }
    }, 5000);
}

function toggleCloset(closet) {
    if (gameState.isHiding) {
        closet.classList.remove('hiding');
        gameState.isHiding = false;
        gameState.currentCloset = null;
        showMessage('Вы вышли из шкафа', 'success');
    } else {
        closet.classList.add('hiding');
        gameState.isHiding = true;
        gameState.currentCloset = closet;
        showMessage('Вы спрятались в шкафу', 'success');
    }
}

function spawnSeek() {
    if (gameState.monsterActive || gameState.seekCooldown > 0 || !roomHasClosets(gameState.currentRoom)) return;
    
    if (Math.random() > 0.1) return;
    
    const monster = gameState.monsters.seek;
    monster.active = true;
    gameState.monsterActive = true;
    gameState.index.seek.met = true;
    gameState.stats.seekAttacks++;
    
    showMessage('ПРЯЧЬСЯ В ШКАФ!', 'error');
    
    const seekMusic = document.getElementById('seek-music');
    seekMusic.currentTime = 0;
    seekMusic.play().catch(e => console.log('Audio error:', e));
    
    document.body.classList.add('light-flicker');
    
    monster.flickerTimer = setTimeout(() => {
        document.body.classList.remove('light-flicker');
        
        monster.attackTimer = setTimeout(() => {
            if (monster.active) {
                if (!gameState.isHiding) {
                    gameOver('Поедатель нашел вас!');
                } else {
                    monster.active = false;
                    gameState.monsterActive = false;
                    gameState.seekCooldown = 10;
                    unlockAchievement('seekSurvivor');
                    showMessage('Вы пережили атаку Поедателя!', 'success');
                    
                    const seekMusic = document.getElementById('seek-music');
                    seekMusic.pause();
                    seekMusic.currentTime = 0;
                }
            }
        }, 2000);
    }, 3000);
}

function takeKey() {
    if (gameState.isHiding) {
        showMessage('Вы не можете подбирать предметы из шкафа!', 'warning');
        return;
    }
    
    gameState.hasKey = true;
    showMessage('Ключ подобран!', 'success');
    
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        if (!key.classList.contains('found')) {
            key.classList.add('found');
            key.textContent = '🔑';
            key.onclick = null;
        }
    });
}

function openDoor(nextRoom) {
    if (gameState.isHiding) {
        showMessage('Вы не можете открывать двери из шкафа!', 'warning');
        return;
    }
    
    if (roomDefinitions[gameState.currentRoom].needsKey && !gameState.hasKey) {
        showMessage('Нужен ключ!', 'warning');
        return;
    }
    
    if (roomDefinitions[gameState.currentRoom].needsKey) {
        gameState.hasKey = false;
    }
    
    checkDoorMonsters();
    
    if (gameState.seekCooldown > 0) {
        gameState.seekCooldown--;
    }
    
    loadRoom(nextRoom);
}

function checkDoorMonsters() {
    if (Math.random() < gameState.monsters.temporal.chance) {
        spawnTemporal();
    } else if (Math.random() < gameState.monsters.eyePerformer.chance && gameState.monsters.eyePerformer.count < gameState.monsters.eyePerformer.maxCount) {
        spawnEyePerformer();
    } else if (Math.random() < gameState.monsters.bright.chance) {
        spawnBright();
    }
}

function moveStone(stone) {
    stone.style.transform = 'translateX(100px)';
    setTimeout(() => {
        const hiddenDoor = document.getElementById('hidden-door');
        if (hiddenDoor) {
            hiddenDoor.style.display = 'flex';
            showMessage('Камень отодвинут! Появилась дверь.', 'success');
        }
    }, 800);
}

function moveToilet(toilet) {
    if (!gameState.hasKey) {
        showMessage('Сначала найди ключ!', 'warning');
        return;
    }
    
    toilet.classList.add('moved');
    setTimeout(() => {
        const hiddenDoor = document.getElementById('hidden-door-42');
        if (hiddenDoor) {
            hiddenDoor.style.display = 'flex';
            showMessage('Туалет отодвинут! Появилась дверь.', 'success');
        }
    }, 800);
}

function failTrap() {
    gameState.stats.trapCount++;
    showMessage('Ловушка!', 'error');
    
    if (gameState.stats.trapCount >= 30) {
        unlockAchievement('serious');
    }
}

// Монстры
function spawnTemporal() {
    if (gameState.monsterActive) return;
    
    const monster = gameState.monsters.temporal;
    monster.active = true;
    gameState.monsterActive = true;
    gameState.index.temporal.met = true;
    
    gameState.stats.temporalCount++;
    if (gameState.currentRoom === gameState.stats.lastTemporalRoom + 1) {
        if (gameState.stats.temporalCount >= 3) {
            unlockAchievement('tickTock');
        }
    } else {
        gameState.stats.temporalCount = 1;
    }
    gameState.stats.lastTemporalRoom = gameState.currentRoom;
    
    document.getElementById('temporal-warning').style.display = 'flex';
    
    let timeLeft = 5;
    const timer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(timer);
            // Убираем оверлей перед завершением игры
            document.getElementById('temporal-warning').style.display = 'none';
            gameOver('Временной монстр поймал вас!');
        }
    }, 1000);
    
    // Добавляем возможность закрыть временного монстра кликом
    const temporalOverlay = document.getElementById('temporal-warning');
    temporalOverlay.onclick = function() {
        clearInterval(timer);
        document.getElementById('temporal-warning').style.display = 'none';
        monster.active = false;
        gameState.monsterActive = false;
        showMessage('Временной монстр избегнут!', 'success');
    };
    
    // Автоматическое закрытие через 5 секунд если игрок выжил
    setTimeout(() => {
        if (monster.active) {
            clearInterval(timer);
            document.getElementById('temporal-warning').style.display = 'none';
            monster.active = false;
            gameState.monsterActive = false;
        }
    }, 5000);
}

function spawnRedCreature() {
    if (gameState.monsterActive) return;
    
    const monster = gameState.monsters.redCreature;
    monster.active = true;
    gameState.monsterActive = true;
    gameState.index.redCreature.met = true;
    
    document.getElementById('red-creature-overlay').style.display = 'flex';
    
    let timeLeft = 1.5;
    const timer = setInterval(() => {
        timeLeft -= 0.1;
        document.getElementById('red-timer').textContent = timeLeft.toFixed(1);
        if (timeLeft <= 0) {
            clearInterval(timer);
            gameOver('Красная тварь поймала вас!');
        }
    }, 100);
}

function defeatRedCreature() {
    const monster = gameState.monsters.redCreature;
    monster.active = false;
    gameState.monsterActive = false;
    document.getElementById('red-creature-overlay').style.display = 'none';
    unlockAchievement('beatRed');
    showMessage('Красная тварь отбита!', 'success');
}

function spawnGreenCreature() {
    if (gameState.monsterActive) return;
    
    const monster = gameState.monsters.greenCreature;
    monster.active = true;
    gameState.monsterActive = true;
    gameState.index.greenCreature.met = true;
    
    document.getElementById('green-creature-overlay').style.display = 'flex';
    
    const greenButton = document.getElementById('green-button');
    greenButton.classList.remove('green');
    greenButton.classList.add('red');
    greenButton.style.cursor = 'pointer';
    greenButton.onclick = failGreenCreature;
    
    let timeLeft = 1.5;
    const timer = setInterval(() => {
        timeLeft -= 0.1;
        document.getElementById('green-timer').textContent = timeLeft.toFixed(1);
        if (timeLeft <= 0) {
            clearInterval(timer);
            monster.active = false;
            gameState.monsterActive = false;
            document.getElementById('green-creature-overlay').style.display = 'none';
            greenButton.classList.remove('red');
            greenButton.classList.add('green');
            greenButton.style.cursor = 'not-allowed';
            greenButton.onclick = null;
            unlockAchievement('dontBeatGreen');
            showMessage('Зеленая тварь побеждена!', 'success');
        }
    }, 100);
}

function spawnGreenCreature() {
    if (gameState.monsterActive) return;
    
    const monster = gameState.monsters.greenCreature;
    monster.active = true;
    gameState.monsterActive = true;
    gameState.index.greenCreature.met = true;
    
    document.getElementById('green-creature-overlay').style.display = 'flex';
    
    const greenButton = document.getElementById('green-button');
    greenButton.classList.remove('green');
    greenButton.classList.add('red');
    greenButton.style.cursor = 'pointer';
    
    // Сохраняем оригинальный обработчик чтобы можно было его убрать
    greenButton._originalOnclick = greenButton.onclick;
    greenButton.onclick = failGreenCreature;
    
    let timeLeft = 1.5;
    const timer = setInterval(() => {
        if (!monster.active) {
            clearInterval(timer);
            return;
        }
        
        timeLeft -= 0.1;
        document.getElementById('green-timer').textContent = timeLeft.toFixed(1);
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            // УСПЕХ - игрок не нажал кнопку
            monster.active = false;
            gameState.monsterActive = false;
            document.getElementById('green-creature-overlay').style.display = 'none';
            
            // Восстанавливаем кнопку в исходное состояние
            greenButton.classList.remove('red');
            greenButton.classList.add('green');
            greenButton.style.cursor = 'not-allowed';
            greenButton.onclick = null;
            
            unlockAchievement('dontBeatGreen');
            showMessage('Зеленая тварь побеждена!', 'success');
        }
    }, 100);
    
    // Защита на случай если таймер не сработает
    setTimeout(() => {
        if (monster.active) {
            clearInterval(timer);
            monster.active = false;
            gameState.monsterActive = false;
            document.getElementById('green-creature-overlay').style.display = 'none';
            greenButton.classList.remove('red');
            greenButton.classList.add('green');
            greenButton.style.cursor = 'not-allowed';
            greenButton.onclick = null;
        }
    }, 2000);
}

// Исправленная функция провала зеленой твари
function failGreenCreature() {
    const monster = gameState.monsters.greenCreature;
    const greenButton = document.getElementById('green-button');
    
    // Немедленно очищаем все
    monster.active = false;
    gameState.monsterActive = false;
    document.getElementById('green-creature-overlay').style.display = 'none';
    
    // Восстанавливаем кнопку
    greenButton.classList.remove('red');
    greenButton.classList.add('green');
    greenButton.style.cursor = 'not-allowed';
    greenButton.onclick = null;
    
    gameOver('Вы нажали кнопку! Зеленая тварь поймала вас!');
}

function spawnEyePerformer() {
    if (gameState.monsterActive) return;
    
    const monster = gameState.monsters.eyePerformer;
    monster.active = true;
    monster.count++;
    gameState.monsterActive = true;
    gameState.index.eyePerformer.met = true;
    
    document.getElementById('eye-performer-overlay').style.display = 'flex';
    
    const requirements = ['Нажми меня!', 'Не нажимай!', 'Быстро нажми!', 'Жди...'];
    const currentReq = requirements[Math.floor(Math.random() * requirements.length)];
    
    document.getElementById('eye-requirement').textContent = currentReq;
    document.getElementById('eye-requirement').onclick = function() {
        if (currentReq === 'Нажми меня!' || currentReq === 'Быстро нажми!') {
            monster.active = false;
            gameState.monsterActive = false;
            document.getElementById('eye-performer-overlay').style.display = 'none';
            showMessage('Совершитель глаз побежден!', 'success');
            if (monster.count >= 2) {
                unlockAchievement('controller');
            }
        } else if (currentReq === 'Не нажимай!') {
            gameOver('Вы нажали когда нельзя было!');
        }
    };
    
    let timeLeft = 2.0;
    const timer = setInterval(() => {
        timeLeft -= 0.1;
        document.getElementById('eye-timer').textContent = timeLeft.toFixed(1);
        
        if (currentReq === 'Быстро нажми!' && timeLeft < 1.0) {
            document.getElementById('eye-requirement').style.background = '#e74c3c';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            if (currentReq === 'Жди...') {
                monster.active = false;
                gameState.monsterActive = false;
                document.getElementById('eye-performer-overlay').style.display = 'none';
                showMessage('Совершитель глаз побежден!', 'success');
                if (monster.count >= 2) {
                    unlockAchievement('controller');
                }
            } else if (currentReq === 'Быстро нажми!') {
                gameOver('Вы не успели нажать!');
            }
        }
    }, 100);
}

function spawnBright() {
    if (gameState.monsterActive) return;
    
    const monster = gameState.monsters.bright;
    monster.active = true;
    gameState.monsterActive = true;
    gameState.index.bright.met = true;
    
    monster.clicks = 0;
    document.getElementById('bright-overlay').style.display = 'flex';
    document.getElementById('bright-counter').textContent = '0/20';
}

function clickBright() {
    const monster = gameState.monsters.bright;
    if (!monster.active) return;
    
    monster.clicks++;
    document.getElementById('bright-counter').textContent = `${monster.clicks}/20`;
    
    if (monster.clicks >= monster.needed) {
        monster.active = false;
        gameState.monsterActive = false;
        document.getElementById('bright-overlay').style.display = 'none';
        showMessage('ЯРКИЙ побежден!', 'success');
    }
}

function spawnFigure() {
    if (gameState.monsterActive) return;
    
    const monster = gameState.monsters.figure;
    monster.active = true;
    gameState.monsterActive = true;
    gameState.index.figure.met = true;
    
    monster.doorsPassed = 0;
    monster.timeLeft = 30;
    
    document.getElementById('figure-overlay').style.display = 'flex';
    document.getElementById('figure-timer').textContent = monster.timeLeft.toFixed(1);
    document.getElementById('figure-doors').textContent = `0/${monster.totalDoors}`;
    
    const figureMusic = document.getElementById('figure-music');
    figureMusic.currentTime = 0;
    figureMusic.play().catch(e => console.log('Audio error:', e));
    
    generateEscapeDoors();
    
    const timer = setInterval(() => {
        if (!monster.active) {
            clearInterval(timer);
            return;
        }
        
        monster.timeLeft -= 0.1;
        document.getElementById('figure-timer').textContent = monster.timeLeft.toFixed(1);
        
        if (monster.timeLeft <= 0) {
            clearInterval(timer);
            figureMusic.pause();
            figureMusic.currentTime = 0;
            gameOver('Время вышло! ВВЕРХ поймал вас!');
        }
    }, 100);
    
    monster.timer = timer;
}

function generateEscapeDoors() {
    const container = document.getElementById('escape-doors');
    container.innerHTML = '';
    
    for (let i = 1; i <= 15; i++) {
        const door = document.createElement('div');
        door.className = 'escape-door';
        door.textContent = i;
        door.onclick = () => passEscapeDoor(i);
        container.appendChild(door);
    }
}

function passEscapeDoor(doorNumber) {
    const monster = gameState.monsters.figure;
    monster.doorsPassed++;
    document.getElementById('figure-doors').textContent = `${monster.doorsPassed}/${monster.totalDoors}`;
    
    if (monster.doorsPassed >= monster.totalDoors) {
        clearInterval(monster.timer);
        monster.active = false;
        gameState.monsterActive = false;
        document.getElementById('figure-overlay').style.display = 'none';
        
        const figureMusic = document.getElementById('figure-music');
        figureMusic.pause();
        figureMusic.currentTime = 0;
        
        unlockAchievement('youCant');
        showMessage('ВВЕРХ побежден!', 'success');
        proceedToRoom(31);
    }
}

function startGuard50() {
    if (gameState.monsterActive || gameState.isHiding) return;
    
    const monster = gameState.monsters.guard50;
    monster.active = true;
    gameState.monsterActive = true;
    gameState.index.guard.met = true;
    
    monster.code = Array.from({length: 4}, () => Math.floor(Math.random() * 10)).join('');
    monster.booksOpened = 0;
    
    const guardMusic = document.getElementById('guard-music');
    guardMusic.currentTime = 0;
    guardMusic.play().catch(e => console.log('Audio error:', e));
    
    document.getElementById('guard-50-overlay').style.display = 'flex';
    document.getElementById('guard-code').textContent = '????';
    
    generateBooks();
}

function generateBooks() {
    const container = document.getElementById('guard-books');
    container.innerHTML = '';
    const monster = gameState.monsters.guard50;
    
    const codePositions = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    const codeDigits = monster.code.split('');
    
    for (let i = 0; i < 16; i++) {
        const book = document.createElement('div');
        book.className = 'book';
        book.textContent = '?';
        
        const codeIndex = codePositions.indexOf(i);
        if (codeIndex !== -1) {
            book.dataset.digit = codeDigits[codeIndex];
        }
        
        book.onclick = () => openBook(book, i);
        container.appendChild(book);
    }
}

function openBook(book, index) {
    const monster = gameState.monsters.guard50;
    
    if (book.dataset.digit) {
        book.textContent = book.dataset.digit;
        book.classList.add('green');
        monster.booksOpened++;
        
        const codeDisplay = document.getElementById('guard-code');
        const currentCode = codeDisplay.textContent.split('');
        const digitIndex = currentCode.indexOf('?');
        if (digitIndex !== -1) {
            currentCode[digitIndex] = book.dataset.digit;
            codeDisplay.textContent = currentCode.join('');
        }
        
        if (Math.random() < 0.3 && !monster.minigameActive) {
            startGuardMinigame();
        }
        
        if (monster.booksOpened >= 4) {
            setTimeout(completeGuard50, 1000);
        }
    } else {
        book.classList.add('red');
        book.textContent = 'X';
        book.onclick = null;
    }
}

function startGuardMinigame() {
    const monster = gameState.monsters.guard50;
    monster.minigameActive = true;
    
    document.getElementById('guard-minigame-overlay').style.display = 'flex';
    
    let timeLeft = 20;
    document.getElementById('guard-minigame-timer').textContent = timeLeft.toFixed(1);
    
    generateMinigameBooks();
    
    const timer = setInterval(() => {
        timeLeft -= 0.1;
        document.getElementById('guard-minigame-timer').textContent = timeLeft.toFixed(1);
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            gameOver('Не успели! Страж поймал вас!');
        }
        
        const greenBooks = document.querySelectorAll('#guard-minigame-books .book.green');
        if (greenBooks.length === 0) {
            clearInterval(timer);
            monster.minigameActive = false;
            document.getElementById('guard-minigame-overlay').style.display = 'none';
            showMessage('Мини-игра пройдена!', 'success');
        }
    }, 100);
}

function generateMinigameBooks() {
    const container = document.getElementById('guard-minigame-books');
    container.innerHTML = '';
    
    for (let i = 0; i < 12; i++) {
        const book = document.createElement('div');
        book.className = 'book';
        book.textContent = '📕';
        
        if (Math.random() < 0.4) {
            book.classList.add('green');
            book.onclick = function() {
                this.remove();
            };
        } else {
            book.classList.add('red');
            book.onclick = function() {
                gameOver('Неправильная книга!');
            };
        }
        
        container.appendChild(book);
    }
}

function completeGuard50() {
    const monster = gameState.monsters.guard50;
    monster.active = false;
    gameState.monsterActive = false;
    document.getElementById('guard-50-overlay').style.display = 'none';
    
    const guardMusic = document.getElementById('guard-music');
    guardMusic.pause();
    guardMusic.currentTime = 0;
    
    unlockAchievement('memory');
    showMessage('Страж 050 побежден!', 'success');
    proceedToRoom(51);
}

function startGuard100() {
    if (gameState.monsterActive || gameState.isHiding) return;
    
    const monster = gameState.monsters.guard100;
    monster.active = true;
    gameState.monsterActive = true;
    
    monster.keysCollected = 0;
    monster.keysNeeded = 20;
    monster.squares = [];
    
    const guardMusic = document.getElementById('guard-music');
    guardMusic.currentTime = 0;
    guardMusic.play().catch(e => console.log('Audio error:', e));
    
    document.getElementById('guard-100-overlay').style.display = 'flex';
    document.getElementById('guard-keys-counter').textContent = '0/20';
    
    generateGuard100Game();
}

function generateGuard100Game() {
    const container = document.getElementById('guard-100-area');
    container.innerHTML = '';
    const monster = gameState.monsters.guard100;
    
    // Генерация ключей
    for (let i = 0; i < 20; i++) {
        const key = document.createElement('div');
        key.className = 'key-item';
        key.style.left = Math.random() * 570 + 'px';
        key.style.top = Math.random() * 370 + 'px';
        key.textContent = '🔑';
        key.onclick = function() {
            this.remove();
            monster.keysCollected++;
            document.getElementById('guard-keys-counter').textContent = `${monster.keysCollected}/${monster.keysNeeded}`;
            
            if (monster.keysCollected >= monster.keysNeeded) {
                completeGuard100();
            }
        };
        container.appendChild(key);
    }
    
    // Генерация опасных квадратов
    for (let i = 0; i < 8; i++) {
        const square = document.createElement('div');
        square.className = 'danger-square';
        square.style.left = Math.random() * 560 + 'px';
        square.style.top = Math.random() * 360 + 'px';
        
        square.onmouseenter = function() {
            gameOver('Красный квадрат!');
        };
        
        container.appendChild(square);
        monster.squares.push(square);
    }
}

function completeGuard100() {
    const monster = gameState.monsters.guard100;
    monster.active = false;
    gameState.monsterActive = false;
    document.getElementById('guard-100-overlay').style.display = 'none';
    
    const guardMusic = document.getElementById('guard-music');
    guardMusic.pause();
    guardMusic.currentTime = 0;
    
    unlockAchievement('theEnd');
    showMessage('ФИНАЛЬНЫЙ СТРАЖ ПОБЕЖДЕН! ИГРА ПРОЙДЕНА!', 'success');
    setTimeout(() => {
        returnToMenu();
    }, 5000);
}

function proceedToRoom(roomNumber) {
    loadRoom(roomNumber);
}

function gameOver(reason) {
    stopAllMonsters();
    gameState.gameActive = false;
    
    showMessage(`Игра окончена: ${reason}`, 'error');
    
    setTimeout(() => {
        if (confirm(`${reason}\n\nНачать заново?`)) {
            startGame();
        } else {
            returnToMenu();
        }
    }, 2000);
}

function stopAllMonsters() {
    Object.values(gameState.monsters).forEach(monster => {
        if (monster.active) {
            monster.active = false;
            if (monster.timer) {
                clearTimeout(monster.timer);
                monster.timer = null;
            }
            if (monster.flickerTimer) {
                clearTimeout(monster.flickerTimer);
                monster.flickerTimer = null;
            }
            if (monster.attackTimer) {
                clearTimeout(monster.attackTimer);
                monster.attackTimer = null;
            }
        }
    });
    
    // Останавливаем всю музыку
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    
    // Убираем все визуальные эффекты
    document.body.classList.remove('light-flicker');
    
    // Скрываем все оверлеи монстров
    const overlays = document.querySelectorAll('.monster-overlay, .bright-overlay, .temporal-warning, .seek-warning');
    overlays.forEach(overlay => {
        overlay.style.display = 'none';
    });
    
    // Сбрасываем состояние кнопки зеленой твари
    const greenButton = document.getElementById('green-button');
    if (greenButton) {
        greenButton.classList.remove('red');
        greenButton.classList.add('green');
        greenButton.style.cursor = 'not-allowed';
        greenButton.onclick = null;
    }
    
    gameState.monsterActive = false;
    gameState.isHiding = false;
    gameState.currentCloset = null;
}
function returnToMenu() {
    stopAllMonsters();
    gameState.gameActive = false;
    
    document.getElementById('main-menu').style.display = 'block';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('index-screen').style.display = 'none';
    document.getElementById('achievements-screen').style.display = 'none';
    
    document.body.style.background = '#0a0a0a';
    document.body.style.opacity = '1';
}

function showIndex() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('index-screen').style.display = 'block';
    document.getElementById('achievements-screen').style.display = 'none';
    
    const container = document.getElementById('index-container');
    container.innerHTML = '';
    
    Object.entries(gameState.index).forEach(([key, monster]) => {
        const item = document.createElement('div');
        item.className = `index-item ${monster.met ? 'unlocked' : ''}`;
        item.innerHTML = `
            <h3>${monster.name}</h3>
            <p>${monster.description}</p>
        `;
        container.appendChild(item);
    });
}

function showAchievements() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('index-screen').style.display = 'none';
    document.getElementById('achievements-screen').style.display = 'block';
    
    const container = document.getElementById('achievements-container');
    container.innerHTML = '';
    
    Object.entries(gameState.achievements).forEach(([key, achievement]) => {
        const item = document.createElement('div');
        item.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''}`;
        item.innerHTML = `
            <div class="achievement-icon">${achievement.unlocked ? '✓' : '?'}</div>
            <div class="achievement-info">
                <h3>${achievement.name}</h3>
                <p>${achievement.description}</p>
            </div>
        `;
        container.appendChild(item);
    });
}
// Функция для показа главного меню
function showMainMenu() {
    document.getElementById('main-menu').style.display = 'block';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('index-screen').style.display = 'none';
    document.getElementById('achievements-screen').style.display = 'none';
    
    document.body.style.background = '#0a0a0a';
    document.body.style.opacity = '1';
}

// Функция для случайного спавна монстров в комнатах
function spawnRandomMonster() {
    if (gameState.monsterActive || !gameState.gameActive) return;
    
    const random = Math.random();
    if (random < 0.05) {
        // 5% шанс на красную тварь
        spawnRedCreature();
    } else if (random < 0.1) {
        // 5% шанс на зеленую тварь
        spawnGreenCreature();
    } else if (random < 0.12 && gameState.monsters.eyePerformer.count < gameState.monsters.eyePerformer.maxCount) {
        // 2% шанс на совершителя глаз
        spawnEyePerformer();
    }
}

// Функция для обновления прогресс-бара совершителя глаз
function updateEyeProgress() {
    const progressFill = document.getElementById('eye-progress');
    if (progressFill) {
        const progress = (gameState.monsters.eyePerformer.count / gameState.monsters.eyePerformer.maxCount) * 100;
        progressFill.style.width = `${progress}%`;
    }
}

// Функция для обработки специальных комнат
function handleSpecialRooms(roomNumber) {
    switch(roomNumber) {
        case 66:
            // Комната с увеличенным шансом монстров
            showMessage('Эта комната кажется более опасной...', 'warning');
            setTimeout(() => {
                if (Math.random() < 0.3) {
                    spawnRandomMonster();
                }
            }, 2000);
            break;
        case 77:
            // Тайная комната
            showMessage('Вы нашли секретную комнату!', 'success');
            gameState.hasKey = true;
            break;
        case 88:
            // Комната с несколькими ключами
            showMessage('Здесь много ключей!', 'success');
            // Добавляем дополнительные ключи в интерфейс
            const roomContent = document.getElementById('room-content');
            for (let i = 0; i < 3; i++) {
                const keyX = Math.random() * 70 + 15;
                const keyY = Math.random() * 60 + 20;
                const key = document.createElement('button');
                key.className = 'key';
                key.style.cssText = `position: absolute; left: ${keyX}%; top: ${keyY}%; z-index: 10;`;
                key.textContent = '🔑';
                key.onclick = takeKey;
                roomContent.appendChild(key);
            }
            break;
        case 99:
            // Предфинальная комната
            showMessage('Приготовьтесь к финальной битве!', 'warning');
            break;
    }
}

// Функция для проверки достижений связанных с монстрами
function checkMonsterAchievements() {
    // Проверка на встречу со всеми монстрами
    const allMonstersMet = Object.values(gameState.index).every(monster => monster.met);
    if (allMonstersMet && !gameState.achievements.monsterExpert) {
        gameState.achievements.monsterExpert = {
            name: "Эксперт по монстрам",
            description: "Встретить всех монстров",
            unlocked: true
        };
        unlockAchievement('monsterExpert');
    }
    
    // Проверка на выживание в длинной серии комнат
    if (gameState.currentRoom >= 50 && !gameState.achievements.survivor) {
        gameState.achievements.survivor = {
            name: "Выживший",
            description: "Дойти до комнаты 50",
            unlocked: true
        };
        unlockAchievement('survivor');
    }
}

// Функция для анимации перехода между комнатами
function animateRoomTransition() {
    const gameScreen = document.getElementById('game-screen');
    gameScreen.style.opacity = '0';
    
    setTimeout(() => {
        gameScreen.style.opacity = '1';
    }, 500);
}

// Функция для управления звуками
function playSound(soundId, loop = false) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.loop = loop;
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }
}

function stopSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.pause();
        sound.currentTime = 0;
    }
}

// Функция для сброса состояния монстров при перезапуске
function resetMonsters() {
    Object.keys(gameState.monsters).forEach(key => {
        const monster = gameState.monsters[key];
        monster.active = false;
        
        if (monster.timer) {
            clearTimeout(monster.timer);
            monster.timer = null;
        }
        
        if (monster.flickerTimer) {
            clearTimeout(monster.flickerTimer);
            monster.flickerTimer = null;
        }
        
        if (monster.attackTimer) {
            clearTimeout(monster.attackTimer);
            monster.attackTimer = null;
        }
        
        // Сброс счетчиков
        if (monster.count !== undefined) monster.count = 0;
        if (monster.clicks !== undefined) monster.clicks = 0;
        if (monster.doorsPassed !== undefined) monster.doorsPassed = 0;
        if (monster.keysCollected !== undefined) monster.keysCollected = 0;
        if (monster.booksOpened !== undefined) monster.booksOpened = 0;
    });
}

// Функция для показа статистики игры
function showGameStats() {
    const stats = `
        Пройдено комнат: ${gameState.currentRoom - 1}
        Ловушек: ${gameState.stats.trapCount}
        Тёмных комнат: ${gameState.stats.darkRoomCount}
        Атак Поедателя: ${gameState.stats.seekAttacks}
        Временных монстров: ${gameState.stats.temporalCount}
    `;
    
    showMessage(stats, 'success');
}

// Функция для быстрого сохранения игры
function quickSave() {
    const saveData = {
        currentRoom: gameState.currentRoom,
        hasKey: gameState.hasKey,
        achievements: gameState.achievements,
        index: gameState.index,
        stats: gameState.stats,
        monsters: {
            eyePerformer: { count: gameState.monsters.eyePerformer.count },
            seek: { active: gameState.monsters.seek.active }
        }
    };
    
    localStorage.setItem('doorsOffQuickSave', JSON.stringify(saveData));
    showMessage('Игра сохранена', 'success');
}

function quickLoad() {
    const saved = localStorage.getItem('doorsOffQuickSave');
    if (saved) {
        const saveData = JSON.parse(saved);
        
        gameState.currentRoom = saveData.currentRoom;
        gameState.hasKey = saveData.hasKey;
        gameState.achievements = { ...gameState.achievements, ...saveData.achievements };
        gameState.index = { ...gameState.index, ...saveData.index };
        gameState.stats = { ...gameState.stats, ...saveData.stats };
        gameState.monsters.eyePerformer.count = saveData.monsters.eyePerformer.count;
        gameState.monsters.seek.active = saveData.monsters.seek.active;
        
        loadRoom(gameState.currentRoom);
        showMessage('Игра загружена', 'success');
    } else {
        showMessage('Нет сохраненной игры', 'error');
    }
}

// Функция для обработки клавиатурных shortcuts
document.addEventListener('keydown', function(event) {
    if (!gameState.gameActive) return;
    
    switch(event.key) {
        case 's':
        case 'S':
            if (event.ctrlKey) {
                event.preventDefault();
                quickSave();
            }
            break;
        case 'l':
        case 'L':
            if (event.ctrlKey) {
                event.preventDefault();
                quickLoad();
            }
            break;
        case 'Escape':
            returnToMenu();
            break;
        case 'i':
        case 'I':
            showIndex();
            break;
        case 'a':
        case 'A':
            showAchievements();
            break;
    }
});

// Функция для оптимизации производительности
function optimizePerformance() {
    // Очистка неиспользуемых элементов
    const overlays = document.querySelectorAll('.monster-overlay, .bright-overlay');
    overlays.forEach(overlay => {
        if (overlay.style.display === 'none') {
            overlay.innerHTML = '';
        }
    });
}

// Функция для проверки поддержки функций браузером
function checkBrowserCompatibility() {
    if (!('localStorage' in window)) {
        showMessage('Ваш браузер не поддерживает сохранение игры', 'warning');
    }
    
    if (!('Promise' in window)) {
        showMessage('Рекомендуется использовать современный браузер', 'warning');
    }
}

// Инициализация игры при загрузке
function initializeGame() {
    checkBrowserCompatibility();
    loadGameProgress();
    
    // Предзагрузка критически важных ресурсов
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
        audio.preload = 'metadata';
    });
    
    console.log('DOORS-OFF инициализирована');
}

// Вызов инициализации при загрузке страницы
window.addEventListener('load', initializeGame);

// Обработчик для мобильных устройств
function setupMobileSupport() {
    // Увеличиваем размер кликабельных элементов для мобильных
    if ('ontouchstart' in window) {
        const touchElements = document.querySelectorAll('.door, .key, .btn, .stone, .closet');
        touchElements.forEach(element => {
            element.style.minHeight = '44px';
            element.style.minWidth = '44px';
        });
    }
}

// Авто-сохранение каждые 2 минуты
setInterval(() => {
    if (gameState.gameActive) {
        saveGameProgress();
    }
}, 120000);

// Функция для отладки (только в development)
function debugMode() {
    console.log('Current Game State:', gameState);
    
    // Добавляем debug панель
    const debugPanel = document.createElement('div');
    debugPanel.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        z-index: 10000;
        font-size: 12px;
    `;
    
    debugPanel.innerHTML = `
        <div>Room: ${gameState.currentRoom}</div>
        <div>Key: ${gameState.hasKey}</div>
        <div>Monster Active: ${gameState.monsterActive}</div>
        <button onclick="gameState.currentRoom++">Next Room</button>
        <button onclick="gameState.hasKey = true">Get Key</button>
    `;
    
    document.body.appendChild(debugPanel);
}
function forceCloseAllMonsters() {
    stopAllMonsters();
    
    // Дополнительная очистка интервалов
    const highestIntervalId = setInterval(() => {});
    for (let i = 0; i < highestIntervalId; i++) {
        clearInterval(i);
    }
}
// Экспорт функций для глобального использования
window.takeKey = takeKey;
window.openDoor = openDoor;
window.moveStone = moveStone;
window.moveToilet = moveToilet;
window.toggleCloset = toggleCloset;
window.startGame = startGame;
window.returnToMenu = returnToMenu;
window.showIndex = showIndex;
window.showAchievements = showAchievements;
window.defeatRedCreature = defeatRedCreature;
window.failGreenCreature = failGreenCreature;
window.clickBright = clickBright;
window.passEscapeDoor = passEscapeDoor;
window.startGuard50 = startGuard50;
window.startGuard100 = startGuard100;
window.openBook = openBook;
window.debugMode = debugMode;
