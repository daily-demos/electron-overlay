# Daily call object Electron demo

This demo highlights [Daily's call object](https://www.daily.co/blog/prebuilt-ui/), and how it can be used to create an Electron video call app.

## Prerequisites

- [Sign up for a Daily account](https://dashboard.daily.co/signup).

## How the demo works

This demo renders call participants on draggable tiles that sit over the user's screen. The demo allows clickthrough to elements under the call, allowing the user to interact with their desktop while being able to see who they're talking to and use call controls.

The demo prompts the user to enter the URL of the Daily room they want to join, and the name they'd like to use.

## Running locally

1. Install dependencies `npm i`
2. Run `npm start`

## Contributing and feedback

Let us know how experimenting with this demo goes! Feel free to reach out to us any time at `help@daily.co`.

## What's next

- Try limiting the number of tiles that can appear by default on the screen, avoiding over-crowding in large calls.
- Try adding a tile that always highlights the currently speaking user if they aren't already shown.
- Try allowing users to increase the size of a tile (for example, maybe someone wants to increase a user's tile size when they are screen shaing?)
