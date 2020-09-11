const BACKSPACE = 8
const ENTER = 13

function buttonInputHandler (key: string, which: number) {
  if ('12345'.includes(key)) {
    const buttons: NodeListOf<HTMLElement> = document.querySelectorAll(`.options .btn`)
    const index = parseInt(key)
    if (index <= buttons.length) {
      setTimeout(() => {
        const selectButton = Array.from(buttons)[index - 1]
        if (selectButton.onmousedown) {
          selectButton.onmousedown(null)
        }
      }, 100);
    }
  } else if (which === ENTER) {
    const button: HTMLElement = document.querySelector(`.options .btn:only-child`)
    if (button) {
      setTimeout(() => {
        if (button.onmousedown) {
          button.onmousedown(null)
        } else if (button.onclick) {
          button.onclick(null)
        }
      }, 100);
    }
  }
}

function nameInputHandler (key: string, code: number) {
  const $inputControl: HTMLInputElement = document.querySelector('input')
  if ($inputControl.value.length < 7 && key.match(/^[a-zA-Z0-9]$/)) {
    $inputControl.value += key
  } else if (code === BACKSPACE) {
    $inputControl.value = $inputControl.value.slice(0, -1)
  } else if (code === ENTER) {
    const $submit: HTMLElement = document.querySelector('.submit')
    $submit.onclick(null)
  }
  $inputControl.oninput(null)
}

let inputHandler = buttonInputHandler
window.onkeydown = (event: KeyboardEvent) => {
  const {key, which} = event

  inputHandler(key, which)
}


function promptPlayerName (resolve: Function) {
  inputHandler = nameInputHandler

  let name = `Anon${Math.round(100 + Math.random() * 899)}`
  const $modal = document.querySelector('.modal')
  const $inputControl: HTMLInputElement = document.querySelector('input')
  const $inputUI: HTMLElement = document.querySelector('.input')
  const $submit: HTMLElement = document.querySelector('.submit')

  $inputControl.value = name
  $inputControl.oninput = () => {
    $inputUI.innerHTML = $inputControl.value + "|"
    applyTinyFont('.input')
  }

  $inputControl.oninput(null)

  $submit.onclick = () => {
    $modal.classList.add('hidden')
    setTimeout(() => resolve(name), 200)
  }
}
