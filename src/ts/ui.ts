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

function renderPlayers () {
  locations.forEach(location => {
    location.players.forEach(player => {
      document.querySelector(`.${location.name}`).appendChild(
        document.querySelector(`.map .char.${player.char}`)
      )
    })
  })
}

function renderPlayerCards () {
  document.querySelector('.stats').innerHTML = players.map(
    player =>
    `<div class="player ${player.char}">
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
    locations.map(
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
  const actions: LocationOption[] = locationActions[locationName]

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

function adjustUIScale () {
  const updatePixelSize = () => {
    const smallestSize = Math.min(
      document.documentElement.clientHeight,
      document.documentElement.clientWidth - 150
    )

    document.body.style.setProperty('--pixel-size', `${Math.round(smallestSize / 110)}px`)
  }

  window.onresize = updatePixelSize
  updatePixelSize()
}

function renderCard (card: Card, deck: DeckName) {
  const cardElement = document.createElement('div')

  cardElement.className = 'card'
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

function animateCardFlip (deckName: string) {
  const topCard = Array.from(document.querySelectorAll(`.deck.${deckName} .card:not(.flip)`)).pop()

  topCard.classList.add('flip')
  setTimeout(() => {
    topCard.parentElement.removeChild(topCard)
  }, CARD_TIMEOUT)
}
