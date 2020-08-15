interface Player {
  name: string,
  gold: number,
  influence: number
  relics: number,
  nextOption: string,
  location: "bank" | "court" | "temple" | "eden" | "hell"
}

interface Card {
  title: string,
}

interface Location {
  name: string,
}

interface Game {
  players: Player[],
  time: number,
  locations: Location[],
}

interface Action {
  index: number,
}
