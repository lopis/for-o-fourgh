/// <reference path="./strings.ts" />

let players: Player[] = []
let localPlayer: Player = null
let playerStats: {[playerId: string]: PlayerStats} = {}
let gameState: GameState = 'lobby'
let cards: {[deckName: string]: Card[]} = {}

const locations: GameLocation[] = [
  BANK,
  COURT,
  TEMPLE,
  EDEN,
  HELL,
  PLAZA,
].map((name: LocationName, index: number) => ({index: index+1, name, players: []}))

const locationActions: {[name in LocationName]: LocationAction[]} = {
  bank: [{
    name: 'Interest Return',
    labels: ['💰 + 💰 / 5 ⚜️'],
    effect (player: Player) {
      // Get 1 Gold + 1 Gold per each 5 Influence
      player.stats.gold += 1 + Math.floor(player.stats.influence / 5)
    },
    disabled: (player: Player) => false
  }],

  court: [
    {
      name: 'Draw Policy',
      labels: ['get card', '📜'],
      isCard: true,
      effect (player: Player) {
        // TODO: apply effect of the action+option+player choice
      },
      disabled: (player: Player) => false
    },
    {
      name: 'Embezzlement',
      labels: ['-1 ⚜️', '+2 💰', , '+1 🏺'],
      effect (player: Player) {
        player.stats.influence -= 1
        player.stats.gold += 2
        player.stats.relics += 1
      },
      disabled: (player: Player) => player.stats.influence < 1
    }
  ],

  temple: [
    {
      name: 'Offering',
      labels: ['-1 🏺', '+3 ⚜️'],
      effect (player: Player) {
        player.stats.influence += 3
        player.stats.relics -= 1
      },
      disabled: (player: Player) => player.stats.relics < 1
    },
    {
      name: 'Donation',
      labels: ['-1 💰', '+1 ⚜️'],
      effect (player: Player) {
        player.stats.gold--
        player.stats.influence++
      },
      disabled: (player: Player) => player.stats.gold < 1
    },
    {
      name: 'Skip',
      labels: ['🙏'],
      effect () {},
      disabled: () => false,
    }
  ],

  eden: [
    {
      name: 'Blessing',
      labels: ['get card', '✨'],
      isCard: true,
      effect (player: Player) {
        // TODO: apply effect of the action+option+player choice
      },
      disabled: () => false
    }
  ],

  hell: [
    {
      name: 'Wrath',
      labels: ['get card', '💢'],
      isCard: true,
      effect (player: Player) {
        // TODO: apply effect of the action+option+player choice
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
      name: 'Lawsuit',
      label: 'Steal 1 relic',
      choosePlayer: true
    },
    {
      name: 'Tax Reform',
      options: [
        {
          name: 'Tax richest </br> 2💰',
          title: 'Tax richest player',
          effect () {
            const sortedArray = [...players].sort(
              (a: Player, b: Player) => {
                return a.stats.gold > b.stats.gold ? 1
                  : a.stats.gold < b.stats.gold ? -1
                  : 0
              }
            )
            const richestPlayer = sortedArray.pop()
            richestPlayer.stats.gold -= 2
            renderMessages([
              `Player ${richestPlayer.name} was taxed 2💰`
            ])
          }
        },
        {
          name: 'Tax all 👥 </br> 1💰',
          title: 'Tax all players',
          effect () {
            players.forEach(player => {
              player.stats.gold--
            })
            renderMessages([
              `Each player was taxed 1💰`
            ])
          }
        }
      ]
    }
  ],
  blessings: [
    {
      name: 'Ancient Relic',
      options: [
        {
          name: 'Sell +1 💰',
          title: 'Sell Relic',
          effect (player: Player) {
            player.stats.gold++
          }
        },
        {
          name: 'Keep + 1 🏺',
          title: 'Keep Relic',
          effect (player: Player) {
            player.stats.relics++
          }
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

const locationDecks: {[name in LocationName]: DeckName} = {
  bank: null,
  temple: null,
  court: 'policies',
  eden: 'blessings',
  hell: 'damnations'
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
  Object.entries(decks).forEach(([deckName, deck], index) => {
    cards[deckName] = []
    deck.forEach((card) => {
      // Adds same card multiple times
      for (let i = 0; i < CARD_COUNT; i++) {
        cards[deckName].push({...card})
      }
    })
    shuffleArray(cards[deckName])

    cards[deckName].forEach((card) => renderCard(card, deckName as DeckName, index))
  })
}

function getCard (deckName : DeckName): Card {
  return cards[deckName].pop()
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
}
