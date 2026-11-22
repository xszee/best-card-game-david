// Ember Duel — the table itself: decks, hands, boards, mana, turns, and
// the Ash Warden's brain. No DOM here; the renderer paints this state.
import { BOARD_LIMIT, CARDS, DECK_SIZE, HAND_LIMIT, MAX_MANA, START_HP } from './config.js';

export const EVENT_NONE = 0;
export const EVENT_PLAY = 1;
export const EVENT_ATTACK = 2;
export const EVENT_OVER = 4;

let uidCounter = 1;

export function makeCardInstance(def) {
  return {
    uid: uidCounter++,
    id: def.id,
    name: def.name,
    house: def.house,
    cost: def.cost,
    kind: def.kind,
    attack: def.attack ?? 0,
    health: def.health ?? 0,
    maxHealth: def.health ?? 0,
    text: def.text,
    damage: def.damage ?? 0,
    heal: def.heal ?? 0,
    draw: def.draw ?? 0,
    sweep: def.sweep ?? 0,
    guard: Boolean(def.guard),
    sick: true,
  };
}

function buildDeck(random) {
  const pool = [];
  for (const def of CARDS) {
    const copies = def.kind === 'creature' ? 3 : 2;
    for (let i = 0; i < copies; i += 1) pool.push(def);
  }
  const shuffled = random.shuffle(pool);
  const deck = [];
  for (let i = 0; i < DECK_SIZE; i += 1) deck.push(makeCardInstance(shuffled[i % shuffled.length]));
  return deck;
}

function makeSide(random, isAi) {
  const side = {
    isAi,
    hp: START_HP,
    maxMana: 0,
    mana: 0,
    deck: buildDeck(random),
    hand: [],
    board: [],
  };
  for (let i = 0; i < 3; i += 1) drawCard(side);
  return side;
}

function drawCard(side) {
  if (side.hand.length >= HAND_LIMIT) return null;
  const card = side.deck.shift();
  if (!card) return null;
  side.hand.push(card);
  return card;
}

function startTurn(side) {
  side.maxMana = Math.min(MAX_MANA, side.maxMana + 1);
  side.mana = side.maxMana;
  for (const creature of side.board) creature.sick = false;
  drawCard(side);
}

export function createWorld(random) {
  const state = {
    you: null,
    foe: null,
    turn: 'you',
    turnCount: 1,
    over: false,
    winner: null,
    log: [],
  };

  function say(text) {
    state.log.push(text);
    if (state.log.length > 5) state.log.shift();
  }

  function damageHero(side, amount) {
    side.hp = Math.max(0, side.hp - amount);
    return side.hp === 0;
  }

  function damageCreature(creature, amount) {
    creature.health -= amount;
    return creature.health <= 0;
  }

  function sweepBoard(board) {
    for (let i = board.length - 1; i >= 0; i -= 1) {
      if (board[i].health <= 0) board.splice(i, 1);
    }
  }

  function guardOf(side) {
    return side.board.find((c) => c.guard && c.health > 0) ?? null;
  }

  // One creature's attack: a Guard in the way takes the hit, else the hero.
  function creatureAttack(attacker, attackerSide, defenderSide) {
    const guard = guardOf(defenderSide);
    if (guard) {
      const died = damageCreature(guard, attacker.attack);
      say(`${attacker.name} smashes the ${guard.name} for ${attacker.attack}.`);
      if (died) say(`The ${guard.name} crumbles to ash.`);
    } else {
      const dead = damageHero(defenderSide, attacker.attack);
      say(`${attacker.name} hits ${defenderSide.isAi ? 'the Warden' : 'you'} for ${attacker.attack}.`);
      if (dead) return true;
    }
    sweepBoard(defenderSide.board);
    return false;
  }

  function resolveCombat(attackerSide, defenderSide) {
    for (const creature of attackerSide.board.slice()) {
      if (creature.health <= 0) continue;
      if (creatureAttack(creature, attackerSide, defenderSide)) return true;
    }
    return false;
  }

  function castSpell(side, foeSide, card) {
    if (card.damage > 0) {
      const dead = damageHero(foeSide, card.damage);
      say(`${card.name} scorches ${foeSide.isAi ? 'the Warden' : 'you'} for ${card.damage}.`);
      if (dead) return true;
    }
    if (card.heal > 0) {
      side.hp = Math.min(START_HP, side.hp + card.heal);
      say(`${card.name} mends ${side.isAi ? 'the Warden' : 'you'} for ${card.heal}.`);
    }
    if (card.draw > 0) {
      for (let i = 0; i < card.draw; i += 1) drawCard(side);
      say(`${card.name} fans the flames — ${card.draw} cards drawn.`);
    }
    if (card.sweep > 0) {
      for (const creature of foeSide.board) damageCreature(creature, card.sweep);
      sweepBoard(foeSide.board);
      say(`${card.name} washes over the enemy board for ${card.sweep}.`);
    }
    return false;
  }

  function playCard(side, foeSide, uid) {
    const index = side.hand.findIndex((c) => c.uid === uid);
    if (index < 0) return EVENT_NONE;
    const card = side.hand[index];
    if (card.cost > side.mana) return EVENT_NONE;
    if (card.kind === 'creature' && side.board.length >= BOARD_LIMIT) return EVENT_NONE;
    side.mana -= card.cost;
    side.hand.splice(index, 1);
    if (card.kind === 'creature') {
      side.board.push(card);
      say(`${side.isAi ? 'The Warden plays' : 'You play'} ${card.name}.`);
      return EVENT_PLAY;
    }
    say(`${side.isAi ? 'The Warden casts' : 'You cast'} ${card.name}.`);
    if (castSpell(side, foeSide, card)) return EVENT_OVER;
    return EVENT_PLAY;
  }

  function endTurn() {
    if (state.over) return EVENT_OVER;
    const attacker = state.turn === 'you' ? state.you : state.foe;
    const defender = state.turn === 'you' ? state.foe : state.you;
    if (resolveCombat(attacker, defender)) {
      state.over = true;
      state.winner = state.turn;
      say(`${state.turn === 'you' ? 'You' : 'The Warden'} take the duel!`);
      return EVENT_OVER;
    }
    state.turn = state.turn === 'you' ? 'foe' : 'you';
    if (state.turn === 'you') state.turnCount += 1;
    startTurn(state.turn === 'you' ? state.you : state.foe);
    say(state.turn === 'you' ? 'Your turn — draw and play.' : 'The Warden takes the turn.');
    return EVENT_ATTACK;
  }

  // The Warden's brain: spend mana on the best plays, then end the turn.
  // Fireball goes face when it wins the game or the board is empty; Mend
  // only when hurt; Stoke only with a small hand; Nova only into a board.
  function aiTakeTurn() {
    const me = state.foe;
    const you = state.you;
    let guard = 0;
    while (guard < 40) {
      guard += 1;
      const affordable = me.hand.filter((c) => c.cost <= me.mana);
      if (affordable.length === 0) break;
      let choice = null;
      const lethal = affordable.find((c) => c.kind === 'spell' && c.damage > 0 && c.damage >= you.hp);
      const board = affordable.filter((c) => c.kind === 'creature');
      const nova = affordable.find((c) => c.sweep > 0 && you.board.length >= 2);
      const mend = affordable.find((c) => c.heal > 0 && me.hp <= START_HP - 4);
      const stoke = affordable.find((c) => c.draw > 0 && me.hand.length <= 3);
      const bolt = affordable.find((c) => c.damage > 0 && board.length === 0);
      if (lethal) choice = lethal;
      else if (nova) choice = nova;
      else if (board.length > 0) choice = board.reduce((a, b) => (b.cost > a.cost ? b : a));
      else if (mend) choice = mend;
      else if (stoke) choice = stoke;
      else if (bolt) choice = bolt;
      else break;
      if (playCard(me, you, choice.uid) === EVENT_OVER) {
        state.over = true;
        state.winner = 'foe';
        say('The Warden takes the duel!');
        return EVENT_OVER;
      }
    }
    return endTurn();
  }

  function reset() {
    uidCounter = 1;
    state.you = makeSide(random, false);
    state.foe = makeSide(random, true);
    state.turn = 'you';
    state.turnCount = 1;
    state.over = false;
    state.winner = null;
    state.log = ['The duel begins. Your turn — draw and play.'];
    startTurn(state.you);
  }

  return {
    state,
    reset,
    playCard: (uid) => playCard(state.you, state.foe, uid),
    endTurn,
    aiTakeTurn,
    say,
  };
}
