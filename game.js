let stats = {
  hits: 0,
  homeRuns: 0,
  outs: 0,
};

const pitcherName = "ミッドナイト・キャット";
const batterName = "ボウル・ドッグ";
const swingZoneX = 0.5;
const swingZoneY = 0.78;
const swingToleranceX = 42;
const swingToleranceY = 52;

let ball = {};
let swing = { active: false, timer: 0 };
let message = "Jキーでバットを振って、犬バッターが決めるのだ！";
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
  drawBatter();
  drawBat();
  handleBall();
  renderMessage();
  updateStats();
}

function drawSky() {
  clear();
  background(10, 2, 6);
  noStroke();
  fill(46, 17, 54);
  rect(0, 0, width, height * 0.45);
  fill(25, 9, 22);
  rect(0, height * 0.45, width, height * 0.55);
}

function drawField() {
  noStroke();
  fill(28, 14, 6);
  rect(0, height * 0.7, width, height * 0.3);
  fill(255, 255, 255, 20);
  rect(width * 0.25, height * 0.7, width * 0.5, height * 0.03);
  fill(255, 255, 255, 12);
  rect(width * 0.35, height * 0.65, width * 0.3, height * 0.05);
}

function drawPitcher() {
  const centerX = width * 0.5;
  const top = height * 0.15;
  fill(57, 36, 96);
  circle(centerX, top + 10, 60);
  fill(255);
  ellipse(centerX - 18, top - 5, 18, 22);
  ellipse(centerX + 18, top - 5, 18, 22);
  fill(255);
  ellipse(centerX - 10, top + 5, 16, 20);
  ellipse(centerX + 10, top + 5, 16, 20);
  fill(24, 20, 32);
  ellipse(centerX - 12, top + 8, 6, 4);
  ellipse(centerX + 12, top + 8, 6, 4);
  fill(254, 218, 112);
  arc(centerX, top + 20, 26, 12, 0, PI);
  noStroke();
  fill(90, 70, 110);
  rect(centerX - 30, top + 30, 60, 40, 16, 16, 8, 8);
  fill(255, 255, 255, 60);
  textSize(12);
  textAlign(CENTER, CENTER);
  text(pitcherName, centerX, top + 52);
}

function drawBat() {
  push();
  stroke(255, 190, 120);
  strokeWeight(12);
  line(width * 0.55, height * 0.76, width * 0.6, height * 0.62);
  pop();
}

function drawBatter() {
  const centerX = width * 0.5;
  const centerY = height * 0.82;
  fill(255, 235, 210);
  ellipse(centerX, centerY - 10, 70, 70);
  fill(183, 125, 55);
  rect(centerX - 30, centerY - 5, 60, 70, 18);
  fill(255, 235, 210);
  ellipse(centerX - 20, centerY - 40, 18, 18);
  ellipse(centerX + 20, centerY - 40, 18, 18);
  fill(30, 20, 12);
  ellipse(centerX - 8, centerY - 13, 10, 6);
  ellipse(centerX + 8, centerY - 13, 10, 6);
  fill(255, 120, 120);
  arc(centerX, centerY - 5, 28, 16, 0, PI);
  fill(255, 255, 255, 130);
  textSize(14);
  textAlign(CENTER, CENTER);
  text(batterName, centerX, centerY + 42);
}

function launchPitch() {
  ball = {
    x: width * 0.5 + random(-80, 80),
    y: -40,
    radius: 18,
    speed: random(6.5, 9),
    thrown: true,
    flying: false,
    hit: false,
  };
  message = `${pitcherName}の速球が正面に向かってくる！`;
}

function handleBall() {
  if (ball.flying) {
    animateFlight();
  } else if (ball.thrown) {
    ball.y += ball.speed;
    drawBall(ball.x, ball.y, ball.radius, color(255, 204, 102));
    if (swing.active) drawSwingAura();
    if (ball.y > height + ball.radius) {
      registerOut(`${batterName}が空振りしちゃった…`);
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
  const startY = height * 0.78;
  const targetY = -ball.flightDistance;
  ball.x = lerp(ball.startX, ball.targetX, t);
  ball.y = lerp(startY, targetY, t);
  drawBall(ball.x, ball.y, ball.radius, color(255, 198, 120, 200));
  drawTrail();
  if (t >= 1) {
    ball.flying = false;
    ball.thrown = false;
    nextPitchTimer = 35;
    message = ball.isHomeRun ? "ホームラン！キャットもあきれ顔？" : "いいヒット！犬がウキウキだ";
  }
}

function drawTrail() {
  push();
  noFill();
  stroke(255, 255, 255, 120);
  strokeWeight(2);
  beginShape();
  for (let offset = 0; offset < 8; offset++) {
    const t = max(0, (ball.flightTimer - offset) / ball.flightDuration);
    const px = lerp(ball.startX, ball.targetX, t);
    const py = lerp(height * 0.78, -ball.flightDistance, t);
    vertex(px, py);
  }
  endShape();
  pop();
}

function keyPressed() {
  if (key === "j" || key === "J") {
    swing.active = true;
    swing.timer = 0;
    if (ball.thrown && !ball.flying) {
      checkHit();
    } else if (!ball.thrown) {
      message = "次のピッチを待ちながら、犬もぐっとこらえるよ";
    }
  }
}

function keyReleased() {
  if (key === "j" || key === "J") {
    swing.active = false;
  }
}

function checkHit() {
  swing.timer++;
  const zoneX = width * swingZoneX;
  const zoneY = height * swingZoneY;
  const distanceX = abs(ball.x - zoneX);
  const distanceY = abs(ball.y - zoneY);
  if (distanceX < swingToleranceX && distanceY < swingToleranceY) {
    registerHit();
  } else {
    message = "惜しかった！キャットのフォームを読み切れなかったね";
  }
}

function registerHit() {
  stats.hits += 1;
  const travel = map(ball.speed, 6.5, 9, 260, 420) + random(-20, 40);
  const isHomeRun = travel > 330;
  if (isHomeRun) {
    stats.homeRuns += 1;
  }
  ball.flying = true;
  ball.hit = true;
  ball.flightDistance = travel;
  ball.flightDuration = 65;
  ball.flightTimer = 0;
  ball.isHomeRun = isHomeRun;
  ball.startX = ball.x;
  ball.targetX = constrain(ball.x + random(-60, 60), 40, width - 40);
  message = isHomeRun ? "ホームラン！！犬と猫も声をあげて盛り上がる！" : "ナイスヒット！猫ピッチャーも舌を巻いたよ";
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
