import { canvas } from "../core/canvas.js";
import { IMAGE_WIDTH, IMAGE_HEIGHT } from "../core/constants.js";
import { Invader } from "./invader.js";

export class InvadersGrid {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    };
    this.velocity = {
      x: 3,
      y: 0,
    };
    this.invaders = [];

    const columns = Math.floor(Math.random() * 10 + 5);
    const rows = Math.floor(Math.random() * 5 + 2);

    this.width = columns * IMAGE_WIDTH;

    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        this.invaders.push(
          new Invader({
            position: {
              x: i * IMAGE_WIDTH,
              y: j * IMAGE_HEIGHT,
            },
          })
        );
      }
    }
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.y = 0;

    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y += IMAGE_HEIGHT;
    }
  }
}
