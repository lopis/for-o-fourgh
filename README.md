# for-o-fourgh
For O'Fourgh  - js13kgames 2020 game entry


## Running the server

The server boilerplate is provided by js13kgames, so the setup is slightly different.

First `cd server`. Then `npm install`. Don't use yarn, because there's a `package-lock.json` present.

Install global dependencies:

```sh
sudo apt install sqlite3
npm install --global nodemon
```

And finally run the server with `npm run start:dev`.

Server originally from https://github.com/js13kGames/js13kserver

## Multiplayer Spec

```txt
👤: player
👥: other players
🖥: server
👾: server game


                🖥                  👾
👤  connects ->     creates user ->
                    <- new user
👥  connects ->     creates user ->
                    <- new user

    # enough players joined or timeout

                    <- game start with default positions

👥  next loc ->     set user next loc ->
                    <- update next loc
👥  next action ->
👥  next action option ->
👥  next action player ->
```

### socket.io events

server -> client:

    playerJoined(playerName)
    playerLeft(playerName)
    gameStart(playerList) : players assigned chars randomly
    playerLocation(player, location)
    playerAction(player, action, actionOption, actionPlayer)

client -> server:

    setName(playerName)
    nextLocation(player, location)
    nextAction(player, action, actionOption, actionPlayer)
