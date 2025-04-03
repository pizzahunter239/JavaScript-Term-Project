// Game configuration
const CONFIG = {
    cellDimension: 30,
    gridWidth: 25,
    gridHeight: 25,
    refreshRate: 100, // time in milliseconds
    colors: {
      background: "black",
      apple: "red",
      snake: "lime"
    }
  };
  
  // Game state
  const STATE = {
    canvas: null,
    renderer: null,
    snakeSegments: [],
    isPaused: false,
    isTerminated: false
  };
  
  // Snake position and movement
  const SNAKE = {
    position: { x: CONFIG.cellDimension * 5, y: CONFIG.cellDimension * 5 },
    direction: { x: 0, y: 0 }
  };
  
  // Apple position
  let applePosition = { x: 0, y: 0 };
  
  // Initialize the game when DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Create canvas element if it doesn't exist
    if (!document.getElementById("board")) {
      const boardDiv = document.querySelector(".board");
      if (boardDiv) {
        const canvas = document.createElement("canvas");
        canvas.id = "board";
        // Replace the div with the canvas
        boardDiv.parentNode.replaceChild(canvas, boardDiv);
        canvas.classList.add("board");
      }
    }
    
    initializeGame();
    controls();
    deployApple();
    
    setInterval(gameLoop, CONFIG.refreshRate);
  });
  
  function initializeGame() {
    STATE.canvas = document.getElementById("board") || document.querySelector("canvas.board");
    if (!STATE.canvas) {
      console.error("Canvas element not found");
      return;
    }
    
    STATE.canvas.height = CONFIG.gridHeight * CONFIG.cellDimension;
    STATE.canvas.width = CONFIG.gridWidth * CONFIG.cellDimension;
    
    // Override grid display for canvas
    STATE.canvas.style.display = "block";
    STATE.canvas.style.margin = "0 auto";
    
    // Get 2D rendering context
    STATE.renderer = STATE.canvas.getContext("2d");
  }
  
  function controls() {
    document.addEventListener("keyup", (event) => {
      // Prevent 180 degree turns
      switch(event.code) {
        case "ArrowUp":
          if (SNAKE.direction.y !== 1) {
            SNAKE.direction = { x: 0, y: -1 };
          }
          break;
        case "ArrowDown":
          if (SNAKE.direction.y !== -1) {
            SNAKE.direction = { x: 0, y: 1 };
          }
          break;
        case "ArrowLeft":
          if (SNAKE.direction.x !== 1) {
            SNAKE.direction = { x: -1, y: 0 };
          }
          break;
        case "ArrowRight":
          if (SNAKE.direction.x !== -1) {
            SNAKE.direction = { x: 1, y: 0 };
          }
          break;
      }
    });
  }
  
  // Main game loop
  function gameLoop() {
    if (STATE.isTerminated) return;
    
    renderBackground();
    
    // Draw apple
    renderEntity(applePosition.x, applePosition.y, CONFIG.colors.apple);
    
    // Check if snake ate apple
    if (SNAKE.position.x === applePosition.x && SNAKE.position.y === applePosition.y) {
      growSnake();
      deployApple();
    }
    
    updateSnakeBody();
    
    SNAKE.position.x += SNAKE.direction.x * CONFIG.cellDimension;
    SNAKE.position.y += SNAKE.direction.y * CONFIG.cellDimension;
    
    renderEntity(SNAKE.position.x, SNAKE.position.y, CONFIG.colors.snake);
    
    STATE.snakeSegments.forEach(segment => {
      renderEntity(segment[0], segment[1], CONFIG.colors.snake);
    });
    
    checkCollisions();
  }
  
// Load the apple SVG as an image
// SVG provided by font awesome
    const appleIcon = new Image();
    appleIcon.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="red" d="M224 112c-8.8 0-16-7.2-16-16l0-16c0-44.2 35.8-80 80-80l16 0c8.8 0 16 7.2 16 16l0 16c0 44.2-35.8 80-80 80l-16 0zM0 288c0-76.3 35.7-160 112-160c27.3 0 59.7 10.3 82.7 19.3c18.8 7.3 39.9 7.3 58.7 0c22.9-8.9 55.4-19.3 82.7-19.3c76.3 0 112 83.7 112 160c0 128-80 224-160 224c-16.5 0-38.1-6.6-51.5-11.3c-8.1-2.8-16.9-2.8-25 0c-13.4 4.7-35 11.3-51.5 11.3C80 512 0 416 0 288z"/></svg>');

    function renderEntity(x, y, color) {
        if (color === CONFIG.colors.apple) {
        // Draw the apple SVG
        if (appleIcon.complete) {
      // Centered
      STATE.renderer.drawImage(
        appleIcon, 
        x, 
        y, 
        CONFIG.cellDimension, 
        CONFIG.cellDimension
      );
    } 
    } 
    else {
    // Snake segments
    STATE.renderer.fillStyle = color;
    STATE.renderer.fillRect(x, y, CONFIG.cellDimension, CONFIG.cellDimension);
    }
    }
  
  function renderBackground() {
    STATE.renderer.fillStyle = CONFIG.colors.background;
    STATE.renderer.fillRect(0, 0, STATE.canvas.width, STATE.canvas.height);
  }
  
  function updateSnakeBody() {
    // Move each segment to position of segment ahead of it
    for (let i = STATE.snakeSegments.length - 1; i > 0; i--) {
      STATE.snakeSegments[i] = STATE.snakeSegments[i-1];
    }
    
    // First segment follows the head
    if (STATE.snakeSegments.length) {
      STATE.snakeSegments[0] = [SNAKE.position.x, SNAKE.position.y];
    }
  }
  
  function deployApple() {
    applePosition = {
      x: Math.floor(Math.random() * CONFIG.gridWidth) * CONFIG.cellDimension,
      y: Math.floor(Math.random() * CONFIG.gridHeight) * CONFIG.cellDimension
    };
  }
  
  function growSnake() {
    STATE.snakeSegments.push([applePosition.x, applePosition.y]);
  }
  
  function checkCollisions() {
    if (SNAKE.position.x < 0 || 
        SNAKE.position.x >= CONFIG.gridWidth * CONFIG.cellDimension || 
        SNAKE.position.y < 0 || 
        SNAKE.position.y >= CONFIG.gridHeight * CONFIG.cellDimension) {
      endGame();
    }
    
    // Self collision
    for (let i = 0; i < STATE.snakeSegments.length; i++) {
      if (SNAKE.position.x === STATE.snakeSegments[i][0] && 
          SNAKE.position.y === STATE.snakeSegments[i][1]) {
        endGame();
      }
    }
  }
  
  function endGame() {
    STATE.isTerminated = true;
    window.location.reload();
    
  }
