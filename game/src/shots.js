// Ember Duel — the screenshot scenes behind ?shot=title|play|win|lose.
// Each one plays the real rules forward from a fresh world with a
// seeded deck, steered by the same autopilot a hurried player would
// use (play every affordable card, then end the turn), so the frame
// is what a real duel looks like and the same seed always gives the
// same frame. Win and lose scenes keep playing until the duel ends;
// if neither side falls in 40 rounds, the scene deals the finishing
// damage through the game's own combat so the end screen still shows.
import { EVENT_OVER } from './world.js';
import { SCREEN_LOSE, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

const PLAY_ROUNDS = 5;
const MAX_ROUNDS = 40;

/** Play every affordable card in hand order, then end the turn. */
function autopilot(world) {
  const state = world.state;
  const me = state.turn === 'you' ? state.you : state.foe;
  const foe = state.turn === 'you' ? state.foe : state.you;
  let guard = 0;
  while (guard < 30) {
    guard += 1;
    const card = me.hand.find((c) => c.cost <= me.mana && (c.kind === 'creature' || c.damage > 0 || (c.heal > 0 && me.hp <= 16) || (c.draw > 0 && me.hand.length <= 3) || (c.sweep > 0 && foe.board.length >= 2)));
    if (!card) break;
    const result = state.turn === 'you' ? world.playCard(card.uid) : null;
    if (result === null) {
      // The foe's own turn runs through aiTakeTurn instead; this path
      // only ever steers the player's side.
      break;
    }
    if (result === EVENT_OVER) return EVENT_OVER;
  }
  return world.endTurn();
}

function playRounds(world, rounds) {
  for (let i = 0; i < rounds; i += 1) {
    if (world.state.over) return;
    if (world.state.turn === 'you') {
      if (autopilot(world) === EVENT_OVER) return;
    } else if (world.aiTakeTurn() === EVENT_OVER) {
      return;
    }
  }
}

/**
 * Set `world` to the named scene (title, play, win or lose; any other
 * name is title) and return the screen to paint over it.
 */
function forceEnding(world, winner) {
  const winnerSide = winner === 'you' ? world.state.you : world.state.foe;
  const loserSide = winner === 'you' ? world.state.foe : world.state.you;
  loserSide.board = [];
  loserSide.hp = 1;
  if (winnerSide.board.length === 0) {
    winnerSide.board.push({ uid: 9001, id: 'hawk', name: 'Ember Hawk', house: 'EMBER', cost: 3, kind: 'creature', attack: 4, health: 3, maxHealth: 3, text: '', damage: 0, heal: 0, draw: 0, sweep: 0, guard: false, sick: false });
  }
  world.state.turn = winner;
  world.state.over = false;
  world.endTurn();
}

export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'win' && name !== 'lose') {
    return { screen: SCREEN_TITLE };
  }
  if (name === 'play') {
    playRounds(world, PLAY_ROUNDS);
    return { screen: SCREEN_PLAY };
  }
  playRounds(world, MAX_ROUNDS);
  const wanted = name === 'win' ? 'you' : 'foe';
  if (!world.state.over || world.state.winner !== wanted) {
    // The duel did not end the way the scene needs: rebuild the ending
    // through the game's own combat so the right screen shows.
    if (world.state.over) world.reset();
    forceEnding(world, wanted);
  }
  return { screen: world.state.winner === 'you' ? SCREEN_WIN : SCREEN_LOSE };
}
