let spriteSheet;
let jumpSheet;
let walkFrames = 4; // 圖片精靈中的影格總數
let scaleFactor = 3; // 角色放大倍率

let charX, charY; // 角色的位置
let speed = 4;    // 角色的移動速度
let direction = 1; // 角色的方向 (1: 右, -1: 左)

let isMoving = false; // 角色是否正在移動

// --- 跳躍物理變數 ---
let velocityY = 0;    // 垂直速度
let gravity = 0.6;    // 重力大小
let jumpForce = -18;  // 向上跳躍的力道 (y 軸向上為負)
let isOnGround = false; // 角色是否在地面上

let jumpFrames = 6; // jump.png 實際上有 6 個影格

// 在 setup() 之前預先載入圖片資源
function preload() {
  // 確保路徑 '1/walk/walk.png' 是相對於您的 index.html 檔案的正確路徑
  spriteSheet = loadImage('1/walk/walk.png');
  jumpSheet = loadImage('1/jump/jump.png');
}

function setup() {
  // 建立一個 2000x2000 的畫布
  createCanvas(2000, 2000);

  // 初始化角色位置在畫布中央
  charX = width / 2;
  charY = height / 2;

  // 移除圖片的綠色背景
  spriteSheet.loadPixels();
  for (let i = 0; i < spriteSheet.pixels.length; i += 4) {
    let r = spriteSheet.pixels[i];
    let g = spriteSheet.pixels[i + 1];
    let b = spriteSheet.pixels[i + 2];
    // 檢查是否為螢光綠 (R=0, G=255, B=0)
    if (r === 0 && g === 255 && b === 0) {
      // 將其 Alpha 值設為 0 (完全透明)
      spriteSheet.pixels[i + 3] = 0;
    }
  }
  spriteSheet.updatePixels();

  // 移除跳躍圖片的綠色背景
  jumpSheet.loadPixels();
  for (let i = 0; i < jumpSheet.pixels.length; i += 4) {
    let r = jumpSheet.pixels[i];
    let g = jumpSheet.pixels[i + 1];
    let b = jumpSheet.pixels[i + 2];
    if (r === 0 && g === 255 && b === 0) {
      jumpSheet.pixels[i + 3] = 0;
    }
  }
  jumpSheet.updatePixels();

  // 設定動畫播放速度 (每秒的影格數)
  // 數值越小，動畫越慢
  frameRate(60);

  // 將圖片的繪製基準點設為中心
  imageMode(CENTER);
}

function draw() {
  // 設定畫布背景顏色
  background('#5e503f');

  // --- 控制邏輯 ---
  isMoving = false;
  if (keyIsDown(LEFT_ARROW)) {
    charX -= speed;
    direction = -1;
    isMoving = true;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    charX += speed;
    direction = 1;
    isMoving = true;
  }

  // --- 物理更新 ---
  // 1. 將重力加到垂直速度上
  velocityY += gravity;
  // 2. 根據速度更新 y 座標
  charY += velocityY;

  // 3. 檢查是否接觸地面 (畫布高度的一半)
  if (charY >= height / 2) {
    charY = height / 2; // 確保角色不會掉到地面以下
    velocityY = 0;    // 停止下墜
    isOnGround = true;
  } else {
    isOnGround = false;
  }

  // --- 邊界偵測 ---
  // 計算角色的半寬，以確保角色的邊緣不會超出畫布
  let charHalfWidth = (Math.round(155 / walkFrames) * scaleFactor) / 2;
  // 使用 constrain() 函式將角色的 x 座標限制在畫布範圍內
  charX = constrain(charX, charHalfWidth, width - charHalfWidth);

  // --- 動畫邏輯 ---
  let currentSheet, frameWidth, sHeight, currentFrame;

  if (isOnGround) {
    // 在地面上：使用走路/站立動畫
    currentSheet = spriteSheet;
    frameWidth = currentSheet.width / walkFrames;
    sHeight = currentSheet.height;
    if (isMoving) {
      // 走路動畫
      currentFrame = floor((frameCount / 8) % walkFrames);
    } else {
      // 站立不動，停在第一格
      currentFrame = 0;
    }
  } else {
    // 在空中：使用跳躍動畫
    currentSheet = jumpSheet;
    frameWidth = currentSheet.width / jumpFrames;
    sHeight = currentSheet.height;
    // 在空中時，固定使用第三個影格 (索引值為 2) 作為跳躍姿勢
    currentFrame = 2;
  }

  // 計算要從圖片精靈中擷取的 x 座標
  let sx = currentFrame * frameWidth;
  let sy = 0; // y 座標為 0，因為所有影格都在同一列
  let sWidth = frameWidth;
  
  // 1. 使用 get() 精確擷取目前影格的圖片
  let frameImage = currentSheet.get(Math.round(sx), sy, Math.round(sWidth), sHeight);

  // --- 繪圖邏輯 ---
  push(); // 儲存目前的繪圖設定
  translate(charX, charY); // 將畫布的原點移動到角色的位置
  scale(direction, 1); // 根據方向翻轉 x 軸 (direction 為 -1 時會水平翻轉)

  // 2. 將擷取到的影格繪製在新原點 (0,0) 上
  // 因為 imageMode 是 CENTER，所以圖片會以 (0,0) 為中心繪製
  image(
    frameImage,
    0, // 相對於新的原點 (charX, charY)
    0, // 相對於新的原點 (charX, charY)
    Math.round(sWidth) * scaleFactor,
    sHeight * scaleFactor
  );
  pop(); // 恢復原本的繪圖設定
}

function keyPressed() {
  // 檢查角色是否在地面上，並且按下的是空白鍵 (keyCode 32)
  if (isOnGround && keyCode === 32) {
    velocityY = jumpForce; // 給予向上的初速度
    isOnGround = false; // 按下跳躍後立刻離開地面
    return false; // 防止瀏覽器預設行為 (例如：捲動頁面)
  }
}
