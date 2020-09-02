type LocationName = 'bank' | 'court' | 'temple' | 'eden' | 'hell';
type Character = 'devotee' | 'saint' | 'baal' | 'marx' | 'dissident'
type DeckName = 'policies' | 'blessings' | 'damnations'
type GameState = 'lobby' | 'start' | 'end'

interface Player {
  name: string,
  id: string,
  char: Character,
  stats: PlayerStats,
  nextChoice: Choice,
  location: number, // Location Index
}

interface PlayerStats {
  gold: number,
  influence: number
  relics: number,
}

interface GameLocation {
  index: number,
  name: LocationName,
  players: Player[]
}

interface LocationOption {
  name: string,
  labels: string[],
  effect: (player: Player) => void,
  disabled: () => boolean,
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

type ChoiceType = 'location' | 'action' | 'option' | 'target'

// The number is the choice index
interface Choice {
  location?: number,
  action?: number,
  option?: number,
  target?: number
}
