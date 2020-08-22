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
      labels: ['draw 1 🏛'],
      effect: (player: Player) => {
        console.log('not implemented', 'player drew a policy card');
      },
      disabled: (player: Player) => false
    },
    {
      name: 'Embezzlement',
      labels: ['+1 🏺', '-2 💰'],
      effect: (player: Player) => {
        console.log('not implemented', 'player gets 1 relic');
      },
      disabled: (player: Player) => player.gold < 2
    }
  ],

  temple: [
    {
      name: 'Offering',
      labels: ['+3 ⚜️', '-1 🏺'],
      effect: (player: Player) => {
        console.log('not implemented', 'player offers 1 relic for 3 influence');
      },
      disabled: (player: Player) => player.relics < 1
    },
    {
      name: 'Donation',
      labels: ['-1 💰','+1 ⚜️'],
      effect: (player: Player) => {
        console.log('not implemented', 'player donates 1 gold for 1 influence');
      },
      disabled: (player: Player) => player.gold < 1
    }
  ],

  eden: [
    {
      name: 'Blessing',
      labels: ['draw 1 ✨'],
      effect: (player: Player) => {
        console.log('not implemented', 'player draws a blessing card');
      },
      disabled: (player: Player) => false
    }
  ],

  hell: [
    {
      name: 'Wrath',
      labels: ['draw 1 🌊'],
      effect: (player: Player) => {
        console.log('not implemented', 'player draws a damnation card');
      },
      disabled: (player: Player) => false
    }
  ],
}

const policy = [
  {
    name: 'Blackmail'
  }
]

const blessings = [
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
]

const damnations = [
  {
    name: 'Deluge',
    label: 'Players on Earth -1⚜️'
  }
]


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
