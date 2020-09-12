/// <reference path="./strings.ts" />

let players: Player[] = []
let localPlayer: Player = null
let playerStats: {[playerId: string]: PlayerStats} = {}
let gameState: GameState = 'lobby'
let round = 0

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

      return `${player.name} earned ${1 + Math.floor(player.stats.influence / 5)} gold from interest.`
    },
    disabled: (player: Player) => false,
  }],

  court: [
    {
      name: 'Tax Reform',
      labels: ['Tax rich or all?'],
      options: [
        {
          name: 'Tax Richest',
          labels: ['Richest 👤 -20% 💰'],
          effect (player: Player) {
            const sortedArray: Player[] = [...players].sort(
              (a: Player, b: Player) => {
                return a.stats.gold > b.stats.gold ? 1
                  : a.stats.gold < b.stats.gold ? -1
                  : 0
              }
            )
            const richestPlayer = sortedArray.pop()
            const tax = Math.ceil(richestPlayer.stats.gold * 0.20)
            richestPlayer.stats.gold -= tax

            player.nextChoice.target = players.findIndex(player => player === richestPlayer)

            return `Player ${richestPlayer.name} was taxed ${tax} 💰 by player ${player.name}`
          }
        },
        {
          name: 'Tax all',
          labels: ['All players -10% 💰'],
          effect (player: Player) {
            players.forEach(player => {
              const tax = Math.ceil(player.stats.gold * 0.10)
              player.stats.gold -= tax
            })

            return `Each player was taxed 10% 💰 by player ${player.name}`
          }
        }
      ],
      effect (player: Player, action: LocationAction) {
        const option = action.options[player.nextChoice.option - 1]
        if (!option) {
          console.error('option not found', player.nextChoice.option, player);
        }
        return option.effect(player)
      },
      disabled: () => false,
    },
    {
      name: 'Embezzlement',
      labels: ['-1 ⚜️', '+2 💰', , '+1 🏺'],
      effect (player: Player) {
        player.stats.influence -= 1
        player.stats.gold += 2
        player.stats.relics += 1
        return `${player.name} embezzled gold and relics.`
      },
      disabled: (player: Player) => player.stats.influence < 1,
    }
  ],

  temple: [
    {
      name: 'Offering',
      labels: ['-1 🏺', '+3 ⚜️'],
      effect (player: Player) {
        player.stats.influence += 3
        player.stats.relics -= 1
        return `${player.name} donated a relic to the temple`
      },
      disabled: (player: Player) => player.stats.relics < 1,
    },
    {
      name: 'Donation',
      labels: ['-1 💰', '+1 ⚜️'],
      effect (player: Player) {
        player.stats.gold--
        player.stats.influence++
        return `${player.name} made a gold donation to the temple`
      },
      disabled: (player: Player) => player.stats.gold < 1,
    },
    {
      name: 'Pray',
      labels: ['🙏'],
      effect (player: Player) {
        player.stats.prayCount++
        return `${player.name} is praying at the temple`
      },
      disabled: () => false,
    }
  ],

  eden: [
    {
      name: 'Blessing',
      labels: ['Random Blessing'],
      effect (player: Player) {
        return `${player.name} was blessed`
      },
      disabled: () => false,
    },
    {
      name: 'Enlightenment',
      labels: ['Get 1 ⚜️ per Pray 🙏'],
      effect (player: Player) {
        player.stats.influence += player.stats.prayCount
        return `${player.name} received enlightenment: ${player.stats.prayCount} ⚜️`
      },
      disabled: () => false,
    },
    {
      name: 'Judgement',
      labels: ['no pray = -1 ⚜️'],
      effect (player: Player) {
        const noPrayers = players.filter(player => player.stats.prayCount == 0)
        noPrayers.map(player => player.stats.influence--)

        return `${noPrayers.map(p=>p.name).join(', ')} received judgement from not praying: -1 ⚜️`
      },
      disabled: () => false,
    },
  ],

  hell: [
    {
      name: 'Wrath',
      labels: ['-2 ⚜️ per sin'],
      effect (player: Player) {
        players.filter(p => p !== player).map(p => {
          p.stats.influence -= player.stats.sinCount * 2
        })
        return `${player.name} caused non-prayers to lose ⚜️`
      },
      disabled: () => false,
    },
    {
      name: 'Deluge',
      labels: ['Players on Earth -1 💰/🏺', '+1 💰/🏺 otherwise'],
      effect (player: Player) {
        return `${player.name} caused a damnation`
      },
      disabled: () => false,
    },
    {
      name: 'Temptation',
      labels: ['Cause player to sin'],
      targetPlayer: true,
      effect (player: Player) {
        const targetPlayer = players[player.nextChoice.target - 1]
        const sinName = Object.keys(sinsData)[round % 7] as SinName
        sinsData[sinName](targetPlayer)

        return `${player.name} made player ${targetPlayer.name} commit the sin of ${sinName}`
      },
      disabled: () => false,
    }
  ],
}

const sinsData: {[sin in SinName]: (player: Player) => void} = {
  lust (player: Player) {
    // Drag player to Hell. +1⚜️, -1💰
    player.stats.sinCount++
    // TODO: implement effect
  },
  gluttony (player: Player) {
    // All players lose 1 🏺; player gets 1 🏺
    player.stats.sinCount++
    // TODO: implement effect
  },
  greed (player: Player) {
    // All players lose 1 💰; player gets 2 💰
    player.stats.sinCount++
    // TODO: implement effect
  },
  sloth (player: Player) {
    // prayer pray count = 0;
    player.stats.sinCount++
    // TODO: implement effect
  },
  wrath (player: Player) {
    // target loses 2 ⚜️
  },
  envy (player: Player) {
    // All players lose 1 💰/🏺;
    player.stats.sinCount++
    // TODO: implement effect
  },
  pride (player: Player) {
    // All players lose 1 ⚜️
    player.stats.sinCount++
    // TODO: implement effect
  }
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
