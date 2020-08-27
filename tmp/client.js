const CARD_COUNT = 5;
const CARD_TIMEOUT = 5000;
const BANK = 'bank';
const COURT = 'court';
const TEMPLE = 'temple';
const EDEN = 'eden';
const HELL = 'hell';
const GOLD = 'gold';
const INFLUENCE = 'influence';
const RELICS = 'relics';
const players = [];
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
            effect: (player) => {
                player.gold += 1 + Math.floor(player.influence / 5);
            },
            disabled: (player) => false
        }],
    court: [
        {
            name: 'Draw Policy',
            labels: ['draw 1 📜'],
            effect: (player) => {
                drawCard('policies');
            },
            disabled: (player) => false
        },
        {
            name: 'Embezzlement',
            labels: ['-1 ⚜️', '+2 💰', , '+1 🏺'],
            effect: (player) => {
                player.influence -= 1;
                player.gold += 2;
                player.relics += 1;
            },
            disabled: (player) => player.influence < 1
        }
    ],
    temple: [
        {
            name: 'Offering',
            labels: ['-1 🏺', '+3 ⚜️'],
            effect: (player) => {
                player.influence += 3;
                player.relics -= 1;
            },
            disabled: (player) => player.relics < 1
        },
        {
            name: 'Donation',
            labels: ['-1 💰', '+1 ⚜️'],
            effect: (player) => {
                player.gold--;
                player.influence++;
            },
            disabled: (player) => player.gold < 1
        },
        {
            name: 'Skip',
            labels: ['🙏'],
            effect: () => { },
            disabled: () => false,
        }
    ],
    eden: [
        {
            name: 'Blessing',
            labels: ['draw 1 ✨'],
            effect: (player) => {
                drawCard('blessings');
            },
            disabled: (player) => false
        }
    ],
    hell: [
        {
            name: 'Wrath',
            labels: ['draw 1 💢'],
            effect: (player) => {
                drawCard('damnations');
            },
            disabled: (player) => false
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
        const nextLocation = locations.find(l => l.name === player.nextOption);
        if (prevLocation)
            prevLocation.players = prevLocation.players.filter(p => p.name !== player.name);
        if (nextLocation) {
            nextLocation.players.push(player);
            player.location = nextLocation.name;
        }
        else {
            prevLocation.players.push(player);
            player.location = prevLocation.name;
        }
        player.nextOption = null;
    });
    renderPlayers();
    renderPlayerCards();
    resolve();
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
function showOptions(title, options) {
    document.querySelector('.actions .options').innerHTML = '';
    options.map(option => {
        const button = document.createElement('div');
        button.innerHTML = option.html;
        button.className = 'btn';
        if (!option.disabled) {
            button.onclick = () => {
                players[0].nextOption = option.title;
            };
        }
        else {
            button.classList.add('disabled');
        }
        document.querySelector('.actions .options').appendChild(button);
    });
    document.querySelector('.actions .title').innerHTML = title;
    applyTinyFont('.actions .title');
}
function renderPlayers() {
    locations.forEach(location => {
        location.players.forEach(player => {
            document.querySelector(`.${location.name}`).appendChild(document.querySelector(`.map .char.${player.char}`));
        });
    });
}
function renderPlayerCards() {
    document.querySelector('.stats').innerHTML = players.map(player => `<div class="player">
      <div class="avatar char ${player.char}"></div>
      <div>
        <div class="text gold">${player.gold}</div>
        <div class="text relics">${player.relics}</div>
        <div class="text influence">${player.influence}</div>
      <div>
    </div>`).join('');
    applyTinyFont();
}
function updatePlayerCards() {
    players.forEach(player => {
        document.querySelector('.player .gold').innerHTML = `${player.gold}`;
        document.querySelector('.player .relics').innerHTML = `${player.relics}`;
        document.querySelector('.player .influence').innerHTML = `${player.influence}`;
    });
    applyTinyFont();
}
function renderActions(resolvePromise) {
    const location = players[0].location;
    const actions = locationActions[location];
    console.log('Render actions', actions);
    showOptions('Choose an action', actions.map((action, index) => ({
        title: action.name,
        disabled: action.disabled(players[0]),
        html: `<div class="action-title">${index + 1}._${action.name}</div>
        <div class="labels">${action.labels.map(label => `<div>${label}</div>`).join('')}</div>`
    })));
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
}
const promptNextLocation = () => {
    return new Promise((resolve) => {
        showOptions('Go to', [BANK, COURT, TEMPLE, EDEN, HELL]
            .map((location, idx) => ({
            title: location,
            html: `${idx + 1}._${location}`,
            disabled: location === players[0].location
        })));
        applyTinyFont('.btn');
        resolve();
    });
};
const waitForAllOptions = (resolvePromise) => {
    if (players.every(player => player.nextOption)) {
        resolvePromise();
    }
    else {
        requestAnimationFrame(() => waitForAllOptions(resolvePromise));
    }
};
const waitForPlayersLocation = () => {
    return new Promise((resolve) => {
        waitForAllOptions(resolve);
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
        waitForAllOptions(resolve);
    });
};
const applyActionEffects = () => {
    return new Promise((resolve) => {
        players.forEach(player => {
            const nextAction = locationActions[player.location].find(action => action.name === player.nextOption);
            player.nextOption = null;
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
    players.push({
        name: 'Player',
        char: 'baal',
        gold: 1,
        influence: 0,
        relics: 0,
        nextOption: null,
        location: BANK
    });
    createCardDecks();
    updatePlayerLocation(mainLoop);
}
window.onkeypress = (event) => {
    const key = event.key;
    if ('12345'.includes(key)) {
        const buttons = document.querySelectorAll(`.options .btn`);
        const index = parseInt(key);
        console.log('click', index);
        if (index <= buttons.length) {
            Array.from(buttons)[index - 1].classList.add('pressed');
            setTimeout(() => {
                Array.from(buttons)[index - 1].click();
            }, 200);
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
function applyTinyFont(selector = '.text') {
    if (!tinyFontData['_a'])
        return;
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
window.onload = () => {
    initTinyFont();
    applyTinyFont();
    gameStart();
    adjustUIScale();
};
function shuffleArray(array) {
    for (let index = array.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * index);
        const temp = array[index];
        array[index] = array[randomIndex];
        array[randomIndex] = temp;
    }
}
