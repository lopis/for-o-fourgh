/// <reference path="./game.ts" />

gameStart()

window.onresize = (event: Event) => {
  document.body.style.setProperty('--pixel-size', `${Math.round(window.outerHeight / 100)}px`)
}
