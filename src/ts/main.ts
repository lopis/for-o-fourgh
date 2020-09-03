/// <reference path="./game.ts" />
/// <reference path="./tiny-font.ts" />
/// <reference path="./comms.ts" />

window.onload = () => {
  initTinyFont()
  applyTinyFont()
  adjustUIScale()
  initClient()
  gameStart()
}
