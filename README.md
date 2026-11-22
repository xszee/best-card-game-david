# Ember Duel

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/xszee/best-card-game-david/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/xszee/best-card-game-david/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

An original 1v1 card battler for the make.fun bounty [best-card-game-20261122-1826](https://make.fun/bounty/best-card-game-20261122-1826). You are the Ember Keeper, duelling Cinder, the Ash Warden, for the last fire.

## How it plays

- Both heroes start at 20 life. Reduce the Warden to 0 before yours is gone.
- Every turn your mana grows by 1 (up to 10) and you draw a card.
- Play creature cards onto your board — they attack every turn — or cast spells: Fireball (3 damage), Coal Mend (heal 4), Stoke the Fire (draw 2), Ember Nova (2 damage to every enemy creature).
- Ash Golems have Guard: your creatures must break them before they can reach the hero behind them.
- The Warden plays its own hand with a real brain: it saves Fireball for lethal, heals when hurt, and sweeps a crowded board.

## Files

- `game/index.html` + `game/style.css` — the table.
- `game/src/config.js` — the card pool and the four ember houses (told apart by colour and shape).
- `game/src/world.js` — decks, turns, combat, and the Warden's AI.
- `game/src/render.js` — paints the table into the DOM.
- `game/src/input.js` — mouse and keyboard.
- `game/src/sound.js` — synthesized WebAudio blips, no files.
- `game/src/shots.js` — stages the title, play, win and lose scenes for screenshots.
- `game/src/main.js` — boot and the game loop.
- `main.ts` — hands the game in: copies `game/` and `screenshots/` and writes `dossier.json`.
- `shots.json` — the four screenshot scenes (`?shot=title|play|win|lose`).

## Play it

Serve `game/` with any static server and open `index.html` in a desktop browser:

```sh
cd game && python3 -m http.server 8123
```

Then open http://localhost:8123 — click a glowing card to play it, End Turn to attack, P pauses, Space confirms. Screenshots were taken with `?shot=title|play|win|lose&seed=7`.
