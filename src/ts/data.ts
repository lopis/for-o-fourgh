/// <reference path="./strings.ts" />

let players: Player[] = []
let localPlayer: Player = null
let playerStats: {[playerId: string]: PlayerStats} = {}
let gameState: GameState = 'lobby'

const locations: GameLocation[] = [
  BANK,
  COURT,
  TEMPLE,
  EDEN,
  HELL,
].map((name: LocationName, index: number) => ({index: index+1, name, players: []}))

const locationActions: {[name in LocationName]: LocationOption[]} = {
  bank: [{
    name: 'Interest Return',
    labels: ['💰 + 💰 / 5 ⚜️'],
    effect(player: Player) {
      // Get 1 Gold + 1 Gold per each 5 Influence
      player.stats.gold += 1 + Math.floor(player.stats.influence / 5)
    },
    disabled: () => false
  }],

  court: [
    {
      name: 'Draw Policy',
      labels: ['draw 1 📜'],
      effect(player: Player) {
        drawCard('policies')
      },
      disabled: () => false
    },
    {
      name: 'Embezzlement',
      labels: ['-1 ⚜️', '+2 💰', , '+1 🏺'],
      effect(player: Player) {
        player.stats.influence -= 1
        player.stats.gold += 2
        player.stats.relics += 1
      },
      disabled: () => localPlayer.stats.influence < 1
    }
  ],

  temple: [
    {
      name: 'Offering',
      labels: ['-1 🏺', '+3 ⚜️'],
      effect(player: Player) {
        player.stats.influence += 3
        player.stats.relics -= 1
      },
      disabled: () => localPlayer.stats.relics < 1
    },
    {
      name: 'Donation',
      labels: ['-1 💰', '+1 ⚜️'],
      effect(player: Player) {
        player.stats.gold--
        player.stats.influence++
      },
      disabled: () => localPlayer.stats.gold < 1
    },
    {
      name: 'Skip',
      labels: ['🙏'],
      effect(player: Player) {},
      disabled: () => false,
    }
  ],

  eden: [
    {
      name: 'Blessing',
      labels: ['draw 1 ✨'],
      effect(player: Player) {
        drawCard('blessings')
      },
      disabled: () => false
    }
  ],

  hell: [
    {
      name: 'Wrath',
      labels: ['draw 1 💢'],
      effect(player: Player) {
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

function updatePlayerLocation () {
  players.forEach(player => {
    const prevLocation: GameLocation = locations[player.location - 1]
    const nextLocation: GameLocation = locations[player.nextChoice.location - 1]

    if (nextLocation) {
      if (prevLocation) {
        prevLocation.players = prevLocation.players.filter(p => p.name !== player.name)
      }
      nextLocation.players.push(player)
      player.location = locations.indexOf(nextLocation) + 1
    } else if (prevLocation) {
      prevLocation.players.push(player)
      player.location = locations.indexOf(prevLocation) + 1
    }

    resetPlayerChoice(player)
  })
  renderPlayers()
  renderPlayerCards()
  submitMove()
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

function setPlayerChoice (optionIndex: number, type: ChoiceType) {
  localPlayer.nextChoice[type] = optionIndex
  submitPlayerChoice(localPlayer.nextChoice)
}
