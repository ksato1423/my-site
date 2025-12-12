let stats = {
  hits: 0,
  homeRuns: 0,
  outs: 0,
};

const swingZoneX = 0.45;
const batterYRatio = 0.72;
const swingToleranceX = 28;
const swingToleranceY = 55;
const swingDuration = 12;

let ball = {};
let swing = { active: false, timer: 0 };
let message = "スペースキーでスイング！";
let nextPitchTimer = 0;
let hitNode;
let homeRunNode;
let outNode;

function setup() {
  const canvas = createCanvas(720, 420);
  canvas.parent("game-wrapper");
  hitNode = document.getElementById("hitCount");
  homeRunNode = document.getElementById("homeRunCount");
  outNode = document.getElementById("outCount");
  textFont("Hiragino Kaku Gothic ProN, Yu Gothic, sans-serif");
  launchPitch();
}

function draw() {
  drawSky();
  drawField();
  drawPitcher();
  drawBat();
  handleBall();
  renderMessage();
  updateStats();
}

function drawSky() {
  clear();
  background(2, 7, 18);
  noStroke();
  fill(255, 212, 134, 35);
  ellipse(width * 0.6, height * 0.1, 200, 160);
}

function drawField() {
  push();
  translate(0, height * 0.35);
  fill(8, 40, 38, 150);
  stroke(255, 255, 255, 60);
  strokeWeight(1.5);
  rect(0, 0, width, height * 0.65);
  noFill();
  stroke(255, 255, 255, 30);
  arc(width * 0.35, height * 0.7, width * 0.8, height * 0.8, PI, TWO_PI);
  arc(width * 0.35, height * 0.71, width * 0.35, height * 0.35, PI, TWO_PI);
  pop();
}

function drawPitcher() {
  noStroke();
  fill(255, 226, 179);
  circle(width * 0.8, height * 0.45, 28);
  fill(60, 100, 190);
  rect(width * 0.78, height * 0.45, 12, 45, 6);
}

function drawBat() {
  push();
  translate(width * 0.25, height * batterYRatio);
  rotate(-0.15);
  stroke(255, 208, 134);
  strokeWeight(8);
  line(0, 0, 100, -25);
  pop();
}

function launchPitch() {
  ball = {
    x: width + 30,
    y: height * 0.48 + random(-35, 45),
    radius: 18,
    speed: random(7, 9.5),
    thrown: true,
    flying: false,
    hit: false,
  };
  message = "ピッチャー、ボールを投げたよ";
}

function handleBall() {
  if (ball.flying) {
    animateFlight();
  } else if (ball.thrown) {
    ball.x -= ball.speed;
    drawBall(ball.x, ball.y, ball.radius, color(255, 218, 93));
    if (swing.active) drawSwingAura();
    if (ball.x < -ball.radius) {
      registerOut("打ちそこねたよ");
    }
  } else {
    if (nextPitchTimer <= 0) {
      launchPitch();
    } else {
      nextPitchTimer--;
    }
  }
}

function drawBall(x, y, radius, col) {
  push();
  fill(col);
  stroke(245, 90, 90);
  strokeWeight(2);
  circle(x, y, radius);
  stroke(255);
  strokeWeight(1);
  line(x - radius * 0.3, y - radius * 0.4, x - radius * 0.1, y + radius * 0.4);
  line(x + radius * 0.3, y - radius * 0.4, x + radius * 0.1, y + radius * 0.4);
  pop();
}

function drawSwingAura() {
  push();
  stroke(255, 255, 255, 140);
  strokeWeight(2);
  noFill();
  arc(width * 0.25, height * 0.75, 120, 60, -PI / 6, PI / 2);
  pop();
}

function animateFlight() {
  ball.flightTimer += 1;
  const t = min(ball.flightTimer / ball.flightDuration, 1);
  const startX = width * 0.35;
  const targetX = width + ball.flightDistance;
  ball.x = lerp(startX, targetX, t);
  ball.y = height * 0.4 - sin(t * PI) * ball.flightHeight;
  drawBall(ball.x, ball.y, ball.radius, color(255, 240, 180));
  drawTrail();
  if (t >= 1) {
    ball.flying = false;
    ball.thrown = false;
    nextPitchTimer = 30;
    message = ball.isHomeRun ? "ホームラン！みんなでお祝いしよう" : "いいヒットだったね";
  }
}

function drawTrail() {
  push();
  stroke(255, 255, 255, 120);
  strokeWeight(1.5);
  noFill();
  beginShape();
  for (let offset = 0; offset < 10; offset++) {
    const t = max(0, (ball.flightTimer - offset) / ball.flightDuration);
    const px = lerp(width * 0.35, width + ball.flightDistance, t);
    const py = height * 0.4 - sin(t * PI) * ball.flightHeight;
    vertex(px, py);
  }
  endShape();
  pop();
}

function keyPressed() {
  if (key === " ") {
    swing.active = true;
    swing.timer = 0;
    if (ball.thrown && !ball.flying) {
      checkHit();
    } else if (!ball.thrown) {
      message = "次のピッチを待ってね";
    }
  }
}

function keyReleased() {
  if (key === " ") {
    swing.active = false;
  }
}

function checkHit() {
  swing.timer++;
  const zoneX = width * swingZoneX;
  const distanceX = abs(ball.x - zoneX);
  const zoneY = height * batterYRatio;
  const distanceY = abs(ball.y - zoneY);
  if (distanceX < swingToleranceX && distanceY < swingToleranceY) {
    registerHit();
  } else {
    message = "タイミングが合わなかった...";
  }
}

function registerHit() {
  stats.hits += 1;
  const travel = map(ball.speed, 7, 9.5, 220, 340) + random(-15, 25);
  const isHomeRun = travel > 280;
  if (isHomeRun) {
    stats.homeRuns += 1;
  }
  ball.flying = true;
  ball.hit = true;
  ball.flightDistance = travel;
  ball.flightHeight = map(travel, 220, 360, 90, 200);
  ball.flightDuration = 65;
  ball.flightTimer = 0;
  ball.isHomeRun = isHomeRun;
  message = isHomeRun ? "ホームラン！！" : "ナイスヒット！";
}

function registerOut(reason) {
  stats.outs += 1;
  ball.thrown = false;
  ball.flying = false;
  nextPitchTimer = 40;
  message = reason;
  if (stats.outs % 3 === 0) {
    message = `アウト ${stats.outs} 個目、チェンジ！`;
  }
}

function renderMessage() {
  fill(255, 255, 255, 200);
  noStroke();
  textSize(18);
  textAlign(CENTER, CENTER);
  text(message, width / 2, height * 0.06);
}

function updateStats() {
  if (hitNode) hitNode.textContent = stats.hits;
  if (homeRunNode) homeRunNode.textContent = stats.homeRuns;
  if (outNode) outNode.textContent = stats.outs;
}
