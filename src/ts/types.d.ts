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

interface GameLocation {
  name: LocationName,
  players: Player[]
}

interface LocationOptions {
  name: string,
  labels: string[],
  effect: (player: Player) => void,
  disabled: (player: Player) => boolean,
}

interface Game {
  players: Player[],
  time: number,
  locations: GameLocation[],
}

interface Action {
  index: number,
}

interface Option {
  html: string,
  title: string,
  disabled: boolean,
}

interface CardOption {
  name: string,
  function?: Function
}

interface Card {
  name: string,
  label?: string,
  options?: CardOption[],
  choosePlayer?: boolean
}
