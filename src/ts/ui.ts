function showOptions (title : string, options : Option[]) {
  document.querySelector('.actions .options').innerHTML = ''
  options.map(option => {
    const button = document.createElement('div')
    button.innerHTML = option.html
    button.className = 'btn'

    if (!option.disabled) {
      button.onclick = () => {
        players[0].nextOption = option.title
      }
    } else {
      button.classList.add('disabled')
    }
    document.querySelector('.actions .options').appendChild(button)
  })
  document.querySelector('.actions .title').innerHTML = title
  applyTinyFont('.actions .title')
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
    player => `<div class="player">
      <div class="avatar char ${player.char}"></div>
      <div class="text gold">${player.gold}</div>
      <div class="text relics">${player.relics}</div>
      <div class="text influence">${player.influence}</div>
    </div>`
  ).join('')
  applyTinyFont()
}

function updatePlayerCards () {
  players.forEach(player => {
    document.querySelector('.player .gold').innerHTML = `${player.gold}`
    document.querySelector('.player .relics').innerHTML = `${player.relics}`
    document.querySelector('.player .influence').innerHTML = `${player.influence}`
  })
  applyTinyFont()
}

function renderActions (resolvePromise: Function) {
  const location = players[0].location
  const actions = locationActions[location]

  console.log('Render actions', actions)

  showOptions('Choose an action', actions.map(
    (action, index) => ({
      title: action.name,
      disabled: action.disabled(players[0]),
      html: `<div class="action-title">${index+1}._${action.name}</div>
        <div class="labels">${action.labels.map(label => `<div>${label}</div>`).join('')}</div>`
    })
  ))
  applyTinyFont('.action-title')
  resolvePromise()
}

function adjustUIScale () {
  const updatePixelSize = () => {
    const smallestSize = Math.min(document.body.scrollHeight, document.body.scrollWidth - 150)
    document.body.style.setProperty('--pixel-size', `${Math.round(smallestSize / 100)}px`)
  }

  window.onresize = updatePixelSize
  updatePixelSize()
}

function animateCardFlip (deckName: string) {
  const topCard = Array.from(document.querySelectorAll(`.deck.${deckName} .card`)).pop()

  topCard.classList.add('flip')
  setTimeout(() => {
    topCard.parentElement.removeChild(topCard)
  }, CARD_TIMEOUT)
}
