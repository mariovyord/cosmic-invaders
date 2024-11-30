import { Game } from "./game.js";

const gameTemplate = document.getElementById("game-template");
const startTemplate = document.getElementById("start-template");

export function initiateGame() {
  const startBtn = document.getElementById("start-btn");
  startBtn.addEventListener("click", () => {
    const game = new Game();

    startTemplate.classList.add("hidden");
    gameTemplate?.classList.remove("hidden");

    game.start();
  });
}

export function backToStart() {
  gameTemplate.classList.add("hidden");
  startTemplate.classList.remove("hidden");
}
