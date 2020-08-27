/// <reference path="./game.ts" />
/// <reference path="./tiny-font.ts" />
/// <reference path="./client.ts" />

window.onload = () => {
  initTinyFont()
  applyTinyFont()
  gameStart()
  adjustUIScale()
  initClient()
}
