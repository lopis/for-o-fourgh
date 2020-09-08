let pixelSize = 1

function renderButtons (
  title : string,
  options : Option[],
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

function renderMessages (messages: string[]) {
  document.querySelector('.actions .options').innerHTML = ''
  document.querySelector('.actions .title').innerHTML = messages.map(
    message => `<div class="text">${message}</div>`
  ).join('')
  applyTinyFont('.actions .text')
}

const CHAR_WIDTH = 4
const charPos: {[char: string]: {x: number, y: number}} = {}

function resetPlayerPosition (player: Player) {
  const $player: HTMLElement = document.querySelector(`.map .${player.char}`)
  let x, y
  if (players.indexOf(player) % 2) {
    x = -10
    y = 51
  } else {
    x = 64
    y = 51
  }
  charPos[player.char] = {x, y}
  $player.style.transform =
      `translateX(calc(var(--pixel-size) * ${x})) translateY(calc(var(--pixel-size) * ${y}))`
}


function renderPlayers () {
  players.forEach((player: Player, index) => {
    const $player : HTMLElement = document.querySelector(`.map .char.${player.char}`)
    const location = locations[player.location - 1]
    const locationName = location.name
    const $location : HTMLElement = document.querySelector(`.${locationName}`)

    let x = $location.offsetLeft
    let y = $location.offsetTop

    let playerIndex = location.players.indexOf(player)
    if ([COURT, HELL].includes(locationName)) {
      x -= (location.players.length - playerIndex) * ($player.clientWidth + pixelSize)
    } else  if ([TEMPLE, PLAZA].includes(locationName)) {
      x -= $player.clientWidth
      if (playerIndex % 2) {
        x -= (playerIndex / 2) * ($player.clientWidth + pixelSize)
      } else {
        x += ((1 + playerIndex) / 2) * ($player.clientWidth + pixelSize)
      }
    } else {
      x += (playerIndex) * ($player.clientWidth + pixelSize)
    }

    // const steps = {
    //   x: Math.round(x / (pixelSize * 2)),
    //   y: Math.round(y / (pixelSize * 2)),
    // }
    // const duration = {
    //   x: steps.x * 100,
    //   y: steps.y * 100
    // }

    const moveX = () => {
      // $player.style.transition = `transform ${duration.x}ms linear`
      // $player.style.transitionTimingFunction = `steps(${steps.x})`
      $player.style.transform = $player.style.transform.replace(/translateX\(.+\) t/, `translateX(${x}px) t`)
    }

    const moveY = () => {
      // $player.style.transition = `transform ${duration.y}ms linear`
      // $player.style.transitionTimingFunction = `steps(${steps.y})`
      $player.style.transform = $player.style.transform.replace(/translateY\(.+\)/, `translateY(${y}px)`)
    }

    const xChanged = charPos[player.char].x !== x
    const yChanged = charPos[player.char].y !== y

    if (xChanged || yChanged) {
      $player.classList.add('animated')
      if (![TEMPLE].includes(locationName)) {
        yChanged && moveY()
        xChanged && (yChanged ? setTimeout(moveX, 1000) : moveX())
      } else {
        xChanged && moveX()
        yChanged && (xChanged ? setTimeout(moveY, 1000) : moveY())
      }

      setTimeout(() => {
        $player.classList.remove('animated')
      }, xChanged && yChanged ? 2000 : 1000)

      charPos[player.char] = {x, y}
    }
  })
}

function renderPlayerCards () {
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

function updatePlayerCards () {
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

function renderOptions (card: Card) {
  renderButtons(`${card.name}: choose an option`, card.options.map(
    (option: CardOption, index: number) => ({
      title: option.title,
      disabled: false,
      html: `<div class="action-title">${index + 1}._${option.name}</div>
        <div>${option.title}</div>`
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

function renderCard (card: Card, deck: DeckName, index: number) {
  const cardElement = document.createElement('div')

  cardElement.className = 'card'
  cardElement.id = `${index}`
  cardElement.innerHTML = [
    `<div class="front"></div>`,
      `<div class="back">`,
      `<p>${card.name}</p>`,
      card.label ? `<p>${card.label}</p>` : '',
      (card.options || []).map(option => `<p class="card-option">${option.name}</p>`).join(''),

    `</div>`
  ].join('')

  document.querySelector(`.deck.${deck}`).append(cardElement)
}

// function animateCardFlip (deckName: DeckName): Card {
//   const topCard = Array.from(document.querySelectorAll(`.deck.${deckName} .card:not(.flip)`)).pop()

//   topCard.classList.add('flip')
//   setTimeout(() => {
//     topCard.parentElement.removeChild(topCard)
//   }, CARD_TIMEOUT)

//   return decks[deckName][parseInt(topCard.id)];
// }
