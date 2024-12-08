export const canvas = document.querySelector("canvas");
export const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

// Render pixel art without smoothing
// Source: https://html.spec.whatwg.org/multipage/canvas.html#image-smoothing
ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
