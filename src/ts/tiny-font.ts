const tinyFontData: {[letter: string]: string} = {}

interface FontData {
  [letter: string]: number
}

// TODO: compress all to hex
const letters: FontData = {
  "0": 0x7b6f,
  "2": 0x62a7,
  "3": 0x728e,
  "4": 0x4bc9,
  "5": 0x798e,
  "6": 0x69ef,
  "7": 0x7252,
  "8": 0x7aaf,
  "9": 0x7bcb,
  "*": 0xaa8,
  "-": 0x1c0,

  "a": 0x7b7d,
  "b": 0x7baf,
  "c": 0x7927,
  "d": 0x6b6e,
  "e": 0x79a7,
  "f": 0x79e4,
  "g": 0x796f,
  "h": 0x5bed,
  "i": 0x7497,
  "j": 0x726f,
  "k": 0x5bad,
  "l": 0x4927,
  "n": 0x6b6d,
  "o": 0x3b6e,
  "p": 0x7be4,
  "q": 0x7b66,
  "r": 0x6b75,
  "s": 0x79cf,
  "t": 0x7492,
  "u": 0x5b6f,
  "v": 0x5b6a,
  "x": 0x5aad,
  "y": 0x5aca,
  "z": 0x72a7,
}

const narrowLetters: FontData = {
  "|": 0b11111,
  "1": 0b11111,
  ".": 0b00001,
  ",": 0b00011,
  "'": 0b11000,
  ":": 0b01010,
  "_": 0,
}

const wideLetters: FontData = {
  "m": 0xf9999,
  "w": 0x999f6,
}

const preRenderFont = (data: FontData, width: number) => {
  Object.keys(data).forEach(letter => {
    const pixels = ('000000000000000' + data[letter].toString(2)).substr(-5 * width).split('').map(bit => {
      if (bit === '1') {
        return '<i black></i>'
      } else {
        return '<i></i>'
      }
    }).join('')

    tinyFontData[`_${letter}`] = `<div class="letter w${width}">${pixels}</div>`
  })
}

function initTinyFont () {
  preRenderFont(letters, 3)
  preRenderFont(wideLetters, 4)
  preRenderFont(narrowLetters, 1)
}

function scheduleTinyFontUpdate (selector: string | null = '.text') : void {
  document.querySelectorAll(selector).forEach(element => {
    if (element.children.length === 0) {
      const text = element.innerHTML
      element.innerHTML = text.trim().split(' ').map(word => `<span class="word">
        ${word.split('').map(letter => {
          return tinyFontData[`_${letter.toLowerCase()}`]
        }).join('')}
      </span>`).join('')
    }

    element.classList.add('tiny-font')
  })
}

function applyTinyFont (selector: string | null = '.text') : void {
  if (!tinyFontData['_a']) return

  requestAnimationFrame(() => scheduleTinyFontUpdate(selector))
}
