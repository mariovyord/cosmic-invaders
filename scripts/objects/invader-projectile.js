import { ctx } from "../core/canvas.js";

export class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 4;
    this.height = 10;

    // Play the shoot sound when the invader shoots
    /** @type {HTMLAudioElement} */
    this.shootSound = new Audio("../assets/audio/invader-shoot.wav");
    this.shootSound.play();
    this.shootSound.volume = 0.3;
  }

  draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}
