type LocationName = 'bank' | 'court' | 'temple' | 'eden' | 'hell';
type Character = 'devotee' | 'saint' | 'baal' | 'marx' | 'dissident'
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

interface LocationAction {
  name: string,
  labels: string[],
  options?: ActionOption[],
  targetPlayer?: boolean,
  effect: (player: Player) => void,
  disabled: (player: Player) => boolean,
  getMessage: (player: Player) => string
}

interface Game {
  players: Player[],
  time: number,
  locations: GameLocation[],
}

interface Action {
  index: number,
}

interface ButtonOption {
  html: string,
  title: string,
  disabled: boolean,
}

interface ActionOption {
  name: string,
  title?: string,
  effect: Function
}

type ChoiceType = 'location' | 'action' | 'option' | 'target'

// The number is the choice index
interface Choice {
  location?: number,
  action?: number,
  option?: number,
  target?: number
}
