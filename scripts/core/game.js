import { Player } from "../objects/player.js";
import { Particle } from "../objects/particle.js";
import { InvadersGrid } from "../objects/invaders-grid.js";
import { PlayerProjectile } from "../objects/player-projectile.js";
import { ctx, canvas } from "../core/canvas.js";
import {
  PLAYER_SPEED,
  PLAYER_ROTATION,
  PROJECTILE_SPEED,
  FPS_INTERVAL,
} from "./constants.js";
import { backToStart } from "./main-menu.js";

/**
 * Class representing the game.
 */
export class Game {
  constructor() {
    /** @type {Player} */
    this.player = new Player();
    /** @type {PlayerProjectile[]} */
    this.playerProjectiles = [];
    /** @type {InvadersGrid[]} */
    this.grids = [];
    /** @type {Particle[]} */
    this.particles = [];
    /** @type {Array} */
    this.invaderProjectiles = [];
    /** @type {Object} */
    this.keys = {
      a: {
        pressed: false,
      },
      d: {
        pressed: false,
      },
      space: {
        pressed: false,
      },
    };
    /** @type {number} */
    this.frames = 0;
    /** @type {Object} */
    this.game = {
      over: false,
      active: true,
    };
    /** @type {number} */
    this.randomInterval = Math.trunc(Math.random() * 500 + 500);
    /** @type {HTMLElement | null} */
    this.scoreElement = document.querySelector(".score");
    /** @type {HTMLElement | null} */
    this.bestScoreElement = document.querySelector(".best-score");
    /** @type {number} */
    this.score = 0;
    /** @type {number} */
    this.bestScore = this.getBestScoreFromStorage();
    /** @type {number} */
    this.lastRenderTimestamp = 0;
    /** @type {number | null} */
    this.animationFrameId = null;
    /** @type {HTMLAudioElement | null} */
    this.backgroundMusic = null;
  }

  /**
   * Get the best score from local storage.
   * @returns {number} The best score.
   */
  getBestScoreFromStorage = () => {
    let bestScore = 0;
    try {
      bestScore = localStorage.getItem("bestScore");
    } catch {
      bestScore = 0;
    }

    if (bestScore) {
      const parsedScore = parseInt(bestScore, 10);
      if (!isNaN(parsedScore)) {
        bestScore = parsedScore;
      }
    }

    this.bestScoreElement.textContent = bestScore;

    return bestScore;
  };

  /**
   * Start the game.
   */
  start = () => {
    this.spawnParticles();
    this.lastRenderTimestamp = performance.now(); // Initialize lastRenderTimestamp with the current time
    this.animate(this.lastRenderTimestamp);
    this.handleKeypress();
    this.startBackgroundMusic();
  };

  /**
   * The game loop.
   */
  animate = (timestamp) => {
    if (!this.game.active) {
      backToStart();
      return;
    }

    // Call the animate function recursively
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Calculates the time elapsed since the last frame
    const deltaTime = timestamp - this.lastRenderTimestamp;

    // Checks if enough time has passed to render the next frame
    if (deltaTime > FPS_INTERVAL) {
      // Updates the last time a frame was rendered, accounting for any leftover time
      this.lastRenderTimestamp = timestamp - (deltaTime % FPS_INTERVAL);

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      this.player.update();

      this.updateParticles();
      this.updateInvaderProjectiles();
      this.updatePlayerProjectiles();
      this.updateGrid();
      this.movePlayer();
      this.spawnInvaders();
      if (this.game.over) {
        this.displayGameOver();
      }
      this.frames++;
    }
  };

  /**
   * Update the particles in the game background.
   */
  updateParticles = () => {
    this.particles.forEach((particle, particleIndex) => {
      if (particle.position.y - particle.radius >= canvas.height) {
        particle.position.x = Math.random() * canvas.width;
        particle.position.y = -particle.radius;
      }

      if (particle.opacity <= 0) {
        setTimeout(() => {
          // Clear particles
          this.particles.splice(particleIndex, 1);
        }, 0);
      } else {
        particle.update();
      }
    });
  };

  /**
   * Update the invader projectiles.
   */
  updateInvaderProjectiles = () => {
    this.invaderProjectiles.forEach(
      (invaderProjectile, invaderProjectilesIndex) => {
        if (
          invaderProjectile.position.y + invaderProjectile.height >=
          canvas.height
        ) {
          setTimeout(() => {
            // Clear projectile when it goes outside of canvas
            this.invaderProjectiles.splice(invaderProjectilesIndex, 1);
          }, 0);
        } else {
          invaderProjectile.update();
        }

        // Projectile hits player
        if (
          invaderProjectile.position.y + invaderProjectile.height >=
            this.player.position.y &&
          invaderProjectile.position.x + invaderProjectile.width >=
            this.player.position.x &&
          invaderProjectile.position.x <=
            this.player.position.x + this.player.width
        ) {
          // Remove projectile that hits player
          setTimeout(() => {
            this.invaderProjectiles.splice(invaderProjectilesIndex, 1);
            this.player.opacity = 0;
            this.game.over = true;
            this.displayGameOver();
          }, 0);

          setTimeout(() => {
            this.invaderProjectiles.splice(invaderProjectilesIndex, 1);
            this.player.opacity = 0;
            this.game.active = false;
          }, 4000);

          // Player particles in death
          this.createParticles({
            object: this.player,
            color: "red",
            fades: true,
          });
        }
      }
    );
  };

  /**
   * Update the player projectiles.
   */
  updatePlayerProjectiles = () => {
    this.playerProjectiles.forEach((projectile, i) => {
      if (projectile.position.y + projectile.radius <= 0) {
        setTimeout(() => {
          // clear projectile if it goes outside of canvas
          this.playerProjectiles.splice(i, 1);
        }, 0);
      } else {
        projectile.update();
      }
    });
  };

  /**
   * Update the grid of invaders.
   */
  updateGrid = () => {
    this.grids.forEach((grid, gridIndex) => {
      grid.update();

      // Spawn projectiles
      if (this.frames % 100 === 0 && grid.invaders.length > 0) {
        grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
          this.invaderProjectiles
        );
      }

      grid.invaders.forEach((invader, invaderIndex) => {
        invader.update({ velocity: grid.velocity });

        // Projectiles hit enemies
        this.playerProjectiles.forEach((projectile, projectileIndex) => {
          if (
            projectile.position.y - projectile.radius <=
              invader.position.y + invader.height &&
            projectile.position.x + projectile.radius >= invader.position.x &&
            projectile.position.x - projectile.radius <=
              invader.position.x + invader.width &&
            projectile.position.y + projectile.radius >= invader.position.y
          ) {
            setTimeout(() => {
              const invaderFound = grid.invaders.find(
                (currentInvader) => currentInvader === invader
              );
              const projectileFound = this.playerProjectiles.find(
                (currentProjectile) => currentProjectile === projectile
              );

              // Remove invader and projectile
              if (invaderFound && projectileFound) {
                const audio = new Audio("../assets/audio/explode.wav");
                audio.play();
                audio.volume = 0.15;

                this.score += 100;
                this.scoreElement.textContent = this.score;

                if (this.score > this.bestScore) {
                  this.bestScore = this.score;
                  this.bestScoreElement.textContent = this.score;
                  localStorage.setItem("bestScore", this.bestScore);
                }

                this.createParticles({
                  object: invader,
                  fades: true,
                });

                grid.invaders.splice(invaderIndex, 1);
                this.playerProjectiles.splice(projectileIndex, 1);

                if (grid.invaders.length > 0) {
                  const firstInvader = grid.invaders[0];
                  const lastInvader = grid.invaders[grid.invaders.length - 1];
                  grid.width =
                    lastInvader.position.x -
                    firstInvader.position.x +
                    lastInvader.width;

                  grid.position.x = firstInvader.position.x;
                } else {
                  // Clear empty grids if empty
                  this.grids.splice(gridIndex, 1);
                }
              }
            }, 0);
          }
        });
      });
    });
  };

  /**
   * Move the player based on key presses.
   */
  movePlayer = () => {
    if (this.keys.a.pressed && this.player.position.x >= 0) {
      this.player.velocity.x = -Math.abs(PLAYER_SPEED);
      this.player.rotation = -Math.abs(PLAYER_ROTATION);
    } else if (
      this.keys.d.pressed &&
      this.player.position.x + this.player.width <= canvas.width
    ) {
      this.player.velocity.x = PLAYER_SPEED;
      this.player.rotation = PLAYER_ROTATION;
    } else {
      this.player.velocity.x = 0;
      this.player.rotation = 0;
    }
  };

  /**
   * Create particles for an object.
   * @param {Object} options - The options for creating particles.
   * @param {Object} options.object - The object to create particles for.
   * @param {string} [options.color="#BAA0DE"] - The color of the particles.
   * @param {boolean} options.fades - Whether the particles fade out.
   */
  createParticles = ({ object, color = "#BAA0DE", fades }) => {
    for (let i = 0; i < 15; i++) {
      this.particles.push(
        new Particle({
          position: {
            x: object.position.x + object.width / 2,
            y: object.position.y + object.height / 2,
          },
          velocity: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
          },
          radius: Math.random() * 3,
          color: color,
          fades: fades,
        })
      );
    }
  };

  /**
   * Spawn invaders at random intervals.
   */
  spawnInvaders = () => {
    if (this.frames % this.randomInterval === 0) {
      this.grids.push(new InvadersGrid());
      this.randomInterval = Math.trunc(Math.random() * 500 + 500);
      this.frames = 0;
    }
  };

  /**
   * Spawn initial particles.
   */
  spawnParticles = () => {
    for (let i = 0; i < 100; i++) {
      this.particles.push(
        new Particle({
          position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
          },
          velocity: {
            x: 0,
            y: 0.3,
          },
          radius: Math.random() * 2,
          color: "white",
        })
      );
    }
  };

  /**
   * Handle keypress events for player movement and actions.
   */
  handleKeypress = () => {
    // move player
    window.addEventListener("keydown", this.handleKeydown);
    window.addEventListener("keyup", this.handleKeyup);
  };

  /**
   * Handle keydown events.
   * @param {KeyboardEvent} e - The keyboard event.
   */
  handleKeydown = (e) => {
    if (this.game.over) return;
    const key = e.key;

    switch (key) {
      case "a":
      case "ArrowLeft":
        this.keys.a.pressed = true;
        break;
      case "d":
      case "ArrowRight":
        this.keys.d.pressed = true;
        break;
      case " ":
        this.keys.space.pressed = true;
        if (this.playerProjectiles.length <= 1) {
          this.playerProjectiles.push(
            new PlayerProjectile({
              position: {
                x: this.player.position.x + this.player.width / 2,
                y: this.player.position.y,
              },
              velocity: {
                x: 0,
                y: PROJECTILE_SPEED,
              },
            })
          );
        }
        break;
    }
  };

  /**
   * Handle keyup events.
   * @param {KeyboardEvent} e - The keyboard event.
   */
  handleKeyup = (e) => {
    const key = e.key;
    switch (key) {
      case "a":
      case "ArrowLeft":
        this.keys.a.pressed = false;
        break;
      case "d":
      case "ArrowRight":
        this.keys.d.pressed = false;
        break;
      case " ":
        this.keys.space.pressed = false;
        break;
    }
  };

  /**
   * Clean up the game instance.
   */
  cleanup = () => {
    // Remove event listeners
    window.removeEventListener("keydown", this.handleKeydown);
    window.removeEventListener("keyup", this.handleKeyup);

    // Stop animations
    cancelAnimationFrame(this.animationFrameId);

    // Stop background music
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  };

  /**
   * Display the game over screen.
   */
  displayGameOver = () => {
    ctx.font = "50px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.strokeText("Game Over", canvas.width / 2, canvas.height / 2);
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

    const gameOverSound = new Audio("../assets/audio/game-over.wav");
    gameOverSound.play();
    gameOverSound.volume = 0.1;
  };

  startBackgroundMusic = () => {
    // Create the background music element
    this.backgroundMusic = new Audio("./assets/audio/background.wav");
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.3;
    this.backgroundMusic.play();
  };
}
