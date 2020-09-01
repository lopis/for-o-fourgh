"use strict";

/**
 * Player sessions
 * @param {Array} players
 */
let players = [];
let characters = ["saint", "baal", "marx", "dissident", "devotee"];
let PLAYER_NUM = 2;

/**
 * Remove player session
 * @param {Player} player
 */
function removePlayer(player) {
  players.splice(players.indexOf(player), 1);
}

function getChar() {
  return characters.find(char => {
    return !players.find(player => player.char === char)
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
	}

	updatePlayers() {
    this.socket.emit('updatePlayers', players.map(
      ({name, char, location, nextChoice = {}, socket}) => ({
        name, char, location, nextChoice, id: socket.id
      })
    ));
  }

  startGame () {
    this.socket.emit('start');
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
      console.log("Disconnected: " + socket.id);
      characters.push(player.char);
			removePlayer(player);
    });

		socket.on("choice", (choice) => {
      const {location, action, option, target} = choice;
      if (location) {
        console.log(`Player ${player.name} goes to ${location}`);
      } else {
        console.log(`Player ${player.name} performs "${action}" with ${option} to ${target}".`);
      }

      player.nextChoice = choice
      players.forEach(player => player.updatePlayers())
    });

    socket.on("move", () => {
      player.location = player.nextChoice.location
    });

		console.log("Connected: " + socket.id);
  }

};
