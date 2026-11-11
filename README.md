# Wiki-Auto

A small browser bookmarklet that automates opening booster packs in the Wiki-Masters game.

## What it does

- Opens packs automatically when boosters are available
- Tracks the number of packs opened
- Pauses when no boosters remain and waits for more to appear
- Automatically dismisses the inactivity / confirmation popup
- Lets you stop or pause the script from the floating control panel

## Files

- `bookmarklet.html` — install page that builds the bookmarklet URL and gives you a draggable bookmark button
- `script.js` — the actual automation logic that runs in the page

## How to use it

1. Open `bookmarklet.html` in your browser.
2. Drag the "Wiki-Auto" button to your bookmarks bar.
3. Open the game and navigate to the booster section.
4. Click the bookmarklet while the game page is open.
5. A small control panel appears in the bottom-right corner.

## Controls

- Pause / Resume: toggles the automation loop
- Stop: ends the running script
- Counter: shows how many packs have been opened

## Notes

- This is designed for a specific page structure and may need updates if the game UI changes.
