let pixelSize = 1

function renderButtons (
  title : string,
  options : ButtonOption[],
  type : ChoiceType,
  waitingTitle?: string
) {
  requestAnimationFrame(() => {
    document.querySelector('.actions .options').innerHTML = ''
    options.map((option, index) => {
      const button = document.createElement('div')
      button.innerHTML = option.html
      button.className = 'btn'

      if (!option.disabled) {
        button.onmousedown = () => {
          setPlayerChoice(index + 1, type)
          document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('pressed'))

          button.classList.add('pressed')
          if (waitingTitle) {
            document.querySelector('.actions .title').innerHTML = waitingTitle
            applyTinyFont('.actions .title')
          }
        }
      } else {
        button.classList.add('disabled')
      }
      document.querySelector('.actions .options').appendChild(button)
    })
    document.querySelector('.actions .title').innerHTML = title
    applyTinyFont('.actions .title')
  })
}

function renderMessages (messages: string[], dismissCallback?: Function, dismissText?: string) {
  document.querySelector('.actions .options').innerHTML = ''
  document.querySelector('.actions .title').innerHTML = messages.map(
    (message, index) => `<div class="${index > 0 ? 'message' : 'text'}">${message}</div>`
  ).join('')

  if (dismissCallback) {
    const button = document.createElement('div')
    button.innerHTML = dismissText
    button.className = 'btn text'
    button.onclick = () => dismissCallback()
    document.querySelector('.actions .options').appendChild(button)
  }

  applyTinyFont('.actions .text')
}

const CHAR_WIDTH = 4
const charPos: {[char: string]: {x: number, y: number}} = {}

function resetPlayerPosition (player: Player, index: number) {
  const $player: HTMLElement = document.querySelector(`.map .${player.char}`)
  let x, y
  if (players.indexOf(player) % 2 === 0) {
    x = -4 - (index * CHAR_WIDTH)
    y = 51
  } else {
    x = 68 + (index * CHAR_WIDTH)
    y = 51
  }
  charPos[player.char] = {x, y}
  $player.style.transform =
      `translateX(calc(var(--pixel-size) * ${x})) translateY(calc(var(--pixel-size) * ${y}))`
}

let renderingSemaphore = 0
function renderPlayers () {
  players.forEach((player: Player, index) => {
    renderingSemaphore++
    const $player : HTMLElement = document.querySelector(`.map .char.${player.char}`)
    const location = locations[player.location - 1]
    const locationName = location.name
    const $location : HTMLElement = document.querySelector(`.${locationName}`)

    let x = $location.offsetLeft / pixelSize
    let y = $location.offsetTop / pixelSize

    let playerIndex = location.players.indexOf(player)
    if ([COURT, HELL].includes(locationName)) {
      x -= (playerIndex) * (CHAR_WIDTH + 1)
    } else  if ([TEMPLE, PLAZA].includes(locationName)) {
      if (playerIndex % 2) {
        x += ((1 + playerIndex) / 2) * (CHAR_WIDTH + 1)
      } else {
        x -= (playerIndex / 2) * (CHAR_WIDTH + 1)
      }
    } else {
      x += (playerIndex) * (CHAR_WIDTH + 1)
    }

    const moveX = () => {
      const distance = charPos[player.char].x - x
      const duration = Math.abs(distance) * 30
      const steps = Math.round(Math.abs(distance) / 2)
      $player.style.transition = `transform ${duration}ms linear`
      $player.style.transitionTimingFunction = `steps(${steps})`
      $player.style.transform = $player.style.transform.replace(/translateX\(.+\) t/, `translateX(${x * pixelSize}px) t`)
      return duration
    }

    const moveY = () => {
      const distance = charPos[player.char].y - y
      const duration = Math.abs(distance) * 30
      const steps = Math.round(Math.abs(distance) / 2)
      $player.style.transition = `transform ${duration}ms linear`
      $player.style.transitionTimingFunction = `steps(${steps})`
      $player.style.transform = $player.style.transform.replace(/translateY\(.+\)/, `translateY(${y * pixelSize}px)`)
      return duration
    }

    $player.classList.add('animated')
    if (![TEMPLE].includes(locationName)) {
      setTimeout(() => {
        setTimeout(() => {
          $player.classList.remove('animated')
          charPos[player.char] = {x, y}
          renderingSemaphore--
        }, moveX() + 100)
      }, moveY() + 100)
    } else {
      setTimeout(() => {
        setTimeout(() => {
          $player.classList.remove('animated')
          charPos[player.char] = {x, y}
          renderingSemaphore--
        }, moveY() + 100)
      }, moveX() + 100)
    }
  })
}

function renderPlayerStats () {
  document.querySelector('.stats').innerHTML = players.map(
    player =>
    `<div class="player ${player.char}${player === localPlayer ? ' local' : ''}">
      <div class="avatar char ${player.char}"></div>
      <div>
        <div class="text gold">${player.stats.gold}</div>
        <div class="text relics">${player.stats.relics}</div>
        <div class="text influence">${player.stats.influence}</div>
      </div>
    </div>`
  ).join('')
  applyTinyFont()
}

function updatePlayerStats () {
  players.forEach(player => {
    document.querySelector(`.player.${player.char} .gold`).innerHTML = `${player.stats.gold}`
    document.querySelector(`.player.${player.char} .relics`).innerHTML = `${player.stats.relics}`
    document.querySelector(`.player.${player.char} .influence`).innerHTML = `${player.stats.influence}`
  })
  applyTinyFont()
}

function renderLocations () {
  renderButtons(
    'Go to',
    [...locations].splice(0,5).map(
      ({name, index}) => ({
        title: name,
        html: `${index}._${name}`,
        disabled: index === localPlayer.location
      })
    ),
    'location',
    WAITING
  )

  applyTinyFont('.btn')
}

function renderActions () {
  const location = localPlayer.location
  const locationName: LocationName = locations[location - 1].name
  const actions: LocationAction[] = locationActions[locationName]

  renderButtons('Choose an action', actions.map(
    (action, index) => ({
      title: action.name,
      disabled: action.disabled(localPlayer),
      html: `<div class="action-title">${index + 1}._${action.name}</div>
        <div class="labels">${action.labels.map(label => `<div>${label}</div>`).join('')}</div>`
    })
  ), 'action')
  applyTinyFont('.action-title')
}

function renderOptions (options: ActionOption[]) {
  renderButtons(`Choose an option`, options.map(
    (option: ActionOption, index: number) => ({
      title: option.name,
      disabled: false,
      html: `<div class="action-title">${index + 1}._${option.name}</div>
      <div class="labels">${option.labels.map(label => `<div>${label}</div>`).join('')}</div>`
    })
  ), 'option')
  applyTinyFont('.action-title')
}

function renderTargetPlayers () {
  renderButtons('Choose target player', players.filter(p => p !== localPlayer).map(
    (player: Player, index: number) => ({
      title: '',
      disabled: false,
      html: `<div class="action-title">${player.name}</div><div class="char ${player.char}"></div>`,
    })
  ), 'target')
  applyTinyFont('.action-title')
}

function adjustUIScale () {
  const updatePixelSize = () => {
    const smallestSize = Math.min(
      document.documentElement.clientHeight,
      document.documentElement.clientWidth - 150
    )

    pixelSize = 2 * Math.round(smallestSize / 220)
    document.body.style.setProperty('--pixel-size', `${pixelSize}px`)
  }

  window.onresize = updatePixelSize
  updatePixelSize()
}
