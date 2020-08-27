Planetary — an starship fight game
==================================

An entry for the js13kGames 2020.

This game is a realtime multiplayer game based on WebRTC.

Your people are fighting for this star system. You all have small infantry ships.
You need constantly reload energy for propulsion and to launch guided missiles.
This energy comes from the star, so stay near to fast reload, if you go far away you will die without life support.

Your people will send weapons to reload your small ship, so watch out and get that boxes!

Sometimes one of your opponents can't be found... It is the weapon 404.
Pray that he doesn't have you in the crosshairs.

If it is safe you can land a planet to restore some damage in the ship.

The controls are:
* **Left and Right arrows:** Rotate the ship. The secure inertial sensor will prevent you to rotate too fast.
* **Up arrow:** Accelerate the ship.
* **Space bar:** Launch guided missiles.

You can't exceed light speed. As you become near to that, less you propulsion will take effect.

And remember: your people can send only three ships. Try to not die.

Runinng
-------

You can run the server locally with the following command:

```bash
$ npm run start:dev
```

You can reach the test server at [http://localhost:3000](http://localhost:3000)

### Runinng parameters

You can add some url params to force some behaviour:
* `debug=on`: Will show FPS, display limits, name sprites, and verbose log in the console.
* `quality=<num>`: Will force some render quality. Values: 1 (worst) to 4 (best).

Build
-----

The `start:dev` will build it, but if you need, use the `build.sh` script.
