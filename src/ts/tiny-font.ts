const font: {[letter: string]: string} = {};

interface FontData {
  [letter: string]: number
}

// TODO: compress all to hex
const letters: FontData = {
  "*": 0b000101010101000,
  "0": 0x7b6f,
  "2": 0b110001010100111,
  "3": 0b111001010001110,
  "4": 0b100101111001001,
  "5": 0b111100110001110,
  "6": 0b110100111101111,
  "7": 0b111001001010010,
  "8": 0b111101010101111,
  "9": 0b111101111001011,
  "a": 0x2b7d,
  "b": 0x6bee,
  "c": 0x7927,
  "d": 0x6b6e,
  "e": 0x79a7,
  "f": 0b111100111100100,
  "g": 0x796f,
  "h": 0x5bed,
  "i": 0x7497,
  "j": 0x726f,
  "k": 0x5bad,
  "l": 0x4927,
  "n": 0x6b6d,
  "o": 0x7b6f,
  "p": 0x7be4,
  "q": 0b111101101100110,
  "r": 0x6b75,
  "s": 0x79cf,
  "t": 0x7492,
  "u": 0x5b6f,
  "v": 0x5b6a,
  "x": 0x5aad,
  "y": 0x5a92,
  "z": 0x72e7,
};

const narrowLetters: FontData = {
  "1": 0b11111,
  ",": 0b00011,
  "'": 0b11000,
  ".": 0b00001,
  ":": 0b01010,
}

const wideLetters: FontData = {
  "m": 0xf9999,
  "w": 0b10011001100111110110,
};

const preRenderFont = (data: FontData, width: number) => {
  Object.keys(data).forEach(letter => {
    const pixels = ('000000000000000' + data[letter].toString(2)).substr(-5 * width).split('').map(bit => {
      if (bit === '1') {
        return '<i black></i>';
      } else {
        return '<i></i>';
      }
    }).join('');

    font[letter] = `<div class="letter w${width}">${pixels}</div>`
  });
};

preRenderFont(letters, 3);
preRenderFont(wideLetters, 4);
preRenderFont(narrowLetters, 1);

document.querySelectorAll(`.text`).forEach(element => {
  const text = element.innerHTML;
  element.innerHTML = text.trim().split(' ').map(word => `<span class="word">
    ${word.split('').map(letter => {
      return font[letter.toLowerCase()]
    }).join('')}
  </span>`).join('');
});
