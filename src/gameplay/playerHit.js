// Mirrors gameover.js: the UI layer listens rather than being reached into from gameplay code
function playerHit() {
  window.dispatchEvent(new Event('playerhit'));
}

export default playerHit;
