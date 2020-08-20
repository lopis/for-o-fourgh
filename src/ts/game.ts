/// <reference path="./data.ts" />
/// <reference path="./ui.ts" />
/// <reference path="./strings.ts" />

const promptNextLocation = () : Promise<null> => {
  return new Promise((resolve) => {
    showOptions('Go to', [BANK, COURT, TEMPLE, EDEN, HELL])
    resolve()
  })
}

const waitForAllOptions = (resolvePromise : Function) => {
  if (players.every(player => player.nextOption)) {
    resolvePromise()
  } else {
    requestAnimationFrame(() => waitForAllOptions(resolvePromise));
  }
}

// Game waits for all players to chose, up to limit
const waitForPlayersLocation = () : Promise<null> => {
  return new Promise((resolve) => {
    waitForAllOptions(resolve)
  })
}

// Game plays animation of all players moving to next location
const animatePlayers = () : Promise<null> => {
  return new Promise((resolve) => {
    updatePlayerLocation(resolve)
  })
}

// Game shows possible actions to players
const displayActions = () : Promise<null> => {
  return new Promise((resolve) => {
    renderActions(resolve)
  })
}

//
const promptForAction = () : Promise<null> => {
  return new Promise((resolve) => {

  })
}

// Wait for all players to pick their actions, up to limit
const waitForPlayersActions = () : Promise<null> => {
  return new Promise((resolve) => {

  })
}

// Game applies action reward/price for all players
const applyActionEffects = () : Promise<null> => {
  return new Promise((resolve) => {

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
  .then(displayActions)
  .then(promptForAction)
  // .then(waitForPlayersActions)
  // .then(applyActionEffects)
  // .then(displayRewards)
  .then(mainLoop)
}

function gameStart () {
  players.push({
    name: 'Player',
    char: 'baal',
    gold: 1,
    influence: 0,
    relics: 0,
    nextOption: null,
    location: BANK
  })

  // players.push({
  //   name: 'Player',
  //   char: 'marx',
  //   gold: 1,
  //   influence: 0,
  //   relics: 0,
  //   nextOption: null,
  //   location: COURT
  // })

  // players.push({
  //   name: 'Player',
  //   char: 'dissident',
  //   gold: 1,
  //   influence: 0,
  //   relics: 0,
  //   nextOption: null,
  //   location: TEMPLE
  // })

  console.log('Game start');

  updatePlayerLocation(mainLoop);
}
