window.onkeypress = (event: KeyboardEvent) => {
  const key = event.key

  if ('12345'.includes(key)) {
    const buttons: NodeListOf<HTMLElement> = document.querySelectorAll(`.options .btn`)
    const index = parseInt(key)

    console.log('click', index);


    if (index <= buttons.length) {
      Array.from(buttons)[index - 1].classList.add('pressed')
      setTimeout(() => {
        Array.from(buttons)[index - 1].click()
      }, 200);
    }
  }
}
