import { Game } from "./scripts/core/game.js";

const gameTemplate = document.getElementById("game-template");
const startTemplate = document.getElementById("start-template");

let currentGame = null;

startGame();

export function startGame() {
  const startBtn = document.getElementById("start-btn");
  startBtn.addEventListener("click", () => {
    if (currentGame) {
      currentGame.cleanup();
    }

    currentGame = new Game(backToStart);

    startTemplate.classList.add("hidden");
    gameTemplate?.classList.remove("hidden");

    playStartMusic();

    currentGame.start();
  });
}

export function backToStart() {
  if (currentGame) {
    currentGame.cleanup();
    currentGame = null;
  }

  gameTemplate.classList.add("hidden");
  startTemplate.classList.remove("hidden");
}

function playStartMusic() {
  /** @type {HTMLAudioElement} */
  const startSound = new Audio("./assets/audio/start.wav");
  startSound.play();
  startSound.volume = 0.3;
}
