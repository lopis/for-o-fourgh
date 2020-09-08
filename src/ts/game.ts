/// <reference path="./data.ts" />
/// <reference path="./ui.ts" />
/// <reference path="./strings.ts" />

const waitForLocalPlayerChoice = (type: ChoiceType, resolvePromise: Function) => {
  if (Number.isInteger(localPlayer.nextChoice[type])) {
    resolvePromise()
  } else {
    requestAnimationFrame(() => waitForLocalPlayerChoice(type, resolvePromise));
  }
}

const waitForAllOptions = (type : ChoiceType, resolvePromise : Function) => {
  if (players.every(player => Number.isInteger(player.nextChoice[type]))) {
    console.log('All ready', players.map(p => p.nextChoice));

    resolvePromise()
  } else {
    requestAnimationFrame(() => waitForAllOptions(type, resolvePromise));
  }
}

const promptNextLocation = (resolve: Function) => {
  submitReset()
  renderLocations()
  waitForLocalPlayerChoice('location', resolve)
}

// Game waits for all players to chose, up to limit
const waitForPlayersLocation = (resolve: Function) => {
  waitForAllOptions('location', resolve)
}

// Game plays animation of all players moving to next location
const animatePlayers = (resolve: Function) => {
  updatePlayerLocation()
  resolve()
}

// Game shows possible actions to players
const promptNextAction = (resolve: Function) => {
  renderActions()
  waitForLocalPlayerChoice('action', resolve)
}

// Render action options if available, skip otherwise
const promptForPlayerOption = (resolve: Function) => {
  const locationName = locations[localPlayer.location - 1].name
  const action = locationActions[locationName][localPlayer.nextChoice.action - 1]

  if (action.isCard) {
    localPlayer.card = getCard(locationDecks[locationName])
    if (localPlayer.card.options) {
      renderOptions(localPlayer.card)
      console.log('prompt player option', localPlayer.card);
      waitForLocalPlayerChoice('option', resolve)
    } else {
      resolve()
    }
  } else {
    console.log('prompt player option', 'pass', localPlayer.location, action);
    resolve()
  }
}

const promptForPlayerTarget = (resolve: Function) => {
  if (localPlayer.card && localPlayer.card.choosePlayer) {
    renderTargetPlayers()
    waitForLocalPlayerChoice('target', resolve)
  } else {
    resolve()
  }
}

// Wait for all players to pick their actions
const waitForPlayersActions = (resolve: Function) => {
  waitForAllOptions('action', resolve)
}

// Game applies action reward/price for all players
const applyActionEffects = (resolve: Function) => {
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
}

// Game shows the reward and price to all players openly
const displayRewards = (resolve: Function) => {

}

// Game checks if game-end conditions have been met
const checkGameEnd = (resolve: Function) => {
  // returns true if game should go on

  return true
}

let mainLoopState : string
const setState = (stateFunction: (resolve: Function) => any): () => Promise<any> => () => {
  mainLoopState = stateFunction.name
  console.log('State', mainLoopState);
  return new Promise(stateFunction)
}

const mainLoop = () => {
  setState(promptNextLocation)()
  .then(setState(submitPlayerChoice))
  .then(setState(waitForPlayersLocation))
  .then(setState(animatePlayers))
  .then(setState(promptNextAction))
  .then(setState(promptForPlayerOption))
  .then(setState(promptForPlayerTarget))
  .then(setState(submitPlayerChoice))
  .then(setState(waitForPlayersActions))
  // .them(animatePlayerAction)
  // .them(animateOtherPlayersActions)
  .then(setState(applyActionEffects))
  // .then(setState(displayRewards))
  .then(setState(mainLoop))
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
