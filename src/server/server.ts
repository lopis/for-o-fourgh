"use strict";

let users: User[] = [];
let bots: User[] = [];
const initialChars = ["saint", "baal", "marx", "dissident", "devotee"];
let characters = initialChars;
let PLAYER_NUM = 5;
const PLAZA_LOCATION = 6;

function removePlayer(user: User) {
  users.splice(users.indexOf(user), 1);
}

function getChar () {
  const randomIndex = Math.round(Math.random() * (characters.length - 1))
  const char = characters[randomIndex]
  characters.splice(randomIndex, 1);

  return char;
}

function joinBotPlayer () {
  const bot = new User(null, 'Bot' + (bots.length + 1));
  users.push(bot);
  bots.push(bot);
  bot.name = bot.id;
  bot.isBot = true;
  console.log(`${bot.name} joined as ${bot.char} (characters: ${JSON.stringify(characters)}).`);
}

function removeBots () {
  bots.forEach(bot => {
    console.log('Bot left the game');
    removePlayer(bot);
    characters.push(bot.char);
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
  location: number = PLAZA_LOCATION;

	constructor(socket: SocketIO.Socket, id?: string) {
		this.socket = socket;
    this.id = id ? id : socket.id
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

function sanitizeChoice (choice: any) {
  const {location, action, option, target} = choice
  return {
    location: Number.isInteger(location) ? location : null,
    action: Number.isInteger(action) ? action : null,
    option: Number.isInteger(option) ? option : null,
    target: Number.isInteger(target) ? target : null,
  }
}

/**
 * Socket.IO on connect event
 * @param {Socket} socket
 */
module.exports = {

	io: (socket: SocketIO.Socket) => {
		const user = new User(socket);
    users.push(user);

		socket.on("join", (name: string) => {
      user.name = name.substr(0, 7);
			console.log(`Player ${socket.id} is called ${user.name} and is ${user.char}`);

      users.forEach(user => user.updateUsers())

      if (users.length >= PLAYER_NUM) {
        users.forEach(user => user.startGame())
      }
    });

		socket.on("disconnect", () => {
      console.log("Disconnected: " + socket.id);
      removePlayer(user);
      characters.push(user.char);
      if (users.every(user => user.isBot)) {
        users = []
        removeBots()
        bots = []
      }
      users.forEach(user => user.updateUsers())
    });

		socket.on("choice", (choice) => {
      const {location, action, option, target} = sanitizeChoice(choice);
      if (Number.isInteger(location)) {
        console.log(`Player ${user.name} goes to ${location}`);
        playBotLocation();
      } else {
        console.log(`Player ${user.name} performs action ${action}/${option}/${target}`);
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

    socket.on("forceStart", () => {
      const botCount = PLAYER_NUM - users.length
      for (let index = botCount; index > 0; index--) {
        joinBotPlayer();
      }
      console.log(`${users.length} players, ${bots.length} of which are bots, start the game.`);

      users.forEach(user => user.updateUsers())
      users.forEach(user => user.startGame())
    })

		console.log("Connected: " + socket.id);
  },

	'stats': (req: any, res: any ) => {
    res.json({
      players: users.map(({isBot, id, nextChoice, name, char, location}) => ({
        name,
        char,
        id,
        nextChoice,
        location,
      })),
      bots: bots.map(({isBot, id, nextChoice, name, char, location}) => ({
        name,
        char,
        id,
        nextChoice,
        location,
      }))
    });
	},

};
