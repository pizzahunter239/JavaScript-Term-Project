// Game configuration
let canvas, ctx;
let gameState = {
  active: true,
  score: 0
};

// Dimensions
const dimensions = {
  canvas: { width: 500, height: 500 },
  paddle: { width: 80, height: 10, speed: 10 },
  ball: { size: 10, xSpeed: 2, ySpeed: 1 },
  brick: { width: 50, height: 10 }
};

// Game elements
const elements = {
  paddle: {
    x: dimensions.canvas.width / 2 - dimensions.paddle.width / 2,
    y: dimensions.canvas.height - dimensions.paddle.height - 5,
    width: dimensions.paddle.width,
    height: dimensions.paddle.height,
    speed: dimensions.paddle.speed
  },
  ball: {
    x: dimensions.canvas.width / 2,
    y: dimensions.canvas.height / 2,
    width: dimensions.ball.size,
    height: dimensions.ball.size,
    xSpeed: dimensions.ball.xSpeed,
    ySpeed: dimensions.ball.ySpeed
  }
};

// Bricks configuration
const brickConfig = {
  columns: 8,
  currentRows: 3,
  maxRows: 10,
  spacing: 10,
  startX: 15,
  startY: 45,
  collection: [],
  count: 0
};

// Colors
const colors = {
  paddle: "red",
  ball: "white",
  brick: "gray",
  text: "white"
};

// Initialize game
document.addEventListener("DOMContentLoaded", () => {
  initializeGame();
  createBrickLayout();
  requestAnimationFrame(gameLoop);
});

// Setup game canvas and controls
function initializeGame() {
  canvas = document.getElementById("board");
  canvas.width = dimensions.canvas.width;
  canvas.height = dimensions.canvas.height;
  ctx = canvas.getContext("2d");
  
  document.addEventListener("keydown", handleInput);
}

// Create bricks layout
function createBrickLayout() {
  brickConfig.collection = [];
  
  for (let col = 0; col < brickConfig.columns; col++) {
    for (let row = 0; row < brickConfig.currentRows; row++) {
      const brickX = brickConfig.startX + col * (dimensions.brick.width + brickConfig.spacing);
      const brickY = brickConfig.startY + row * (dimensions.brick.height + brickConfig.spacing);
      
      brickConfig.collection.push({
        x: brickX,
        y: brickY,
        width: dimensions.brick.width,
        height: dimensions.brick.height,
        destroyed: false
      });
    }
  }
  
  brickConfig.count = brickConfig.collection.length;
}

// Main game loop
function gameLoop() {
  requestAnimationFrame(gameLoop);
  
  if (!gameState.active) return;
  
  clearCanvas();
  updateBallPosition();
  handleCollisions();
  renderGameElements();
  checkGameProgress();
}

// Clear canvas for redrawing
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Update ball position with current velocity
function updateBallPosition() {
  elements.ball.x += elements.ball.xSpeed;
  elements.ball.y += elements.ball.ySpeed;
}

// Handle all collision detection
function handleCollisions() {
  // Ball and canvas boundaries
  if (elements.ball.y <= 0) {
    elements.ball.ySpeed = Math.abs(elements.ball.ySpeed);
  } else if (elements.ball.x <= 0 || elements.ball.x + elements.ball.width >= dimensions.canvas.width) {
    elements.ball.xSpeed *= -1;
  } else if (elements.ball.y + elements.ball.height >= dimensions.canvas.height) {
    endGame();
    return;
  }
  
  // Ball and paddle
  if (detectCollision(elements.ball, elements.paddle)) {
    // Check direction of collision
    if (isHorizontalCollision(elements.ball, elements.paddle)) {
      elements.ball.xSpeed *= -1;
    } else {
      elements.ball.ySpeed *= -1;
    }
  }
  
  // Ball and bricks
  brickConfig.collection.forEach(brick => {
    if (!brick.destroyed && detectCollision(elements.ball, brick)) {
      brick.destroyed = true;
      gameState.score += 100;
      brickConfig.count--;
      
      // Change ball direction based on collision side
      if (isHorizontalCollision(elements.ball, brick)) {
        elements.ball.xSpeed *= -1;
      } else {
        elements.ball.ySpeed *= -1;
      }
    }
  });
}

// Render all game elements
function renderGameElements() {
  // Draw paddle
  ctx.fillStyle = colors.paddle;
  ctx.fillRect(elements.paddle.x, elements.paddle.y, elements.paddle.width, elements.paddle.height);
  
  // Draw ball
  ctx.fillStyle = colors.ball;
  ctx.fillRect(elements.ball.x, elements.ball.y, elements.ball.width, elements.ball.height);
  
  // Draw bricks
  ctx.fillStyle = colors.brick;
  brickConfig.collection.forEach(brick => {
    if (!brick.destroyed) {
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    }
  });
  
  // Draw score
  ctx.fillStyle = colors.text;
  ctx.font = "20px sans-serif";
  ctx.fillText(gameState.score, 10, 25);
}

// Check game progress (level completion or game over)
function checkGameProgress() {
  if (brickConfig.count === 0) {
    advanceLevel();
  }
}

// Advance to next level
function advanceLevel() {
  // Bonus points for clearing the level
  gameState.score += 100 * brickConfig.currentRows * brickConfig.columns;
  
  // Increase rows up to max
  brickConfig.currentRows = Math.min(brickConfig.currentRows + 1, brickConfig.maxRows);
  
  // Reset bricks for new level
  createBrickLayout();
}

// End the game when ball falls off screen
function endGame() {
  gameState.active = false;
  ctx.font = "20px sans-serif";
  ctx.fillStyle = colors.text;
  ctx.fillText("Game Over: Press 'Space' to Restart", 80, 400);
}

// Handle keyboard input
function handleInput(event) {
  if (!gameState.active) {
    if (event.code === "Space") {
      resetGame();
    }
    return;
  }
  
  const paddleNextX = event.code === "ArrowLeft" 
    ? elements.paddle.x - elements.paddle.speed 
    : event.code === "ArrowRight"
      ? elements.paddle.x + elements.paddle.speed
      : elements.paddle.x;
      
  if (paddleNextX >= 0 && paddleNextX + elements.paddle.width <= dimensions.canvas.width) {
    elements.paddle.x = paddleNextX;
  }
}

// Reset game state
function resetGame() {
  gameState.active = true;
  gameState.score = 0;
  
  elements.paddle.x = dimensions.canvas.width / 2 - dimensions.paddle.width / 2;
  elements.paddle.y = dimensions.canvas.height - dimensions.paddle.height - 5;
  
  elements.ball.x = dimensions.canvas.width / 2;
  elements.ball.y = dimensions.canvas.height / 2;
  elements.ball.xSpeed = dimensions.ball.xSpeed;
  elements.ball.ySpeed = dimensions.ball.ySpeed;
  
  brickConfig.currentRows = 3;
  createBrickLayout();
}

// Collision detection utilities
function detectCollision(objA, objB) {
  return objA.x < objB.x + objB.width &&
         objA.x + objA.width > objB.x &&
         objA.y < objB.y + objB.height &&
         objA.y + objA.height > objB.y;
}

function isHorizontalCollision(objA, objB) {
  const fromLeft = Math.abs((objA.x + objA.width) - objB.x);
  const fromRight = Math.abs(objA.x - (objB.x + objB.width));
  const fromTop = Math.abs((objA.y + objA.height) - objB.y);
  const fromBottom = Math.abs(objA.y - (objB.y + objB.height));
  
  const minDistance = Math.min(fromLeft, fromRight, fromTop, fromBottom);
  return minDistance === fromLeft || minDistance === fromRight;
}