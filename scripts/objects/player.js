import { ctx, canvas } from "../core/canvas.js";

export class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.opacity = 1;

    this.rotation = 0;

    const image = new Image();
    image.src = "./assets/sprites/spaceship.png";
    image.onload = () => {
      const scale = 1;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;

      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - image.height * scale - 30,
      };
    };
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
    ctx.rotate(this.rotation);

    ctx.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2
    );

    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    ctx.restore();
  }

  update = () => {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
    }
  };
}
