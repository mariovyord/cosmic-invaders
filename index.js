import { initiateGame } from "./scripts/core/main-menu.js";

// Create the background music element
/** @type {HTMLAudioElement} */
const backgroundMusic = new Audio("./assets/audio/background.wav");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

// Function to start the background music
const startBackgroundMusic = () => {
  backgroundMusic.play();
  // Remove the event listeners after the music starts
  window.removeEventListener("click", startBackgroundMusic);
};

// Add event listeners for user interaction
window.addEventListener("click", startBackgroundMusic);

initiateGame();
