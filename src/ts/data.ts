/// <reference path="./strings.ts" />

let players: Player[] = []
let localPlayer: Player = null
let playerStats: {[playerId: string]: PlayerStats} = {}

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
    effect: () => {
      // Get 1 Gold + 1 Gold per each 5 Influence
      localPlayer.stats.gold += 1 + Math.floor(localPlayer.stats.influence / 5)
    },
    disabled: () => false
  }],

  court: [
    {
      name: 'Draw Policy',
      labels: ['draw 1 📜'],
      effect: () => {
        drawCard('policies')
      },
      disabled: () => false
    },
    {
      name: 'Embezzlement',
      labels: ['-1 ⚜️', '+2 💰', , '+1 🏺'],
      effect: () => {
        localPlayer.stats.influence -= 1
        localPlayer.stats.gold += 2
        localPlayer.stats.relics += 1
      },
      disabled: () => localPlayer.stats.influence < 1
    }
  ],

  temple: [
    {
      name: 'Offering',
      labels: ['-1 🏺', '+3 ⚜️'],
      effect: () => {
        localPlayer.stats.influence += 3
        localPlayer.stats.relics -= 1
      },
      disabled: () => localPlayer.stats.relics < 1
    },
    {
      name: 'Donation',
      labels: ['-1 💰', '+1 ⚜️'],
      effect: () => {
        localPlayer.stats.gold--
        localPlayer.stats.influence++
      },
      disabled: () => localPlayer.stats.gold < 1
    },
    {
      name: 'Skip',
      labels: ['🙏'],
      effect: () => {},
      disabled: () => false,
    }
  ],

  eden: [
    {
      name: 'Blessing',
      labels: ['draw 1 ✨'],
      effect: () => {
        drawCard('blessings')
      },
      disabled: () => false
    }
  ],

  hell: [
    {
      name: 'Wrath',
      labels: ['draw 1 💢'],
      effect: () => {
        drawCard('damnations')
      },
      disabled: () => false
    }
  ],
}

const decks: {[name in DeckName]: Card[]}= {
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
}

function updatePlayerLocation (resolve?: Function) {
  players.forEach(player => {
    const prevLocation = locations.find(l => l.name === player.location)
    const nextLocation = locations.find(l => l.name === player.nextChoice.location)

    if (nextLocation) {
      if (prevLocation) {
        prevLocation.players = prevLocation.players.filter(p => p.name !== player.name)
      }
      nextLocation.players.push(player)
      player.location = nextLocation.name
    } else if (prevLocation) {
      prevLocation.players.push(player)
      player.location = prevLocation.name
    }

    resetPlayerChoice(player)
  })
  renderPlayers()
  renderPlayerCards()
  submitMove()

  resolve && resolve()
}

function createCardDecks () {
  Object.entries(decks).forEach(([deckName, deck]) => {
    let cards: Card[] = []
    deck.forEach((card) => {
      // Adds same card multiple times
      for (let i = 0; i < CARD_COUNT; i++) {
        cards.push({...card})
      }
    })
    shuffleArray(cards)

    cards.forEach((card) => renderCard(card, deckName as DeckName))
  })
}

function drawCard (deckName : DeckName) {
  animateCardFlip(deckName)
}


function resetPlayerChoice (player: Player) {
  player.nextChoice = {
    location: null,
    action: null,
    option: null,
    target: null,
  }
}

function setPlayerChoice (option: string, type: ChoiceType) {
  localPlayer.nextChoice[type] = option
  submitPlayerChoice(localPlayer.nextChoice)
}
