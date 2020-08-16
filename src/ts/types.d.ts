type LocationName = "bank" | "court" | "temple" | "eden" | "hell";
type Character = "devotee" | "saint" | "baal" | "marx" | "dissident"

interface Player {
  name: string,
  char: Character,
  gold: number,
  influence: number
  relics: number,
  nextOption: string | null,
  location: LocationName
}

interface Card {
  title: string,
}

interface GameLocation {
  name: LocationName,
  players: Player[]
}

interface Game {
  players: Player[],
  time: number,
  locations: GameLocation[],
}

interface Action {
  index: number,
}
