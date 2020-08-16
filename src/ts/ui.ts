function showOptions (title : string, options : string[]) {
  document.querySelector('.actions .options').innerHTML = ''
  options.map(option => {
    const button = document.createElement('button')
    button.innerText = option
    button.onclick = () => {
      console.log('onclick option', option);
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
