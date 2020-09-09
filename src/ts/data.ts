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
    disabled: (player: Player) => false,
    getMessage (player: Player) {
      return `got ${1 + Math.floor(player.stats.influence / 5)} gold from interest.`
    }
  }],

  court: [
    {
      name: 'Tax Reform',
      labels: ['Tax rich or all?'],
      options: [
        {
          name: 'Tax Richest',
          title: 'Richest 👤 -2💰',
          effect (player: Player) {
            const sortedArray: Player[] = [...players].sort(
              (a: Player, b: Player) => {
                return a.stats.gold > b.stats.gold ? 1
                  : a.stats.gold < b.stats.gold ? -1
                  : 0
              }
            )
            const richestPlayer = sortedArray.pop()
            richestPlayer.stats.gold -= 2

            player.nextChoice.target = players.findIndex(player => player === richestPlayer)
          }
        },
        {
          name: 'Tax all 👥 </br> 1💰',
          title: 'All players -1💰',
          effect () {
            players.forEach(player => {
              player.stats.gold--
            })
            renderMessages([
              `Each player was taxed 1💰`
            ])
          }
        }
      ],
      effect (player: Player) {

      },
      disabled: () => false,
      getMessage (player: Player) {
        return `Player ${player.nextChoice.target}`
      }
    },
    {
      name: 'Embezzlement',
      labels: ['-1 ⚜️', '+2 💰', , '+1 🏺'],
      effect (player: Player) {
        player.stats.influence -= 1
        player.stats.gold += 2
        player.stats.relics += 1
      },
      disabled: (player: Player) => player.stats.influence < 1,
      getMessage () {
        return 'embezzled gold and relics.'
      }
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
      disabled: (player: Player) => player.stats.relics < 1,
      getMessage () {
        return 'donated a relic to the temple'
      }
    },
    {
      name: 'Donation',
      labels: ['-1 💰', '+1 ⚜️'],
      effect (player: Player) {
        player.stats.gold--
        player.stats.influence++
      },
      disabled: (player: Player) => player.stats.gold < 1,
      getMessage () {
        return 'made a gold donation to the temple'
      }
    },
    {
      name: 'Skip',
      labels: ['🙏'],
      effect () {},
      disabled: () => false,
      getMessage () {
        return 'is praying at the temple'
      }
    }
  ],

  eden: [
    {
      name: 'Blessing',
      labels: ['Random Blessing'],
      effect (player: Player) {
        // TODO: apply effect of the action+option+player choice
      },
      disabled: () => false,
      getMessage (player: Player) {
        return 'not implemented'
      }
    }
  ],

  hell: [
    {
      name: 'Wrath',
      labels: ['Random damnation'],
      effect (player: Player) {
        // TODO: apply effect of the action+option+player choice
      },
      disabled: () => false,
      getMessage (player: Player) {
        return 'not implemented'
      }
    }
  ],
}

// const decks = {
//   policies: [
//     {
//       name: 'Blackmail',
//       label: 'Steal 5 💰 or 2 ⚜️ from player',
//     },
//     {
//       name: 'Lawsuit',
//       label: 'Steal 1 relic',
//       choosePlayer: true
//     },
//     {
//       name: 'Tax Reform',
//       options: [
//         {
//           name: 'Tax richest </br> 2💰',
//           title: 'Tax richest player',
//           effect () {
//             const sortedArray = [...players].sort(
//               (a: Player, b: Player) => {
//                 return a.stats.gold > b.stats.gold ? 1
//                   : a.stats.gold < b.stats.gold ? -1
//                   : 0
//               }
//             )
//             const richestPlayer = sortedArray.pop()
//             richestPlayer.stats.gold -= 2
//             renderMessages([
//               `Player ${richestPlayer.name} was taxed 2💰`
//             ])
//           }
//         },
//         {
//           name: 'Tax all 👥 </br> 1💰',
//           title: 'Tax all players',
//           effect () {
//             players.forEach(player => {
//               player.stats.gold--
//             })
//             renderMessages([
//               `Each player was taxed 1💰`
//             ])
//           }
//         }
//       ]
//     }
//   ],
//   blessings: [
//     {
//       name: 'Ancient Relic',
//       options: [
//         {
//           name: 'Sell +1 💰',
//           title: 'Sell Relic',
//           effect (player: Player) {
//             player.stats.gold++
//           }
//         },
//         {
//           name: 'Keep + 1 🏺',
//           title: 'Keep Relic',
//           effect (player: Player) {
//             player.stats.relics++
//           }
//         }
//       ]
//     },
//     {
//       name: 'Divine Sanction',
//       label: 'Players on Temple/Sky +1⚜️',
//       message: '+1 influence to players on temple or sky'
//     },
//     {
//       name: 'Judgement',
//       label: '👤 on Eden +2⚜️ <br>👤 on Hell -2⚜️',
//       message: '+2 influence to players in Eden, -2 in Hell'
//     }
//   ],
//   damnations: [
//     {
//       name: 'Deluge',
//       label: 'Players on Earth -1⚜️',
//       message: '-1 influence to players on earth'
//     }
//   ]
// }

// const locationDecks: {[name in LocationName]: DeckName} = {
//   bank: null,
//   temple: null,
//   court: 'policies',
//   eden: 'blessings',
//   hell: 'damnations'
// }

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
  renderPlayerStats()
  submitMove()
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
