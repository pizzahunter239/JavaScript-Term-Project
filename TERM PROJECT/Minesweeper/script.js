const tileState = {
    mine: "mine",      // Revealed tile containing a mine
    number: "number",  // Revealed tile showing  mine count
    flagged: "flagged",   // Tile flagged by player
    hidden: "hidden"  // Blank state
}

// Creates and returns the game board with randomly placed mines. boardSize is just one side of the board
function createBoard(boardSize, numberOfMines) {
    const board = []
    const mineCoords = getMineCoords(boardSize, numberOfMines)

    for (let x = 0; x < boardSize; x++) {
        const row = []
        for (let y = 0; y < boardSize; y++) {
            const element = document.createElement("div")
            element.dataset.status = tileState.hidden
            
            const tile = {
                element, x, y,
                mine: mineCoords.some(positionMatch.bind(null, { x, y })),
                get status() {
                    return this.element.dataset.status
                },
                set status(value) {
                    this.element.dataset.status = value
                },
            }

            row.push(tile)
        }
        board.push(row)
    }

    return board
}

// Toggle flag status includes Font Awesome flag html
function flagTile(tile, currentDifficulty) {
    if (
        tile.status !== tileState.hidden &&
        tile.status !== tileState.flagged
    ) {
        return
    }

    if (tile.status === tileState.flagged) {
        tile.status = tileState.hidden
        tile.element.innerHTML = ''
    } else {
        tile.status = tileState.flagged
        switch (currentDifficulty) {
            case "easy":
                tile.element.innerHTML = `<i class="fa-solid fa-flag" style = "color: red; font-size: 2.5rem"></i>`;
                break;
            case "medium":
                tile.element.innerHTML = `<i class="fa-solid fa-flag" style = "color: red; font-size: 1.7rem"></i>`;
                break;
            case "hard":
                tile.element.innerHTML = `<i class="fa-solid fa-flag" style = "color: red; font-size: 1.4rem"></i>`;
                break;
            default:
                tile.element.innerHTML = `<i class="fa-solid fa-flag" style = "color: red; font-size: 1.7rem"></i>`;
                break;
        }
    }

    document.dispatchEvent(new CustomEvent("tileFlagged"));
}

// Reveals tile and any adjacent empty tile. Includes Font Awesome bomb html
function revealTile(board, tile, currentDifficulty) {
    if (tile.status !== tileState.hidden) {
        return
    }

    if (tile.mine) {
        tile.status = tileState.mine
        switch (currentDifficulty) {
            case "easy":
                tile.element.innerHTML = `<i class="fa-solid fa-bomb" style = "color: red; font-size: 2.5rem"></i>`;
                break;
            case "medium":
                tile.element.innerHTML = `<i class="fa-solid fa-bomb" style = "color: red; font-size: 1.7rem"></i>`;
                break;
            case "hard":
                tile.element.innerHTML = `<i class="fa-solid fa-bomb" style = "color: red; font-size: 1.3rem"></i>`;
                break;
            default:
                tile.element.innerHTML = `<i class="fa-solid fa-bomb" style = "color: red; font-size: 1.7rem"></i>`;
                break;
        }
        return
    }
    
    tile.status = tileState.number
    const adjacentTiles = nearbyTiles(board, tile)
    const mines = adjacentTiles.filter(t => t.mine)
    
    // Reveal adjacent tiles if no mines are nearby
    if (mines.length == 0) {
        adjacentTiles.forEach(revealTile.bind(null, board))
    } else {
        tile.element.textContent = mines.length
    }
}

// Generates random mine positions
function getMineCoords(boardSize, numberOfMines) {
    const positions = []

    while (positions.length < numberOfMines) {
        const position = {
            x: randomNumber(boardSize),
            y: randomNumber(boardSize),
        }

        if (!positions.some(positionMatch.bind(null, position))) {
            positions.push(position)
        }
    }

    return positions
}

// Generates a random number between 0 and size-1
function randomNumber(size) {
    return Math.floor(Math.random() * size)
}

// Checks if the player has won
function checkWin(board) {
    return board.every(row => {
        return row.every(tile => {
            return (
                tile.status == tileState.number || (tile.mine && (tile.status == tileState.hidden || tile.status == tileState.flagged))
            )
        })
    })
}

// Checks if the player has lost
function checkLose(board) {
    return board.some(row => {
        return row.some(tile => {
            return tile.status == tileState.mine
        })
    })
}


// Helper function to compare two positions
function positionMatch(a, b) {
    return a.x === b.x && a.y === b.y
}


// Gets all valid adjacent tiles (including diagonals)
function nearbyTiles(board, { x, y }) {
    const tiles = []

    for (let xOffset = -1; xOffset <= 1; xOffset++) {
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
            const tile = board[x + xOffset]?.[y + yOffset]
            if (tile) tiles.push(tile)
        }
    }

    return tiles
}

// Interface logic 

const difficultySettings = {
    easy: {
        size: 10,
        mines: 10
    },
    medium: {
        size: 20,
        mines: 80
    },
    hard: {
        size: 25,
        mines: 194
    }
};

let currentDifficulty = 'easy';
let boardSize = difficultySettings.easy.size;
let mineCount = difficultySettings.easy.mines;

const boardElement = document.querySelector(".board");
const minesLeftText = document.getElementById("minesLeftCounter");
const messageText = document.querySelector(".subtext");

let board = createBoard(boardSize, mineCount);

document.addEventListener("tileFlagged", updateMinesLeftCounter);

// Event listeners for difficulty buttons
document.getElementById('easy').addEventListener('click', () => setDifficulty('easy'));
document.getElementById('medium').addEventListener('click', () => setDifficulty('medium'));
document.getElementById('hard').addEventListener('click', () => setDifficulty('hard'));

function setDifficulty(difficulty) {
    // Remove previous event listeners before creating new board
    removeAllEventListeners();
    
    currentDifficulty = difficulty;
    boardSize = difficultySettings[difficulty].size;
    mineCount = difficultySettings[difficulty].mines;
    
    boardElement.className = 'board';
    boardElement.classList.add(difficulty);
    
    boardElement.innerHTML = '';
    
    // Create new board and set up game
    board = createBoard(boardSize, mineCount);
    setupGame();
    updateMinesLeftCounter();
}

function removeAllEventListeners() {
    boardElement.removeEventListener("click", stopProp, { capture: true });
    boardElement.removeEventListener("contextmenu", stopProp, { capture: true });
}

function setupGame() {
    board.forEach(row => {
        row.forEach(tile => {
            boardElement.append(tile.element);
            
            //left click event for revealing tiles
            tile.element.addEventListener("click", () => {
                revealTile(board, tile, currentDifficulty);
                checkGameEnd();
            });
            
            //right click event for flagging tiles
            tile.element.addEventListener("contextmenu", e => {
                e.preventDefault();
                flagTile(tile, currentDifficulty);
                updateMinesLeftCounter();
            });
        });
    });

    boardElement.style.setProperty("--size", boardSize);
    messageText.textContent = "Mines Left:";
    
    updateMinesLeftCounter();
}

function updateMinesLeftCounter() {
    if (!minesLeftText) {
        console.error("Mines Left element not found!");
        return;
    }

    const flaggedTilesCount = board.reduce((count, row) => {
        return count + row.filter(tile => tile.status === tileState.flagged).length;
    }, 0);

    console.log(mineCount - flaggedTilesCount);

    minesLeftText.innerHTML = `${mineCount - flaggedTilesCount}`;

}

function checkGameEnd() {
    const win = checkWin(board);
    const lose = checkLose(board);

    if (win || lose) {
        // Add game-end event blockers
        boardElement.addEventListener("click", stopProp, { capture: true });
        boardElement.addEventListener("contextmenu", stopProp, { capture: true });

        if (win) {
            messageText.textContent = "You Win! Choose a difficulty to play again";
        }
        if (lose) {
            messageText.textContent = "You Lose! Choose a difficulty to play again";
            // Reveal all mines and remove incorrect flags
            board.forEach(row => {
                row.forEach(tile => {
                    if (tile.status === tileState.flagged) flagTile(tile, currentDifficulty);
                    if (tile.mine) revealTile(board, tile, currentDifficulty);
                });
            });
        }
    }
}

function stopProp(e) {
    e.stopImmediatePropagation();
}

setupGame();