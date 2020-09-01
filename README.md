# For O'Fourgh
For O'Fourgh  - js13kgames 2020 game entry


## Running the server

The server boilerplate is provided by [js13kgames](https://github.com/js13kGames/js13kserver).

Install global server dependencies:

```sh
sudo apt install sqlite3
npm install --global nodemon
```

Running `yarn dev` will start the server and start watching for changes in the client code. If the server is changed, the command needs to be restarted. Access the game in [localhost:3000](localhost:3000)

To build (and zip) the production version of the game, run yarn prod.
