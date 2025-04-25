const fs = require('fs');
const { createCanvas } = require('canvas');
const pngToIco = require('png-to-ico');

// Create a canvas for our icon
const canvas = createCanvas(256, 256);
const ctx = canvas.getContext('2d');

// Draw a colorful background
ctx.fillStyle = '#3498db';
ctx.fillRect(0, 0, 256, 256);

// Draw a checkbox-like pattern
ctx.fillStyle = '#ffffff';
ctx.strokeStyle = '#2c3e50';
ctx.lineWidth = 8;

// Draw a few checkboxes
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    const x = 40 + i * 70;
    const y = 40 + j * 70;
    const size = 50;
    
    ctx.strokeRect(x, y, size, size);
    
    // Make some checkboxes checked
    if ((i + j) % 2 === 0) {
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 25);
      ctx.lineTo(x + 20, y + 40);
      ctx.lineTo(x + 40, y + 15);
      ctx.lineWidth = 8;
      ctx.stroke();
    }
  }
}

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('icon.png', buffer);

// Convert to ICO
pngToIco(['icon.png'])
  .then(buf => {
    fs.writeFileSync('icon.ico', buf);
    console.log('Icon created successfully!');
  })
  .catch(err => console.error(err));
