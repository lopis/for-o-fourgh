/// <reference path="./strings.ts" />

const players: Player[] = []

const locations: GameLocation[] = [
  BANK,
  COURT,
  TEMPLE,
  EDEN,
  HELL,
].map((name: LocationName) => ({name: name, players: []}))


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
  resolve()
}
