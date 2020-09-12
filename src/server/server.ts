"use strict";

let users: User[] = [];
let games: GameServer[] = [];
const initialChars = ["saint", "baal", "marx", "dissident", "devotee"];
const PLAYER_NUM = 5;
const PLAZA_LOCATION = 6;
type ServerGameState = 'lobby' | 'start' | 'end'

function findGame(user: User) {
  let game = games.find(game => game.state === 'lobby' && game.players.length < PLAYER_NUM)
  if (!game) {
    console.log('New game created');

    game = new GameServer()
    games.push(game)
  }
  game.join(user)
}

function removeGame (game: GameServer) {
  games.splice(games.indexOf(game), 1);
}

function removeUser(user: User) {
  users.splice(users.indexOf(user), 1);
}

// TODO: use digits instead of strings to represent actions
const locationsCount = 5;

function getRandom (max: number) {
  return Math.round(Math.random() * max)
}

/**
 * GameServer class
 */
class GameServer {

  players: User[]
  bots: User[]
  state: ServerGameState
  characters = [...initialChars];

	constructor() {
    this.players = []
    this.bots = []
    this.state = 'lobby'
  }

  join (user: User) {
    this.players.push(user)
    user.game = this
    user.assignChar()
  }

  joinBot () {
    const bot = new User(null, 'Bot' + (this.bots.length + 1));
    this.players.push(bot);
    this.bots.push(bot);
    bot.name = bot.id;
    bot.isBot = true;
    bot.game = this
    bot.assignChar();
    console.log(`${bot.name} joined as ${bot.char}.`);
  }

  setBotsLocation () {
    this.bots.forEach(bot => {
      bot.location = bot.nextChoice.location || bot.location
    })
  }

  resetBotChoice () {
    this.bots.forEach(bot => {
      bot.nextChoice = {}
    })
  }

  playBotsAction () {
    this.bots.forEach(bot => {
      bot.nextChoice = {
        action: getRandom(2) + 1,
        option: getRandom(1) + 1,
        target: this.getRandomPlayer(bot)
      }
      console.log(`Bot performs action ${bot.nextChoice.action}/${bot.nextChoice.option}/${bot.nextChoice.target}`);
    })
  }

  playBotsLocation () {
    this.bots.forEach(bot => {
      bot.nextChoice = {location: getRandom(locationsCount - 1) + 1}
      console.log(`Bot goes to ${bot.nextChoice.location}`);
    })
  }

  getRandomPlayer (except: User): number {
    let rnd = getRandom(this.players.length - 1) + 1
    if (this.players[rnd] === except) {
      return this.getRandomPlayer(except)
    }

    return rnd
  }
}

/**
 * Player session class
 */
class User {

  socket: SocketIO.Socket;
  game: GameServer = null;
  isBot: boolean = false;
  id: string;
  nextChoice: any = {};
  name: string;
  char: string;
  location: number = PLAZA_LOCATION;

	constructor(socket: SocketIO.Socket, id?: string) {
		this.socket = socket;
    this.id = id ? id : socket.id
	}

	updatePlayers() {
    if (this.socket) {
      this.socket.emit('updateUsers', this.game.players.map(
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

  assignChar () {
    const randomIndex = Math.round(Math.random() * (this.game.characters.length - 1))
    this.char = this.game.characters[randomIndex]
    this.game.characters.splice(randomIndex, 1);
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
      findGame(user);

			console.log(`Player ${socket.id} is called ${user.name} and is ${user.char}`);

      user.game.players.forEach(user => user.updatePlayers())

      if (user.game.players.length >= PLAYER_NUM) {
        user.game.players.forEach(user => user.startGame())
        user.game.state = 'start'
      }
    });

		socket.on("disconnect", () => {
      console.log("Disconnected: " + socket.id);
      const game = user.game
      removeUser(user);
      if (game) {
        game.players.splice(game.players.indexOf(user), 1)
        game.characters.push(user.char);
        if (game.players.every(player => player.isBot)) {
          removeGame(game)
        } else {
          game.players.forEach(user => user.updatePlayers())
        }
      }
    });

		socket.on("choice", (choice) => {
      const {location, action, option, target} = sanitizeChoice(choice);
      const game = user.game

      if (Number.isInteger(location)) {
        console.log(`Player ${user.name} goes to ${location}`);
        game.playBotsLocation();
      } else {
        console.log(`Player ${user.name} performs action ${action}/${option}/${target}`);
        game.playBotsAction();
      }

      user.nextChoice = choice
      if (game.players.every(player => Number.isInteger(player.nextChoice.location)) || game.players.every(player => Number.isInteger(player.nextChoice.action))) {
        game.players.forEach(player => player.updatePlayers())
      }
    });

    socket.on("move", () => {
      const game = user.game
      if (user.nextChoice.location) {
        user.location = user.nextChoice.location
        user.nextChoice.location = null
      }
      game.setBotsLocation();
    });

    socket.on("resetChoice", () => {
      user.nextChoice = {}
      user.game.resetBotChoice();
    });

    socket.on("forceStart", () => {
      const game = user.game
      const botCount = PLAYER_NUM - game.players.length
      for (let index = botCount; index > 0; index--) {
        game.joinBot();
      }
      console.log(`${game.players.length} players, ${game.bots.length} of which are bots, start the game.`);

      game.players.forEach(player => player.updatePlayers())
      game.players.forEach(player => player.startGame())
      game.state = 'start'
    })

		console.log("Connected: " + socket.id);
  },

	'stats': (req: any, res: any ) => {
    res.json(games.map(game => ({
      players: game.players.map(({isBot, id, nextChoice, name, char, location}) => ({
        name,
        char,
        id,
        nextChoice,
        location,
      })),
      bots: game.bots.map(({name}) => name),
      characters: game.characters
    })));
	},

};
