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
        document.querySelector(`.char.${player.char}`)
      )
    })
  })
}

function renderActions (resolvePromise: Function) {
  const location = players[0].location
  const actions = locationActions[location]

  console.log('Render actions', actions);

  showOptions('Choose an action', actions.map(action => action.name))
  resolvePromise()
}
