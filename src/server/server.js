"use strict";

/**
 * Player sessions
 * @param {Array} players
 */
let players = [];
let bots = [];
let characters = ["saint", "baal", "marx", "dissident", "devotee"];
let PLAYER_NUM = 2;

/**
 * Remove player session
 * @param {Player} player
 */
function removePlayer(player) {
  players.splice(players.indexOf(player), 1);
}

function getChar () {
  return characters.find(char => {
    return !players.find(player => player.char === char)
  })
}

function joinBotPlayer () {
  const bot = new Player(null);
  bot.name = 'Bot';
  bot.isBot = true;
  bot.char = getChar();
  players.push(bot);
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

const locations = ['bank', 'court', 'temple', 'eden', 'hell'];
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

	/**
	 * @param {Player[]} players
	 */
	constructor(players) {
		this.players = players
	}

	/**
	 * Start new game
	 */
	start() {
		this.player1.start(this, this.player2);
		this.player2.start(this, this.player1);
	}

	/**
	 * Is game ended
	 * @return {boolean}
	 */
	ended() {
	}

	/**
	 * Final score
	 */
	score() {
	}

}

/**
 * Player session class
 */
class Player {

	/**
	 * @param {Socket} socket
	 */
	constructor(socket) {
		this.socket = socket;
    this.game = null;
    this.isBot = false;
    this.id = socket ? socket.id : 'bot'
    this.nextChoice = {}
	}

	updatePlayers() {
    if (this.socket) {
      this.socket.emit('updatePlayers', players.map(
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
		const player = new Player(socket);
    players.push(player);

    // players.forEach(player => {
    //   player.updatePlayers()
    // })

    // TODO: what if more players join?
    // Lol I'm optimistic, yes
    // if (players.length >= 5) {
    //   new Game(players).start()
    // }

		socket.on("join", (name) => {
      joinBotPlayer();
      player.name = name;
      player.char = getChar();
      player.location = 'bank';
			console.log(`Player ${socket.id} is called ${player.name} and is ${player.char}`);

      players.forEach(player => player.updatePlayers())

      if (players.length >= PLAYER_NUM) {
        players.forEach(player => player.startGame())
      }
    });

		socket.on("disconnect", () => {
      removeBot();
      console.log("Disconnected: " + socket.id);
      characters.push(player.char);
			removePlayer(player);
    });

		socket.on("choice", (choice) => {
      const {location, action, option, target} = choice;
      if (location) {
        console.log(`Player ${player.name} goes to ${location}`);
        playBotLocation();
      } else {
        console.log(`Player ${player.name} performs "${action}" with ${option} to ${target}".`);
        playBotAction();
      }

      player.nextChoice = choice
      if (players.every(player => player.nextChoice.location) || players.every(player => player.nextChoice.action)) {
        players.forEach(player => player.updatePlayers())
      }
    });

    socket.on("move", () => {
      if (player.nextChoice.location) {
        player.location = player.nextChoice.location
        player.nextChoice.location = null
      }
      resetBotChoice();
    });

    socket.on("resetChoice", () => {
      player.nextChoice = {}
      resetBotChoice();
    });

		console.log("Connected: " + socket.id);
  }

};
