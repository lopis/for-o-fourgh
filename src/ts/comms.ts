let socket: SocketIO.Socket

/**
 * Bind Socket.IO events
 */
function bind() {
  socket.on('start', () => {
    if (gameState != 'start') {
      gameState = 'start'
      console.log('Game start');

      resetPlayerChoice(localPlayer)
      mainLoop();
    }
 })

  socket.on('connect', () => {
    console.log('Connected')
  })

  socket.on('disconnect', () => {
    console.log('Connection lost!')
  })

  socket.on('updatePlayers', (users: Player[]) => {
    console.log('updatePlayers', users)
    localPlayer = users.find(player => player.id === socket.id)
    players = users
    players.forEach(player => {
      player.stats = playerStats[player.id] || {...DEFAULT_STATS}
      playerStats[player.id] = player.stats
    })
    renderPlayers()
    renderPlayerCards()
  })
}

/**
 * Client module init
 */
function initClient () {
  socket = window.io()
  bind()
}

function joinGame (name: string) {
  socket.emit('join', name)
}

function submitPlayerChoice (choice: Choice) {
  socket.emit('choice', choice)
}

function submitMove () {
  socket.emit('move')
}

function submitReset () {
  socket.emit('resetChoice')
}

