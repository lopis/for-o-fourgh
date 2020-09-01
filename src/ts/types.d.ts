type LocationName = 'bank' | 'court' | 'temple' | 'eden' | 'hell';
type Character = 'devotee' | 'saint' | 'baal' | 'marx' | 'dissident'
type DeckName = 'policies' | 'blessings' | 'damnations'

interface Player {
  name: string,
  id: string,
  char: Character,
  stats: PlayerStats,
  nextChoice: Choice,
  location: LocationName
}

interface PlayerStats {
  gold: number,
  influence: number
  relics: number,
}

interface GameLocation {
  name: LocationName,
  players: Player[]
}

interface LocationOptions {
  name: string,
  labels: string[],
  effect: () => void,
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
interface Choice {
  location?: string,
  action?: string,
  option?: string,
  target?: string
}
