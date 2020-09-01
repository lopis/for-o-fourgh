let socket;
function bind() {
    socket.on('start', () => {
        if (gameState != 'start') {
            gameState = 'start';
            console.log('Game start');
            resetPlayerChoice(localPlayer);
            mainLoop();
        }
    });
    socket.on('connect', () => {
        console.log('Connected');
    });
    socket.on('disconnect', () => {
        console.log('Connection lost!');
    });
    socket.on('updatePlayers', (users) => {
        console.log('updatePlayers', users);
        localPlayer = users.find(player => player.id === socket.id);
        players = users;
        players.forEach(player => {
            player.stats = playerStats[player.id] || Object.assign({}, DEFAULT_STATS);
            playerStats[player.id] = player.stats;
        });
        renderPlayers();
        renderPlayerCards();
    });
}
function initClient() {
    socket = window.io();
    bind();
}
function joinGame(name) {
    socket.emit('join', name);
}
function submitPlayerChoice(choice) {
    socket.emit('choice', choice);
}
function submitMove() {
    socket.emit('move');
}
function submitReset() {
    socket.emit('resetChoice');
}
const CARD_COUNT = 5;
const CARD_TIMEOUT = 5000;
const WAITING = 'Waiting for others...';
const DEFAULT_STATS = {
    gold: 1,
    influence: 0,
    relics: 0
};
const BANK = 'bank';
const COURT = 'court';
const TEMPLE = 'temple';
const EDEN = 'eden';
const HELL = 'hell';
const GOLD = 'gold';
const INFLUENCE = 'influence';
const RELICS = 'relics';
let players = [];
let localPlayer = null;
let playerStats = {};
let gameState = 'lobby';
const locations = [
    BANK,
    COURT,
    TEMPLE,
    EDEN,
    HELL,
].map((name) => ({ name: name, players: [] }));
const locationActions = {
    bank: [{
            name: 'Interest Return',
            labels: ['💰 + 💰 / 5 ⚜️'],
            effect(player) {
                player.stats.gold += 1 + Math.floor(player.stats.influence / 5);
            },
            disabled: () => false
        }],
    court: [
        {
            name: 'Draw Policy',
            labels: ['draw 1 📜'],
            effect(player) {
                drawCard('policies');
            },
            disabled: () => false
        },
        {
            name: 'Embezzlement',
            labels: ['-1 ⚜️', '+2 💰', , '+1 🏺'],
            effect(player) {
                player.stats.influence -= 1;
                player.stats.gold += 2;
                player.stats.relics += 1;
            },
            disabled: () => localPlayer.stats.influence < 1
        }
    ],
    temple: [
        {
            name: 'Offering',
            labels: ['-1 🏺', '+3 ⚜️'],
            effect(player) {
                player.stats.influence += 3;
                player.stats.relics -= 1;
            },
            disabled: () => localPlayer.stats.relics < 1
        },
        {
            name: 'Donation',
            labels: ['-1 💰', '+1 ⚜️'],
            effect(player) {
                console.log('donation', player.char, player.id, JSON.stringify(player.stats), JSON.stringify(playerStats));
                player.stats.gold--;
                player.stats.influence++;
            },
            disabled: () => localPlayer.stats.gold < 1
        },
        {
            name: 'Skip',
            labels: ['🙏'],
            effect(player) { },
            disabled: () => false,
        }
    ],
    eden: [
        {
            name: 'Blessing',
            labels: ['draw 1 ✨'],
            effect(player) {
                drawCard('blessings');
            },
            disabled: () => false
        }
    ],
    hell: [
        {
            name: 'Wrath',
            labels: ['draw 1 💢'],
            effect(player) {
                drawCard('damnations');
            },
            disabled: () => false
        }
    ],
};
const decks = {
    policies: [
        {
            name: 'Blackmail',
            label: 'Steal 5 💰 or 2 ⚜️ from player',
        },
        {
            name: 'Grant',
            label: 'Steal 1 relic',
            choosePlayer: true
        },
        {
            name: 'Tax Reform',
            options: [
                {
                    name: 'Tax richest </br> 2💰'
                },
                {
                    name: 'Tax all 👥 </br> 1💰'
                }
            ]
        }
    ],
    blessings: [
        {
            name: 'Ancient Relic',
            options: [
                {
                    name: 'Sell +1 💰'
                },
                {
                    name: 'Keep + 1 🏺'
                }
            ]
        },
        {
            name: 'Divine Sanction',
            label: 'Players on Temple/Sky +1⚜️'
        },
        {
            name: 'Judgement',
            label: '👤 on Eden +2⚜️ <br>👤 on Hell -2⚜️'
        }
    ],
    damnations: [
        {
            name: 'Deluge',
            label: 'Players on Earth -1⚜️'
        }
    ]
};
function updatePlayerLocation(resolve) {
    players.forEach(player => {
        const prevLocation = locations.find(l => l.name === player.location);
        const nextLocation = locations.find(l => l.name === player.nextChoice.location);
        if (nextLocation) {
            if (prevLocation) {
                prevLocation.players = prevLocation.players.filter(p => p.name !== player.name);
            }
            nextLocation.players.push(player);
            player.location = nextLocation.name;
        }
        else if (prevLocation) {
            prevLocation.players.push(player);
            player.location = prevLocation.name;
        }
        resetPlayerChoice(player);
    });
    renderPlayers();
    renderPlayerCards();
    submitMove();
    resolve && resolve();
}
function createCardDecks() {
    Object.entries(decks).forEach(([deckName, deck]) => {
        let cards = [];
        deck.forEach((card) => {
            for (let i = 0; i < CARD_COUNT; i++) {
                cards.push(Object.assign({}, card));
            }
        });
        shuffleArray(cards);
        cards.forEach((card) => renderCard(card, deckName));
    });
}
function drawCard(deckName) {
    animateCardFlip(deckName);
}
function resetPlayerChoice(player) {
    player.nextChoice = {
        location: null,
        action: null,
        option: null,
        target: null,
    };
}
function setPlayerChoice(option, type) {
    localPlayer.nextChoice[type] = option;
    submitPlayerChoice(localPlayer.nextChoice);
}
function renderButtons(title, options, type, waitingTitle) {
    requestAnimationFrame(() => {
        document.querySelector('.actions .options').innerHTML = '';
        options.map(option => {
            const button = document.createElement('div');
            button.innerHTML = option.html;
            button.className = 'btn';
            if (!option.disabled) {
                button.onmousedown = () => {
                    setPlayerChoice(option.title, type);
                    document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('pressed'));
                    button.classList.add('pressed');
                    if (waitingTitle) {
                        document.querySelector('.actions .title').innerHTML = waitingTitle;
                        applyTinyFont('.actions .title');
                    }
                };
            }
            else {
                button.classList.add('disabled');
            }
            document.querySelector('.actions .options').appendChild(button);
        });
        document.querySelector('.actions .title').innerHTML = title;
        applyTinyFont('.actions .title');
    });
}
function renderMessages(messages) {
    document.querySelector('.actions .options').innerHTML = '';
    document.querySelector('.actions .title').innerHTML = messages.map(message => `<div class="text">${message}</div>`).join('');
    applyTinyFont('.actions .text');
}
function renderPlayers() {
    locations.forEach(location => {
        location.players.forEach(player => {
            document.querySelector(`.${location.name}`).appendChild(document.querySelector(`.map .char.${player.char}`));
        });
    });
}
function renderPlayerCards() {
    document.querySelector('.stats').innerHTML = players.map(player => `<div class="player ${player.id}">
      <div class="avatar char ${player.char}"></div>
      <div>
        <div class="text gold">${player.stats.gold}</div>
        <div class="text relics">${player.stats.relics}</div>
        <div class="text influence">${player.stats.influence}</div>
      </div>
    </div>`).join('');
    applyTinyFont();
}
function updatePlayerCards() {
    players.forEach(player => {
        document.querySelector(`.player.${player.id} .gold`).innerHTML = `${player.stats.gold}`;
        document.querySelector(`.player.${player.id} .relics`).innerHTML = `${player.stats.relics}`;
        document.querySelector(`.player.${player.id} .influence`).innerHTML = `${player.stats.influence}`;
    });
    applyTinyFont();
}
function renderActions(resolvePromise) {
    const location = localPlayer.location;
    const actions = locationActions[location];
    renderButtons('Choose an action', actions.map((action, index) => ({
        title: action.name,
        disabled: action.disabled(),
        html: `<div class="action-title">${index + 1}._${action.name}</div>
        <div class="labels">${action.labels.map(label => `<div>${label}</div>`).join('')}</div>`
    })), 'action');
    applyTinyFont('.action-title');
    resolvePromise();
}
function adjustUIScale() {
    const updatePixelSize = () => {
        const smallestSize = Math.min(document.documentElement.clientHeight, document.documentElement.clientWidth - 150);
        document.body.style.setProperty('--pixel-size', `${Math.round(smallestSize / 100)}px`);
    };
    window.onresize = updatePixelSize;
    updatePixelSize();
}
function renderCard(card, deck) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.innerHTML = [
        `<div class="front"></div>`,
        `<div class="back">`,
        `<p>${card.name}</p>`,
        card.label ? `<p>${card.label}</p>` : '',
        (card.options || []).map(option => `<p class="card-option">${option.name}</p>`).join(''),
        `</div>`
    ].join('');
    document.querySelector(`.deck.${deck}`).append(cardElement);
}
function animateCardFlip(deckName) {
    const topCard = Array.from(document.querySelectorAll(`.deck.${deckName} .card`)).pop();
    topCard.classList.add('flip');
    setTimeout(() => {
        topCard.parentElement.removeChild(topCard);
    }, CARD_TIMEOUT);
}
const promptNextLocation = () => {
    return new Promise((resolve) => {
        submitReset();
        renderButtons('Go to', [BANK, COURT, TEMPLE, EDEN, HELL].map((location, idx) => ({
            title: location,
            html: `${idx + 1}._${location}`,
            disabled: location === localPlayer.location
        })), 'location', WAITING);
        applyTinyFont('.btn');
        resolve();
    });
};
const waitForAllOptions = (type, resolvePromise) => {
    if (players.every(player => player.nextChoice[type])) {
        console.log('All ready', players.map(p => p.nextChoice));
        resolvePromise();
    }
    else {
        requestAnimationFrame(() => waitForAllOptions(type, resolvePromise));
    }
};
const waitForPlayersLocation = () => {
    return new Promise((resolve) => {
        waitForAllOptions('location', resolve);
    });
};
const animatePlayers = () => {
    return new Promise((resolve) => {
        updatePlayerLocation(resolve);
    });
};
const promptNextAction = () => {
    return new Promise((resolve) => {
        renderActions(resolve);
    });
};
const waitForPlayersActions = () => {
    return new Promise((resolve) => {
        waitForAllOptions('action', resolve);
    });
};
const applyActionEffects = () => {
    return new Promise((resolve) => {
        console.log('applyActionEffects');
        players.forEach(player => {
            console.log('#applyActionEffects', player.char);
            const nextAction = locationActions[player.location].find(action => action.name === player.nextChoice.action);
            resetPlayerChoice(player);
            nextAction.effect(player);
            updatePlayerCards();
            resolve();
        });
    });
};
const displayRewards = () => {
    return new Promise((resolve) => {
    });
};
const checkGameEnd = () => {
    return new Promise((resolve) => {
        return true;
    });
};
const mainLoop = () => {
    promptNextLocation()
        .then(waitForPlayersLocation)
        .then(animatePlayers)
        .then(promptNextAction)
        .then(waitForPlayersActions)
        .then(applyActionEffects)
        .then(mainLoop);
};
function gameStart() {
    createCardDecks();
    requestAnimationFrame(() => {
        const name = prompt('Your name?', `Anon${Math.round(100 + Math.random() * 899)}`);
        document.body.style.opacity = '1';
        renderMessages([WAITING]);
        joinGame(name);
    });
}
window.onkeypress = (event) => {
    const key = event.key;
    if ('12345'.includes(key)) {
        const buttons = document.querySelectorAll(`.options .btn`);
        const index = parseInt(key);
        if (index <= buttons.length) {
            setTimeout(() => {
                Array.from(buttons)[index - 1].onmousedown(null);
            }, 100);
        }
    }
};
const tinyFontData = {};
const letters = {
    "0": 0x7b6f,
    "2": 0x62a7,
    "3": 0x728e,
    "4": 0x4bc9,
    "5": 0x798e,
    "6": 0x69ef,
    "7": 0x7252,
    "8": 0x7aaf,
    "9": 0x7bcb,
    "*": 0xaa8,
    "-": 0x1c0,
    "a": 0x2b7d,
    "b": 0b111101110101111,
    "c": 0x7927,
    "d": 0x6b6e,
    "e": 0x79a7,
    "f": 0x79e4,
    "g": 0x796f,
    "h": 0x5bed,
    "i": 0x7497,
    "j": 0x726f,
    "k": 0x5bad,
    "l": 0x4927,
    "n": 0x6b6d,
    "o": 0x7b6f,
    "p": 0x7be4,
    "q": 0x7b66,
    "r": 0x6b75,
    "s": 0x79cf,
    "t": 0x7492,
    "u": 0x5b6f,
    "v": 0x5b6a,
    "x": 0x5aad,
    "y": 0x5aca,
    "z": 0x72a7,
};
const narrowLetters = {
    "1": 0b11111,
    ".": 0b00001,
    ",": 0b00011,
    "'": 0b11000,
    ":": 0b01010,
    "_": 0,
};
const wideLetters = {
    "m": 0xf9999,
    "w": 0x999f6,
};
const preRenderFont = (data, width) => {
    Object.keys(data).forEach(letter => {
        const pixels = ('000000000000000' + data[letter].toString(2)).substr(-5 * width).split('').map(bit => {
            if (bit === '1') {
                return '<i black></i>';
            }
            else {
                return '<i></i>';
            }
        }).join('');
        tinyFontData[`_${letter}`] = `<div class="letter w${width}">${pixels}</div>`;
    });
};
function initTinyFont() {
    preRenderFont(letters, 3);
    preRenderFont(wideLetters, 4);
    preRenderFont(narrowLetters, 1);
}
function scheduleTinyFontUpdate(selector = '.text') {
    document.querySelectorAll(selector).forEach(element => {
        if (element.children.length === 0) {
            const text = element.innerHTML;
            element.innerHTML = text.trim().split(' ').map(word => `<span class="word">
        ${word.split('').map(letter => {
                return tinyFontData[`_${letter.toLowerCase()}`];
            }).join('')}
      </span>`).join('');
        }
        element.classList.add('tiny-font');
    });
}
function applyTinyFont(selector = '.text') {
    if (!tinyFontData['_a'])
        return;
    requestAnimationFrame(() => scheduleTinyFontUpdate(selector));
}
window.onload = () => {
    initTinyFont();
    applyTinyFont();
    adjustUIScale();
    initClient();
    gameStart();
};
function shuffleArray(array) {
    for (let index = array.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * index);
        const temp = array[index];
        array[index] = array[randomIndex];
        array[randomIndex] = temp;
    }
}
