import { Game } from "./game.js";

const gameTemplate = document.getElementById("game-template");
const startTemplate = document.getElementById("start-template");

let currentGame = null;

export function initiateGame() {
  const startBtn = document.getElementById("start-btn");
  startBtn.addEventListener("click", () => {
    if (currentGame) {
      currentGame.cleanup();
    }

    currentGame = new Game();

    startTemplate.classList.add("hidden");
    gameTemplate?.classList.remove("hidden");

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
