// Ember Duel — boot and the one loop. The duel moves between four
// screens: title, play, paused and over. Clicks play cards and end
// turns; the Warden answers after a short beat so you can watch the
// board change.
//
// ?seed=N fixes the deck shuffle. ?shot=title|play|win|lose (with
// &seed=N) stages that scene instead of running the loop, paints it
// twice and sets window.__shotReady for a screenshot.
import { createRandom } from './random.js';
import { createWorld, EVENT_OVER, EVENT_PLAY } from './world.js';
import { ACTION_CONFIRM, ACTION_END, ACTION_PAUSE, createInput } from './input.js';
import { createRenderer, SCREEN_LOSE, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { stageShot } from './shots.js';
import { playSound } from './sound.js';

const AI_BEAT_MS = 650;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const root = document.getElementById('table');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(root);
const input = createInput(root);

function announce(message) {
  status.textContent = message;
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let screen = SCREEN_TITLE;
  let aiTimer = null;

  function startGame() {
    world.reset();
    screen = SCREEN_PLAY;
    announce('Playing. Your turn — play a card, then End Turn.');
    renderer.draw(world.state, screen);
  }

  function endGame() {
    screen = world.state.winner === 'you' ? SCREEN_WIN : SCREEN_LOSE;
    playSound(world.state.winner === 'you' ? 'win' : 'lose');
    announce(world.state.winner === 'you' ? 'Victory! The Warden is beaten.' : 'Defeat. The embers fade.');
    renderer.draw(world.state, screen);
  }

  function foeTurn() {
    if (screen !== SCREEN_PLAY) return;
    if (world.aiTakeTurn() === EVENT_OVER) endGame();
    else {
      screen = SCREEN_PLAY;
      announce('Your turn — play a card, then End Turn.');
      renderer.draw(world.state, screen);
    }
  }

  function scheduleFoe() {
    if (aiTimer !== null) clearTimeout(aiTimer);
    aiTimer = setTimeout(foeTurn, AI_BEAT_MS);
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused. Press Space to return to the duel.');
      renderer.draw(world.state, screen);
      return;
    }
    if (screen === SCREEN_PAUSED) {
      if (actions & (ACTION_CONFIRM | ACTION_PAUSE)) {
        screen = SCREEN_PLAY;
        announce('Playing. Your turn — play a card, then End Turn.');
        renderer.draw(world.state, screen);
      }
      return;
    }
    if (screen === SCREEN_TITLE) {
      if (actions & ACTION_CONFIRM) startGame();
      return;
    }
    if (screen === SCREEN_WIN || screen === SCREEN_LOSE) {
      if (actions & ACTION_CONFIRM) startGame();
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    const uid = input.takePlayedUid();
    if ((actions & ACTION_CONFIRM) && uid !== null && world.state.turn === 'you') {
      const result = world.playCard(uid);
      if (result === EVENT_PLAY) playSound('play');
      if (result === EVENT_OVER) {
        endGame();
        return;
      }
      renderer.draw(world.state, screen);
      return;
    }
    if ((actions & ACTION_END) && world.state.turn === 'you') {
      playSound('hit');
      if (world.endTurn() === EVENT_OVER) endGame();
      else scheduleFoe();
      renderer.draw(world.state, screen);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused. Press Space to return to the duel.');
      renderer.draw(world.state, screen);
    }
  });

  announce('Ember Duel. Press Space or click Begin to start.');
  renderer.draw(world.state, SCREEN_TITLE);
  (function frame() {
    requestAnimationFrame(frame);
    handleActions();
  }());
}

if (shot) runShot(shot);
else runGame();
