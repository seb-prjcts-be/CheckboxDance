let checkbox = [];
let slc_linetype, sli_speed, btn_clear, btn_add_three;
let counter = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  smooth();
  initializeElements();
}

function draw() {
  background(245);
  counter = 0;

  // Interface aanpassingen
  push();
  translate(width / 2, 0);
  strokeWeight(0.5);
  stroke(0);

  // Gebruik de geselecteerde lijnstijl
  switch (slc_linetype.value()) {
    case "3":
      drawBezierCurve();
      break;
    case "1": 
      drawTriangles(); //strip
      break;
    case "2":
      drawTriangleFan();
      break;
  }
  pop();

  // Interface-label
  fill(100);
  text("@prjcts.be", width - 100, height - 60);
//     let a = createA('https://prjcts.be', '@prjcts.be','_blank');
//   a.position( width - 100, height - 60);
}

function initializeElements() {
  // Checkbox grid genereren
  checkbox = [];
  for (let y = 100; y < height - 100; y += 20) {
    for (let x = 100; x < width / 2 - 100; x += 20) {
      let cb = createCheckbox("", false);
      cb.position(x, y);
      cb.changed(() => toggleCheckbox(cb));
      checkbox.push({ checkbox: cb, x, y, c: false, t: 0 });
    }
  }

  createInterface();
}

function createInterface() {
  // Select-element voor lijnen
  if (!slc_linetype) {
    slc_linetype = createSelect();
    slc_linetype.option("Bezier Curves", "3");
    slc_linetype.option("Triangle Strip", "1");
    slc_linetype.option("Triangle Fan", "2");
  }
  slc_linetype.position(184, height - 60);

  // Clear-knop
  if (!btn_clear) {
    btn_clear = createButton("clear");
    btn_clear.mousePressed(clearBG);
  }
  btn_clear.position(100, height - 60);

  // +3-knop
  if (!btn_add_three) {
    btn_add_three = createButton("+3");
    btn_add_three.mousePressed(checkThree);
  }
  btn_add_three.position(150, height - 60);

  // Slider voor snelheid
  if (!sli_speed) {
    sli_speed = createSlider(0, 4, 1, 0.1);
  }
  sli_speed.position(300, height - 60);
  sli_speed.size(80);
}

function toggleCheckbox(cb) {
  let linkedCheckbox = checkbox.find(item => item.checkbox === cb);
  if (linkedCheckbox) {
    linkedCheckbox.c = cb.checked();
    linkedCheckbox.t = map(linkedCheckbox.x, 100, width - 100, -1, 1);
  }
}

function clearBG() {
  checkbox.forEach(item => {
    item.checkbox.checked(false);
    item.c = false;
  });
}

function checkThree() {
  for (let i = 0; i < 3; i++) {
    let randomIndex = floor(random(checkbox.length));
    let item = checkbox[randomIndex];
    item.checkbox.checked(true);
    item.c = true;
    item.t = map(item.x, 100, width - 100, -1, 1);
  }
}

function drawBezierCurve() {
  let activePoints = checkbox.filter(item => item.c).map(item => ({ x: item.x, y: item.y }));

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
    activePoints.forEach(p => curveVertex(p.x, p.y));
    curveVertex(activePoints[0].x, activePoints[0].y);
    curveVertex(activePoints[1].x, activePoints[1].y);
    endShape();
  }

  updateCheckboxPositions();
}

function drawTriangles() {
  fill(255,100);
  beginShape(TRIANGLE_STRIP);
  checkbox.forEach(item => {
    if (item.c) {
      vertex(item.x, item.y);
      circle(item.x, item.y, 3);
    }
  });
  endShape();
  updateCheckboxPositions();
}

function drawTriangleFan() {
  fill(255,100);
  beginShape(TRIANGLE_FAN);
  checkbox.forEach(item => {
    if (item.c) {
      vertex(item.x, item.y);
      circle(item.x, item.y, 3);
    }
  });
  endShape();
  updateCheckboxPositions();
}

function updateCheckboxPositions() {
  checkbox.forEach(item => {
    if (item.c) {
      item.x = map(sin(item.t), -1, 1, 100, width / 2 - 100);
      item.t += sli_speed.value() * 0.01;
    }
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initializeElements();
}
