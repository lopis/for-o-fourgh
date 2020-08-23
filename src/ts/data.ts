/// <reference path="./strings.ts" />

const players: Player[] = []

const locations: GameLocation[] = [
  BANK,
  COURT,
  TEMPLE,
  EDEN,
  HELL,
].map((name: LocationName) => ({name: name, players: []}))

const locationActions: {[name: string]: LocationOptions[]} = {
  bank: [{
    name: 'Interest Return',
    labels: ['💰 + 💰 / 5 ⚜️'],
    effect: (player: Player) => {
      // Get 1 Gold + 1 Gold per each 5 Influence
      player.gold += 1 + Math.floor(player.influence / 5)
    },
    disabled: (player: Player) => false
  }],

  court: [
    {
      name: 'Draw Policy',
      labels: ['draw 1 📜'],
      effect: (player: Player) => {
        drawCard('policies')
      },
      disabled: (player: Player) => false
    },
    {
      name: 'Embezzlement',
      labels: ['-1 ⚜️', '+2 💰', , '+1 🏺'],
      effect: (player: Player) => {
        player.influence -= 1
        player.gold += 2
        player.relics += 1
      },
      disabled: (player: Player) => player.influence < 1
    }
  ],

  temple: [
    {
      name: 'Offering',
      labels: ['-1 🏺', '+3 ⚜️'],
      effect: (player: Player) => {
        player.influence += 3
        player.relics -= 1
      },
      disabled: (player: Player) => player.relics < 1
    },
    {
      name: 'Donation',
      labels: ['-1 💰', '+1 ⚜️'],
      effect: (player: Player) => {
        player.gold--
        player.influence++
      },
      disabled: (player: Player) => player.gold < 1
    }
  ],

  eden: [
    {
      name: 'Blessing',
      labels: ['draw 1 ✨'],
      effect: (player: Player) => {
        drawCard('blessings')
      },
      disabled: (player: Player) => false
    }
  ],

  hell: [
    {
      name: 'Wrath',
      labels: ['draw 1 💢'],
      effect: (player: Player) => {
        drawCard('damnations')
      },
      disabled: (player: Player) => false
    }
  ],
}

const decks: {[name: string]: Card[]}= {
  policies: [
    {
      name: 'Blackmail',
      label: 'Steal 5 💰 or 2 ⚜️ from player',
    },
    {
      name: 'Concession',
      label: 'Steal 1 relic',
      options: [
        {
          name: 'Player 2'
        },
        {
          name: 'Player 3'
        },
        {
          name: 'Player 4'
        },
        {
          name: 'Player 5'
        },
      ]
    },
    {
      name: 'Tax Reform',
      options: [
        {
          name: 'Tax the richest 2💰'
        },
        {
          name: 'Tax everyone 1💰'
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
          name: 'Keep'
        }
      ]
    }
  ],
  damnations: [
    {
      name: 'Deluge',
      label: 'Players on Earth -1⚜️'
    }
  ]
}


function updatePlayerLocation (resolve : Function) {
  players.forEach(player => {
    const prevLocation = locations.find(l => l.name === player.location)
    const nextLocation = locations.find(l => l.name === player.nextOption)
    if (prevLocation)
      prevLocation.players = prevLocation.players.filter(p => p.name !== player.name)

    if (nextLocation) {
      nextLocation.players.push(player)
      player.location = nextLocation.name
    } else {
      prevLocation.players.push(player)
      player.location = prevLocation.name
    }

    player.nextOption = null
  })
  renderPlayers();
  renderPlayerCards()

  resolve()
}


function shuffleArray (array: Array<any>) {
  for (let index = array.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * index)
    const temp = array[index]
    array[index] = array[randomIndex]
    array[randomIndex] = temp
  }
}


function createCardDecks () {
  Object.entries(decks).forEach(([name, deck]) => {
    let cards: HTMLElement[] = []
    deck.forEach((entry) => {
      for (let i = 0; i < CARD_COUNT; i++) {
        const card = document.createElement('div')
        card.className = 'card'
        card.innerHTML = `<div class="front"></div>
        <div class="back">
          <p>${entry.name}</p>
          <p>${entry.label}</p>
        </div>`

        cards.push(card)
      }

      console.log('cards', cards);

    })
    shuffleArray(cards)
    cards.forEach(card => document.querySelector(`.deck.${name}`).append(card))
  })
}

function drawCard (deckName : 'policies' | 'blessings' | 'damnations') {
  animateCardFlip(deckName)
}
