import { Player } from "./scripts/objects/player.js";
import { Particle } from "./scripts/objects/particle.js";
import { Grid } from "./scripts/objects/grid.js";
import { PlayerProjectile } from "./scripts/objects/player-projectile.js";
import { ctx, canvas } from "./scripts/core/canvas.js";
import {
  PLAYER_SPEED,
  PLAYER_ROTATION,
  PROJECTILE_SPEED,
} from "./scripts/core/constants.js";

const scoreElement = document.querySelector(".score");

const gameTemplate = document.getElementById("game-template");
const startTemplate = document.getElementById("start-template");

const startBtn = document.getElementById("start-btn");
startBtn.addEventListener("click", () => {
  startTemplate.classList.add("hidden");
  gameTemplate?.classList.remove("hidden");
  startGame();
});

function backToStart() {
  gameTemplate.classList.add("hidden");
  startTemplate.classList.remove("hidden");
}

function startGame() {
  const player = new Player();
  const playerProjectiles = [];
  const grids = [];
  const particles = [];
  const invaderProjectiles = [];

  // button press
  const keys = {
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

  let frames = 0;
  // interval for spawning enemies
  let randomInterval = Math.trunc(Math.random() * 500 + 500);
  const game = {
    over: false,
    active: true,
  };

  for (let i = 0; i < 100; i++) {
    particles.push(
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

  let score = 0;

  function createParticles({ object, color = "#BAA0DE", fades }) {
    for (let i = 0; i < 15; i++) {
      particles.push(
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
  }

  // game loop
  function animate() {
    if (!game.active) {
      backToStart();
      return undefined;
    }

    requestAnimationFrame(animate);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // update player
    player.update();

    // update particles
    particles.forEach((particle, particleIndex) => {
      if (particle.position.y - particle.radius >= canvas.height) {
        particle.position.x = Math.random() * canvas.width;
        particle.position.y = -particle.radius;
      }

      if (particle.opacity <= 0) {
        setTimeout(() => {
          // clear particles
          particles.splice(particleIndex, 1);
        }, 0);
      } else {
        particle.update();
      }
    });

    // update projectiles
    invaderProjectiles.forEach((invaderProjectile, invaderProjectilesIndex) => {
      if (
        invaderProjectile.position.y + invaderProjectile.height >=
        canvas.height
      ) {
        setTimeout(() => {
          // clear projectile if it goes outside of canvas
          invaderProjectiles.splice(invaderProjectilesIndex, 1);
        }, 0);
      } else {
        invaderProjectile.update();
      }

      // projectile hits player
      if (
        invaderProjectile.position.y + invaderProjectile.height >=
          player.position.y &&
        invaderProjectile.position.x + invaderProjectile.width >=
          player.position.x &&
        invaderProjectile.position.x <= player.position.x + player.width
      ) {
        // remove projectile that hits player
        setTimeout(() => {
          invaderProjectiles.splice(invaderProjectilesIndex, 1);
          player.opacity = 0;
          game.over = true;
        }, 0);

        setTimeout(() => {
          invaderProjectiles.splice(invaderProjectilesIndex, 1);
          player.opacity = 0;
          game.active = false;
        }, 2000);

        // player particles
        createParticles({
          object: player,
          color: "red",
          fades: true,
        });
      }
    });

    playerProjectiles.forEach((projectile, i) => {
      if (projectile.position.y + projectile.radius <= 0) {
        setTimeout(() => {
          // clear projectile if it goes outside of canvas
          playerProjectiles.splice(i, 1);
        }, 0);
      } else {
        projectile.update();
      }
    });

    // update grid
    grids.forEach((grid, gridIndex) => {
      grid.update();

      // spawn projectiles
      if (frames % 100 === 0 && grid.invaders.length > 0) {
        grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
          invaderProjectiles
        );
      }

      grid.invaders.forEach((invader, invaderIndex) => {
        invader.update({ velocity: grid.velocity });

        // projectiles hit enemies
        playerProjectiles.forEach((projectile, projectileIndex) => {
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
              const projectileFound = playerProjectiles.find(
                (currentProjectile) => currentProjectile === projectile
              );

              // remove invader and projectile
              if (invaderFound && projectileFound) {
                // create particles on destroyed enemy
                score += 100;
                scoreElement.textContent = score;

                createParticles({
                  object: invader,
                  fades: true,
                });

                grid.invaders.splice(invaderIndex, 1);
                playerProjectiles.splice(projectileIndex, 1);

                if (grid.invaders.length > 0) {
                  const firstInvader = grid.invaders[0];
                  const lastInvader = grid.invaders[grid.invaders.length - 1];
                  grid.width =
                    lastInvader.position.x -
                    firstInvader.position.x +
                    lastInvader.width;

                  grid.position.x = firstInvader.position.x;
                } else {
                  // clear empty grids if empty
                  grids.splice(gridIndex, 1);
                }
              }
            }, 0);
          }
        });
      });
    });
    // move player
    if (keys.a.pressed && player.position.x >= 0) {
      player.velocity.x = -Math.abs(PLAYER_SPEED);
      player.rotation = -Math.abs(PLAYER_ROTATION);
    } else if (
      keys.d.pressed &&
      player.position.x + player.width <= canvas.width
    ) {
      player.velocity.x = PLAYER_SPEED;
      player.rotation = PLAYER_ROTATION;
    } else {
      player.velocity.x = 0;
      player.rotation = 0;
    }

    // spawning enemies
    if (frames % randomInterval === 0) {
      grids.push(new Grid());
      randomInterval = Math.trunc(Math.random() * 500 + 500);
      frames = 0;
    }

    frames++;
  }
  // start game
  animate();

  // move player
  window.addEventListener("keydown", (e) => {
    if (game.over) return;
    const key = e.key;

    switch (key) {
      case "a":
        keys.a.pressed = true;
        break;
      case "ArrowLeft":
        keys.a.pressed = true;
        break;
      case "d":
        keys.d.pressed = true;
        break;
      case "ArrowRight":
        keys.d.pressed = true;
        break;
      case " ":
        keys.space.pressed = true;
        if (playerProjectiles.length <= 1) {
          playerProjectiles.push(
            new PlayerProjectile({
              position: {
                x: player.position.x + player.width / 2,
                y: player.position.y,
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
  });
  // clear button press
  window.addEventListener("keyup", (e) => {
    const key = e.key;
    switch (key) {
      case "a":
        keys.a.pressed = false;
        break;
      case "ArrowLeft":
        keys.a.pressed = false;
        break;
      case "d":
        keys.d.pressed = false;
        break;
      case "ArrowRight":
        keys.d.pressed = false;
        break;
      case " ":
        keys.space.pressed = false;
        break;
    }
  });
}
