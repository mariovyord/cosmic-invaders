const canvas = document.querySelector('canvas');
const c = canvas?.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
    constructor() {
        this.position = {
            x: 200,
            y: 200,
        };
        this.velocity = {
            x: 0,
            y: 0,
        };

        const image = new Image();
        image.src = './assets/spaceship.png'
        image.onload = () => {
            const scale = 0.15;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
        }
    }

    draw() {
        // c.fillStyle = 'red';
        // c.fillRect(this.position.x, this.position.y, this.width, this.height);
        if (this.image) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
    }

}

const player = new Player();

function animate() {
    requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw()
}

animate();