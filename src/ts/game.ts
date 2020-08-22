/// <reference path="./data.ts" />
/// <reference path="./ui.ts" />
/// <reference path="./strings.ts" />

const promptNextLocation = () : Promise<null> => {
  return new Promise((resolve) => {
    showOptions('Go to',
      [BANK, COURT, TEMPLE, EDEN, HELL]
      .map((location, idx) => ({
        title: location,
        html: `${idx + 1}._${location}`,
        disabled: location === players[0].location
      })))
    applyTinyFont('.btn')
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
const promptNextAction = () : Promise<null> => {
  return new Promise((resolve) => {
    renderActions(resolve)
  })
}

// Wait for all players to pick their actions, up to limit
const waitForPlayersActions = () : Promise<null> => {
  return new Promise((resolve) => {
    waitForAllOptions(resolve)
  })
}

// Game applies action reward/price for all players
const applyActionEffects = () : Promise<null> => {
  return new Promise((resolve) => {
    players.forEach(player => {
      const nextAction = locationActions[player.location].find(
        action => action.name === player.nextOption
      )
      player.nextOption = null

      nextAction.effect(player)
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
  players.push({
    name: 'Player',
    char: 'baal',
    gold: 1,
    influence: 0,
    relics: 0,
    nextOption: null,
    location: BANK
  })

  updatePlayerLocation(mainLoop);
}
