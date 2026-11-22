// Ember Duel — mouse and keyboard: click a glowing card to play it,
// click End Turn, press Space or Enter to confirm on the overlays,
// press P to pause the duel.
export const ACTION_CONFIRM = 1;
export const ACTION_END = 2;
export const ACTION_PAUSE = 4;

export function createInput(root) {
  let actions = 0;
  let playedUid = null;

  root.addEventListener('click', (event) => {
    const card = event.target.closest('.card.playable');
    if (card) {
      playedUid = Number(card.dataset.uid);
      actions |= ACTION_CONFIRM;
      return;
    }
    if (event.target.closest('#end-turn')) actions |= ACTION_END;
    if (event.target.closest('#overlay-btn')) actions |= ACTION_CONFIRM;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      actions |= ACTION_CONFIRM;
      event.preventDefault();
    } else if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') {
      actions |= ACTION_PAUSE;
    }
  });

  function takeActions() {
    const taken = actions;
    actions = 0;
    return taken;
  }

  function takePlayedUid() {
    const uid = playedUid;
    playedUid = null;
    return uid;
  }

  return { takeActions, takePlayedUid };
}
