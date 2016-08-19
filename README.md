## Overview
This project was a quick attempt to demonstrate the _"sportsync"_ game management product / service with code written for serveral platforms.  Setup instructions for the primary application can be found in `server/README.md`.

Code in `client/` is used to simulate API interaction by generating 'Actions' that modify game state and consequently trigger notifications for connected clients.

`configuration/` contains a simple start script and `nginx` reverse proxy config file.

Both components use `nodejs` and `mongodb` with a remote database specified in `config.js`.
