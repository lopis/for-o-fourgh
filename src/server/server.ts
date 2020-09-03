"use strict";

let users: User[] = [];
let bots: User[] = [];
let characters = ["saint", "baal", "marx", "dissident", "devotee"];
let PLAYER_NUM = 2;
const BANK_LOCATION = 1;

function removePlayer(user: User) {
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

function setBotLocation () {
  bots.forEach(bot => {
    bot.location = bot.nextChoice.location || bot.location
  })
}

function resetBotChoice () {
  bots.forEach(bot => {
    bot.nextChoice = {}
  })
}

// TODO: use digits instead of strings to represent actions
const locationsCount = 5;

function getRandom (max: number) {
  return Math.round(Math.random() * max)
}

function getRandomPlayer (except: User): number {
  let rnd = getRandom(users.length - 1)
  if (users[rnd] === except) {
    return getRandomPlayer(except)
  }

  return rnd
}

function playBotAction () {
  bots.forEach(bot => {
    bot.nextChoice = {
      action: getRandom(100),
      option: getRandom(100),
      target: getRandomPlayer(bot)
    }
    console.log(`Bot performs action ${bot.nextChoice.action}/${bot.nextChoice.option}/${bot.nextChoice.target}`);
  })
}

function playBotLocation () {
  bots.forEach(bot => {
    bot.nextChoice = {location: getRandom(locationsCount - 1) + 1}
    console.log(`Bot goes to ${bot.nextChoice.location}`);
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
	constructor(users: User[]) {
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
  location: number = BANK_LOCATION;

	constructor(socket: SocketIO.Socket) {
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

	io: (socket: SocketIO.Socket) => {
		const user = new User(socket);
    users.push(user);

		socket.on("join", (name: string) => {
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
      if (Number.isInteger(location)) {
        console.log(`Player ${user.name} goes to ${location}`);
        playBotLocation();
      } else {
        console.log(`Player ${user.name} performs action ${action}/${option}/${target}"`);
        playBotAction();
      }

      user.nextChoice = choice
      if (users.every(user => Number.isInteger(user.nextChoice.location)) || users.every(user => Number.isInteger(user.nextChoice.action))) {
        users.forEach(user => user.updateUsers())
      }
    });

    socket.on("move", () => {
      if (user.nextChoice.location) {
        user.location = user.nextChoice.location
        user.nextChoice.location = null
      }
      setBotLocation();
    });

    socket.on("resetChoice", () => {
      user.nextChoice = {}
      resetBotChoice();
    });

		console.log("Connected: " + socket.id);
  }

};
