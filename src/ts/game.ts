/// <reference path="./data.ts" />
/// <reference path="./ui.ts" />
/// <reference path="./strings.ts" />

const promptNextLocation = () : Promise<null> => {
  return new Promise((resolve) => {
    submitReset()
    renderLocations()
    resolve()
  })
}

const waitForAllOptions = (type : ChoiceType, resolvePromise : Function) => {
  if (players.every(player => Number.isInteger(player.nextChoice[type]))) {
    console.log('All ready', players.map(p => p.nextChoice));

    resolvePromise()
  } else {
    requestAnimationFrame(() => waitForAllOptions(type, resolvePromise));
  }
}

// Game waits for all players to chose, up to limit
const waitForPlayersLocation = () : Promise<null> => {
  return new Promise((resolve) => {
    waitForAllOptions('location', resolve)
  })
}

// Game plays animation of all players moving to next location
const animatePlayers = () : Promise<null> => {
  return new Promise((resolve) => {
    updatePlayerLocation()
    resolve()
  })
}

// Game shows possible actions to players
const promptNextAction = () : Promise<null> => {
  return new Promise((resolve) => {
    renderActions()
    resolve()
  })
}

// Wait for all players to pick their actions
const waitForPlayersActions = () : Promise<null> => {
  return new Promise((resolve) => {
    waitForAllOptions('action', resolve)
  })
}

// Game applies action reward/price for all players
const applyActionEffects = () : Promise<null> => {
  return new Promise((resolve) => {
    players.forEach(player => {
      const locationName = locations[player.location - 1].name

      // Normalizes value because bots use a random from 0 to 100
      if (player.nextChoice.action > locationActions[locationName].length) {
        player.nextChoice.action = (player.nextChoice.action - 1) % locationActions[locationName].length + 1
      }

      const nextAction = locationActions[locationName][player.nextChoice.action - 1]

      console.log(`Player ${player.name} performs ${nextAction.name} in ${locationName}`);
      resetPlayerChoice(player)

      if (!nextAction.disabled(player)) {
        nextAction.effect(player)
      }
      updatePlayerCards()
      resolve()
    })
  })
}

// Game shows the reward and price to all players openly
const displayRewards = () : Promise<null> => {
  return new Promise((resolve) => {

  })
}

// Game checks if game-end conditions have been met
const checkGameEnd = () : Promise<boolean> => {
  return new Promise((resolve) => {
    // returns true if game should go on

    return true
  })
}

const mainLoop = () => {
  promptNextLocation()
  .then(waitForPlayersLocation)
  .then(animatePlayers)
  .then(promptNextAction)
  .then(waitForPlayersActions)
  .then(applyActionEffects)
  // .then(displayRewards)
  .then(mainLoop)
}

function gameStart () {
  createCardDecks()

  requestAnimationFrame(() => {
    const name = prompt('Your name?', `Anon${Math.round(100 + Math.random() * 899)}`)
    document.body.style.opacity = '1'
    renderMessages([WAITING])
    joinGame(name)
  });
}
