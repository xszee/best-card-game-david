// Ember Duel — paints the table into the DOM: heroes, mana crystals,
// boards, hands, the log, and the title / win / lose overlays. The
// renderer never changes the rules; it only shows the world.
import { AI_NAME, HERO_NAME, HOUSE } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_WIN = 'win';
export const SCREEN_LOSE = 'lose';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function hearts(hp) {
  let out = '';
  for (let i = 0; i < 20; i += 1) out += i < hp ? '♥' : '♡';
  return out;
}

function manaGems(mana, maxMana) {
  let out = '';
  for (let i = 0; i < 10; i += 1) out += i < mana ? '◆' : i < maxMana ? '◇' : '·';
  return out;
}

function cardNode(card, playable) {
  const house = HOUSE[card.house];
  const node = el('button', `card house-${card.house.toLowerCase()}${playable ? ' playable' : ''}`);
  node.dataset.uid = String(card.uid);
  node.appendChild(el('span', 'cost', String(card.cost)));
  node.appendChild(el('span', 'shape', house.shape));
  node.appendChild(el('span', 'cname', card.name));
  node.appendChild(el('span', 'ctext', card.text));
  if (card.kind === 'creature') {
    const stats = el('span', 'stats');
    stats.appendChild(el('b', 'atk', `⚔ ${card.attack}`));
    stats.appendChild(el('b', 'hp', `♥ ${card.health}`));
    node.appendChild(stats);
    if (card.guard) node.appendChild(el('span', 'guard', 'GUARD'));
  } else {
    node.appendChild(el('span', 'spell-tag', 'SPELL'));
  }
  return node;
}

export function createRenderer(root) {
  const foeHp = root.querySelector('#foe-hp');
  const foeMana = root.querySelector('#foe-mana');
  const foeHand = root.querySelector('#foe-hand');
  const foeBoard = root.querySelector('#foe-board');
  const youHp = root.querySelector('#you-hp');
  const youMana = root.querySelector('#you-mana');
  const youBoard = root.querySelector('#you-board');
  const youHand = root.querySelector('#you-hand');
  const logBox = root.querySelector('#log');
  const turnLine = root.querySelector('#turn-line');
  const endBtn = root.querySelector('#end-turn');
  const overlay = root.querySelector('#overlay');
  const overlayTitle = root.querySelector('#overlay-title');
  const overlayText = root.querySelector('#overlay-text');
  const overlayBtn = root.querySelector('#overlay-btn');

  function draw(state, screen) {
    const you = state.you;
    const foe = state.foe;
    if (!you || !foe) return;

    foeHp.textContent = `${AI_NAME} — ${foe.hp} ♥`;
    foeHp.title = hearts(foe.hp);
    foeMana.textContent = `Mana ${foe.mana}/${foe.maxMana}  ${manaGems(foe.mana, foe.maxMana)}`;
    foeHand.textContent = '';
    for (let i = 0; i < foe.hand.length; i += 1) foeHand.appendChild(el('span', 'back', '🂠'));

    foeBoard.textContent = '';
    if (foe.board.length === 0) foeBoard.appendChild(el('span', 'empty', 'No creatures yet'));
    for (const card of foe.board) {
      const node = cardNode(card, false);
      node.disabled = true;
      foeBoard.appendChild(node);
    }

    youHp.textContent = `${HERO_NAME} — ${you.hp} ♥`;
    youHp.title = hearts(you.hp);
    youMana.textContent = `Mana ${you.mana}/${you.maxMana}  ${manaGems(you.mana, you.maxMana)}`;
    youBoard.textContent = '';
    if (you.board.length === 0) youBoard.appendChild(el('span', 'empty', 'Play a creature card — it fights for you'));
    for (const card of you.board) {
      const node = cardNode(card, false);
      node.disabled = true;
      youBoard.appendChild(node);
    }

    youHand.textContent = '';
    for (const card of you.hand) {
      youHand.appendChild(cardNode(card, state.turn === 'you' && !state.over && card.cost <= you.mana));
    }

    logBox.textContent = '';
    for (const line of state.log) logBox.appendChild(el('div', 'log-line', line));

    turnLine.textContent = state.over
      ? (state.winner === 'you' ? 'Victory! The Warden is beaten.' : 'Defeat. The embers fade.')
      : state.turn === 'you'
        ? `Turn ${state.turnCount} — your move. Click a glowing card to play it, then End Turn.`
        : `Turn ${state.turnCount} — the Warden is thinking…`;
    endBtn.disabled = state.turn !== 'you' || state.over;

    if (screen === SCREEN_TITLE) {
      overlay.classList.remove('hidden');
      overlayTitle.textContent = 'EMBER DUEL';
      overlayText.textContent = 'A 1v1 card duel against Cinder, the Ash Warden. Summon creatures, cast spells, and burn the Warden down from 20 life before yours is gone. Mana grows every turn — spend it wisely.';
      overlayBtn.textContent = 'Begin the Duel';
    } else if (screen === SCREEN_PAUSED) {
      overlay.classList.remove('hidden');
      overlayTitle.textContent = 'PAUSED';
      overlayText.textContent = 'The fire waits. Take a breath, plan your next play, then return to the duel.';
      overlayBtn.textContent = 'Resume the Duel';
    } else if (screen === SCREEN_WIN) {
      overlay.classList.remove('hidden');
      overlayTitle.textContent = 'VICTORY!';
      overlayText.textContent = `The Warden falls and the embers are yours. You won in ${state.turnCount} turns — the fire remembers its keeper.`;
      overlayBtn.textContent = 'Duel Again';
    } else if (screen === SCREEN_LOSE) {
      overlay.classList.remove('hidden');
      overlayTitle.textContent = 'DEFEAT';
      overlayText.textContent = 'Your last ember dies out and the Warden keeps the fire. Shuffle the deck and try again — the flames are patient.';
      overlayBtn.textContent = 'Try Again';
    } else {
      overlay.classList.add('hidden');
    }
  }

  return { draw, overlayBtn, endBtn };
}
