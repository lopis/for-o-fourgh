function shuffleArray (array: Array<any>) {
  for (let index = array.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * index)
    const temp = array[index]
    array[index] = array[randomIndex]
    array[randomIndex] = temp
  }
}
