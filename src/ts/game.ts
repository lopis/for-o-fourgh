/// <reference path="./data.ts" />
/// <reference path="./ui.ts" />
/// <reference path="./strings.ts" />

const promptNextLocation = () : Promise<null> => {
  return new Promise((resolve) => {
    submitReset()
    renderButtons(
      'Go to',
      locations.map(
        ({name, index}) => ({
          title: name,
          html: `${index + 1}._${name}`,
          disabled: index === localPlayer.location
        })
      ),
      'location',
      WAITING
    )

    applyTinyFont('.btn')
    resolve()
  })
}

const waitForAllOptions = (type : ChoiceType, resolvePromise : Function) => {
  if (players.every(player => player.nextChoice[type])) {
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
    updatePlayerLocation(resolve)
  })
}

// Game shows possible actions to players
const promptNextAction = () : Promise<null> => {
  return new Promise((resolve) => {
    renderActions(resolve)
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
    console.log('applyActionEffects');

    players.forEach(player => {
      console.log('#applyActionEffects', player.char);
      const locationName = locations[player.location].name
      const nextAction = locationActions[locationName][player.nextChoice.action]
      resetPlayerChoice(player)

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
  createCardDecks()

  requestAnimationFrame(() => {
    const name = prompt('Your name?', `Anon${Math.round(100 + Math.random() * 899)}`)
    document.body.style.opacity = '1'
    renderMessages([WAITING])
    joinGame(name)
  });
}
