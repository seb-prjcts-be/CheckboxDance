let checkbox = [];
let slc_linetype, sli_speed, btn_clear, btn_add_three;
let counter = 0;

class Node {
  constructor(x, y, checkbox) {
    this.x = x;
    this.y = y;
    this.originalX = x;
    this.originalY = y;
    this.checkbox = checkbox;
    this.checked = false;
    this.timeOffset = random(TWO_PI); // Random starting phase
    this.clickCount = 0;
    this.lastClickTime = 0;
    this.amplitude = 1.0;
    this.frequency = 1.0;
    this.t = map(x, 100, width - 100, -1, 1);
  }

  update(speedMultiplier) {
    if (this.checked) {
      // Add variation to x position with multiple sine waves
      let xOffset = sin(this.t + this.timeOffset) * 50 * this.amplitude + 
                   sin(this.t * 0.5 + this.timeOffset) * 30 * this.amplitude;
      
      // Add variation to y position with cosine waves
      let yOffset = cos(this.t * 0.7 + this.timeOffset) * 20 * this.amplitude + 
                   cos(this.t * 0.3 + this.timeOffset) * 15 * this.amplitude;
      
      // Update positions with offsets
      this.x = map(sin(this.t), -1, 1, 100, width / 2 - 100) + xOffset;
      this.y = this.originalY + yOffset;
      
      // Update time with individual frequency
      this.t += (speedMultiplier * 0.01) * this.frequency;
    }
  }

  onClick() {
    let currentTime = millis();
    if (currentTime - this.lastClickTime < 500) { // Double click detection
      this.clickCount++;
      this.updateProperties();
    }
    this.lastClickTime = currentTime;
    this.checked = this.checkbox.checked();
  }

  updateProperties() {
    switch (this.clickCount % 4) {
      case 0:
        this.amplitude = 1.0;
        this.frequency = 1.0;
        break;
      case 1:
        this.amplitude = 1.5;
        this.frequency = 0.8;
        break;
      case 2:
        this.amplitude = 0.5;
        this.frequency = 1.2;
        break;
      case 3:
        this.amplitude = 2.0;
        this.frequency = 0.5;
        break;
    }
  }

  display() {
    if (this.checked) {
      push();
      // Visual feedback based on properties
      strokeWeight(map(this.amplitude, 0.5, 2.0, 1, 4));
      let hue = map(this.frequency, 0.5, 1.2, 0, 360);
      stroke(hue, 70, 70);
      point(this.x, this.y);
      pop();
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  smooth();
  initializeElements();
  
  // Listen for window resize events from Electron
  if (typeof window.electron !== 'undefined') {
    window.electron.receive('window-resize', (dimensions) => {
      console.log('Resize event received:', dimensions);
      resizeCanvas(dimensions.width, dimensions.height);
      initializeElements();
    });
  }
}

function draw() {
  background(245);
  counter = 0;

  // Interface adjustments
  push();
  translate(width / 2, 0);
  strokeWeight(0.5);
  stroke(0);

  // Use selected line type
  switch (slc_linetype.value()) {
    case "3":
      drawBezierCurve();
      break;
    case "1":
      drawTriangles();
      break;
    case "2":
      drawTriangleFan();
      break;
  }
  pop();

  // Interface label
  fill(100);
  text("@prjcts.be", width - 100, height - 60);
}

function initializeElements() {
  // Generate checkbox grid
  checkbox = [];
  for (let y = 100; y < height - 100; y += 20) {
    for (let x = 100; x < width / 2 - 100; x += 20) {
      let cb = createCheckbox("", false);
      cb.position(x, y);
      let node = new Node(x, y, cb);
      cb.changed(() => node.onClick());
      checkbox.push(node);
    }
  }

  createInterface();
}

function createInterface() {
  // Line type select
  slc_linetype = createSelect();
  slc_linetype.position(184, height - 60);
  slc_linetype.option("Bezier Curves", "3");
  slc_linetype.option("Vertices", "1");
  slc_linetype.option("Triangle Fan", "2");

  // Clear button
  btn_clear = createButton("clear");
  btn_clear.position(100, height - 60);
  btn_clear.mousePressed(function() {
    checkbox.forEach(node => {
      node.checkbox.checked(false);
      node.checked = false;
    });
  });

  // +3 button
  btn_add_three = createButton("+3");
  btn_add_three.position(150, height - 60);
  btn_add_three.mousePressed(function() {
    for (let i = 0; i < 3; i++) {
      let randomIndex = floor(random(checkbox.length));
      let node = checkbox[randomIndex];
      node.checkbox.checked(true);
      node.checked = true;
      node.t = map(node.x, 100, width - 100, -1, 1);
    }
  });

  // Speed slider
  sli_speed = createSlider(0, 4, 1, 0.1);
  sli_speed.position(300, height - 60);
  sli_speed.size(80);
}

function drawBezierCurve() {
  let activePoints = checkbox.filter(node => node.checked);
  if (activePoints.length > 2) {
    fill(255, 100);
    beginShape();
    curveVertex(activePoints[activePoints.length - 1].x, activePoints[activePoints.length - 1].y);
    activePoints.forEach(p => curveVertex(p.x, p.y));
    curveVertex(activePoints[0].x, activePoints[0].y);
    curveVertex(activePoints[1].x, activePoints[1].y);
    endShape();

    noFill();
    beginShape();
    curveVertex(activePoints[activePoints.length - 1].x, activePoints[activePoints.length - 1].y);
    activePoints.forEach(p => {
      curveVertex(p.x, p.y);
      p.display(); // Display individual nodes
    });
    curveVertex(activePoints[0].x, activePoints[0].y);
    curveVertex(activePoints[1].x, activePoints[1].y);
    endShape();
  }
  updateCheckboxPositions();
}

function drawTriangles() {
  noFill(); 
  beginShape();
  checkbox.forEach(node => {
    if (node.checked) {
      vertex(node.x, node.y);
      node.display();
    }
  });
  endShape();
  updateCheckboxPositions();
  fill(255);
}

function drawTriangleFan() {
  fill(255);
  beginShape(TRIANGLE_FAN);
  checkbox.forEach(node => {
    if (node.checked) {
      vertex(node.x, node.y);
      node.display();
    }
  });
  endShape();
  updateCheckboxPositions();
}

function updateCheckboxPositions() {
  checkbox.forEach(node => node.update(sli_speed.value()));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initializeElements();
}