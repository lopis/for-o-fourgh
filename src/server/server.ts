"use strict";

let users = [];
let bots = [];
let characters = ["saint", "baal", "marx", "dissident", "devotee"];
let PLAYER_NUM = 2;

function removePlayer(user) {
  users.splice(users.indexOf(user), 1);
}

function getChar () {
  return characters.find(char => {
    return !users.find(user => user.char === char)
  })
}

function joinBotPlayer () {
  const bot = new User(null);
  bot.name = 'Bot';
  bot.isBot = true;
  bot.char = getChar();
  users.push(bot);
  bots.push(bot);
  console.log(`Bot joined the game`);
}

function removeBot () {
  bots.forEach(bot => {
    console.log('Bot left the game');
    characters.push(bot.char);
    removePlayer(bot);
    bots.splice(bots.indexOf(bot), 1);
  })
}

function resetBotChoice () {
  bots.forEach(bot => {
    bot.choice = {}
  })
}

// TODO: use digits instead of strings to represent actions
const locationsCount = ['bank', 'court', 'temple', 'eden', 'hell'];
const actions = [
  'Interest Return',
  'Draw Policy',
  'Embezzlement',
  'Offering',
  'Donation',
  'Skip',
  'Blessing',
  'Wrath',
]
function getRandom (array, except) {
  const rnd = Math.round(Math.random() * (array.length - 1));
  return array.filter(l => l !== except)[rnd];
}

function playBotLocation () {
  bots.forEach(bot => {
    bot.nextChoice = {location: getRandom(locations, bot.location)}
    console.log(`Bot goes to ${bot.nextChoice.location}`);
  })
}

function playBotAction () {
  bots.forEach(bot => {
    bot.nextChoice = {
      action: getRandom(actions, null)
    };
    console.log(`Bot performs ${bot.nextChoice.action}`);
  })
}

/**
 * Game class
 */
class Game {

  users: User[]

	/**
	 * @param {User[]} users
	 */
	constructor(users) {
		this.users = users
	}
}

/**
 * Player session class
 */
class User {

  socket: SocketIO.Socket;
  game: Game = null;
  isBot: boolean = false;
  id: string;
  nextChoice: any = {};
  name: string;
  char: string;
  location: number = 0;

	constructor(socket) {
		this.socket = socket;
    this.id = socket ? socket.id : 'bot'
    this.char = getChar()
	}

	updateUsers() {
    if (this.socket) {
      this.socket.emit('updateUsers', users.map(
        ({name, char, location, nextChoice = {}, id}) => ({
          name, char, location, nextChoice, id
        })
      ));
    }
  }

  startGame () {
    if (this.socket) {
      this.socket.emit('start');
    }
  }
}

/**
 * Socket.IO on connect event
 * @param {Socket} socket
 */
module.exports = {

  // TODO: SANITATION OF ALL COMMANDS
  // high risk of XSS

	io: (socket) => {
		const user = new User(socket);
    users.push(user);

		socket.on("join", (name) => {
      joinBotPlayer();
      user.name = name;
			console.log(`Player ${socket.id} is called ${user.name} and is ${user.char}`);

      users.forEach(user => user.updateUsers())

      if (users.length >= PLAYER_NUM) {
        users.forEach(user => user.startGame())
      }
    });

		socket.on("disconnect", () => {
      removeBot();
      console.log("Disconnected: " + socket.id);
      characters.push(user.char);
			removePlayer(user);
    });

		socket.on("choice", (choice) => {
      const {location, action, option, target} = choice;
      if (location) {
        console.log(`Player ${user.name} goes to ${location}`);
        playBotLocation();
      } else {
        console.log(`Player ${user.name} performs "${action}" with ${option} to ${target}".`);
        playBotAction();
      }

      user.nextChoice = choice
      if (users.every(user => user.nextChoice.location) || users.every(user => user.nextChoice.action)) {
        users.forEach(user => user.updateUsers())
      }
    });

    socket.on("move", () => {
      if (user.nextChoice.location) {
        user.location = user.nextChoice.location
        user.nextChoice.location = null
      }
      resetBotChoice();
    });

    socket.on("resetChoice", () => {
      user.nextChoice = {}
      resetBotChoice();
    });

		console.log("Connected: " + socket.id);
  }

};
