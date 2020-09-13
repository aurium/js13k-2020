Planetary — an starship fight game
==================================

An entry for the js13kGames 2020.

This game is a realtime multiplayer game based on WebRTC.

Your people are fighting for this star system. You all have small infantry ships.
You need constantly reload energy for propulsion and to launch guided missiles.
This energy comes from the star, so stay near to fast reload, if you go far away you will die without life support. The good news is you can hide yourself from radar when you are far enough.

Your people will send boxes with weapons to reload your small ship, so watch out and get that boxes!

If it is safe you can land a planet to restore some damage in the ship.
But, be cautious, the autopilot won't slow down fast enough if you're above 50% of light speed, then you will explode in the atmosphere.

The controls are:
* **Left and Right arrows:** Rotate the ship. The secure inertial sensor will prevent you to rotate too fast.
* **Up arrow:** Accelerate the ship.
* **Down arrow:** slow down the ship.
* **Space bar:** Launch guided missiles.

In space, lack of friction is your worst enemy. Use the down arrow to brake and facilitate maneuvers.

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
