window.onkeypress = (event: KeyboardEvent) => {
  const key = event.key

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
  }
}
