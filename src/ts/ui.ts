function showOptions (title : string, options : string[]) {
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


function updatePlayerLocation (resolve : Function) {
  players.forEach(player => {
    
  })
}
