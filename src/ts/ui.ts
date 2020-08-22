function showOptions (title : string, options : string[]) {
  console.log('Show Options', title, options);

  document.querySelector('.actions .options').innerHTML = ''
  options.map(option => {
    const button = document.createElement('button')
    button.innerText = option
    button.onclick = () => {
      players[0].nextOption = option
    }
    document.querySelector('.actions .options').appendChild(button)
  })
  document.querySelector('.actions .title').innerHTML = title
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
  ).join('');
}

function updatePlayerCards () {
  players.forEach(player => {
    document.querySelector('.player .gold').innerHTML = `${player.gold}`
    document.querySelector('.player .relics').innerHTML = `${player.relics}`
    document.querySelector('.player .influence').innerHTML = `${player.influence}`
  })
}

function renderActions (resolvePromise: Function) {
  const location = players[0].location
  const actions = locationActions[location]

  console.log('Render actions', actions);

  showOptions('Choose an action', actions.map(action => action.name))
  resolvePromise()
}

function adjustUIScale () {
  const updatePixelSize = () => {
    {
      const smallestSize = Math.min(window.outerHeight, window.outerWidth - 100)
      document.body.style.setProperty('--pixel-size', `${Math.round(smallestSize / 100)}px`)
    }
  }

  window.onresize = updatePixelSize
  updatePixelSize()
}
