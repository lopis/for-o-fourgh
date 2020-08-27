"use strict";

/**
 * User sessions
 * @param {Array} users
 */
const users = [];

/**
 * Remove user session
 * @param {User} user
 */
function removeUser(user) {
	users.splice(users.indexOf(user), 1);
}

/**
 * Game class
 */
class Game {

	/**
	 * @param {User[]} users
	 */
	constructor(users) {
		this.users = users
	}

	/**
	 * Start new game
	 */
	start() {
		this.user1.start(this, this.user2);
		this.user2.start(this, this.user1);
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
 * User session class
 */
class User {

	/**
	 * @param {Socket} socket
	 */
	constructor(socket) {
		this.socket = socket;
		this.game = null;
	}

	updateUsers() {
    this.socket.emit('updatePlayers', users);
  }

}

/**
 * Socket.IO on connect event
 * @param {Socket} socket
 */
module.exports = {

	io: (socket) => {
		const user = new User(socket);
    users.push(user);

    // users.forEach(user => {
    //   user.updateUsers()
    // })

    // TODO: what if more players join?
    // Lol I'm optimistic, yes
    // if (users.length >= 5) {
    //   new Game(users).start()
    // }

		socket.on("disconnect", () => {
			console.log("Disconnected: " + socket.id);
			removeUser(user);
    });

    socket.on("nextLocation", ({player, location}) => {
			console.log(`Player ${player} moves to ${location} next.`);
		});

		socket.on("nextAction", (player, action, option = "default", targetPlayer = "self") => {
			console.log(`Player ${player} performs "${action}" with ${option} to ${player}".`);
		});

		console.log("Connected: " + socket.id);
  }

};
