"use strict";

const squareButtons = document.querySelectorAll(".square");
const startButton = document.querySelector(".start-game-button");
const winnerDisplay = document.querySelector(".display-winner");
const turnDisplay = document.querySelector(".display-turn");
const sidebar = document.querySelector(".sidebar");
const gameForm = document.querySelector(".game-form");
const gameBoard = document.querySelector(".board");
const player1Input = document.querySelector(".player-1-input");
const player2Input = document.querySelector(".player-2-input");

// factory function to build the array of game squares. provided via variable so the size is described and eliminates a magic number;
function GetGameBoard() {
  const boardSize = 3;
  const squares = [];
  for (let i = 0; i < boardSize; i++) {
    squares[i] = [];
    for (let j = 0; j < boardSize; j++) {
      squares[i].push(null);
    }
  }
  //   private (helper) function for checking the status of a square;
  const readSquareValue = function (row, column) {
    return this.squares[row][column];
  };

  //   private function, allows user to input to a square if the square is unused;
  const setSquareValue = function (row, column, name, value) {
    if (!this.readSquareValue(row, column))
      this.squares[row][column] = { name, value };
  };

  return { squares, readSquareValue, setSquareValue };
}

// factory function returns a player object the current game, retrieves the name from the input field;
function GetPlayer(playerNumber) {
  const name = document.querySelector(`.player-${playerNumber}-input`).value;
  const icon = playerNumber === 1 ? "❌" : "⭕";
  return { name, icon };
}

// helper functions for updating the display;
// guard clause declares a tie if no winner is handed as an argument;
function showWinner(name) {
  winnerDisplay.classList.remove("hidden");
  if (!name) winnerDisplay.textContent = `It's a Tie!`;
  else winnerDisplay.textContent = `${name} is the winner!`;
}

function hideWinner() {
  winnerDisplay.textContent = "";
  winnerDisplay.classList.add("hidden");
}

// factory function, instantiates the main object to run the current game, including private methods for the game logic;
function StartGame() {
  const board = GetGameBoard();
  const player1 = GetPlayer(1);
  const player2 = GetPlayer(2);
  const currentPlayer = "player1";

  // loops over the gameBoard array and renders the value of each position to the relevant DOM element;
  //   indices for the loop elements are mapped to the correct location of the DOM squares using the dataset attr;
  function renderSquareValues() {
    this.board.squares.forEach((row, rowIndex) => {
      row.forEach((entry, columnIndex) => {
        if (!entry) return;
        const square = document.querySelector(
          `.square[data-row="${rowIndex}"][data-column="${columnIndex}"]`
        );
        square.innerHTML = entry.value;
      });
    });
  }

  //   called each time a square is clicked on the gameBoard, gets the array coordinates of the clicked el. from the dataset attr and writes the values to the correct array index;
  // re-renders the display and then checks to see if the game is completed;
  function takeTurn(row, column, player) {
    this.board.setSquareValue(
      row,
      column,
      this[player].name,
      this[player].icon
    );
    this.currentPlayer =
      this.currentPlayer === "player1" ? "player2" : "player1";
    turnDisplay.textContent = `${this[this.currentPlayer].name}'s turn`;
    this.renderSquareValues();
    this.checkForWinner();
  }

  //   callback function to end the game if one of the winning conditions is found by the 'check' functions;
  //   guard clause calls the showWinner function with no arguments if a tie condition is met;
  function gameOver(winner) {
    gameForm.classList.remove("hidden");
    squareButtons.forEach((square) => (square.disabled = true));
    turnDisplay.classList.add("hidden");
    turnDisplay.textContent = "";
    if (!winner) {
      showWinner();
      return;
    }
    showWinner(winner.name);
  }

  //   loops over each row of the gameboard. filter method to confirm row is full then checks if all entries are equal;
  function checkRows() {
    this.board.squares.forEach((row) => {
      if (row.filter((rowEntry) => rowEntry !== null).length === row.length) {
        if (
          row.every(
            (rowEntry, _, rowArray) => rowEntry.value === rowArray[0].value
          )
        ) {
          this.gameOver(row[0]);
        }
      }
    });
  }

  //   loops through the first row of the gameboard, for each position that is not empty constructs an array from the column entires in the   gameboard array;
  // checks if the new array is full, and then checks if all entries are equal;
  function checkColumns() {
    this.board.squares[0].forEach((rowEntry, index) => {
      if (!rowEntry) return;
      const column = [
        this.board.squares[0][index],
        this.board.squares[1][index],
        this.board.squares[2][index],
      ];
      if (column.filter((columnEntry) => !columnEntry).length) return;
      if (
        column.every(
          (columnEntry, _, columnArray) =>
            columnEntry.value === columnArray[0].value
        )
      )
        this.gameOver(column[0]);
    });
  }
  //   constructs arrays from the diagonal entries from the gameboard array. loops over them to check they are full and checks if all entries are equal;
  function checkDiagonals() {
    const diagonals = [
      [
        this.board.squares[0][0],
        this.board.squares[1][1],
        this.board.squares[2][2],
      ],
      [
        this.board.squares[0][2],
        this.board.squares[1][1],
        this.board.squares[2][0],
      ],
    ];
    diagonals.forEach((diagonalRow) => {
      if (diagonalRow.filter((diagonalEntry) => !diagonalEntry).length) return;
      if (
        diagonalRow.every(
          (diagonalEntry) => diagonalEntry.value === diagonalRow[0].value
        )
      ) {
        this.gameOver(diagonalRow[0]);
      }
    });
  }

  //   counts the empty squares in the gameboard array, if there are 0 and no winner has been declared game ends in draw;
  function checkForTie() {
    const emptySquareCount = this.board.squares
      .flat()
      .filter((value) => !value).length;
    if (!emptySquareCount) gameOver();
  }

  function checkForWinner() {
    this.checkRows();
    this.checkColumns();
    this.checkDiagonals();
    this.checkForTie();
  }

  return {
    board,
    player1,
    player2,
    currentPlayer,
    takeTurn,
    renderSquareValues,
    checkForWinner,
    checkRows,
    checkColumns,
    checkDiagonals,
    checkForTie,
    gameOver,
  };
}

let currentGame;

squareButtons.forEach((square) =>
  square.addEventListener("click", (event) => {
    currentGame.takeTurn(
      event.target.dataset.row,
      event.target.dataset.column,
      currentGame.currentPlayer
    );
    event.target.style.boxShadow = "0 0 1rem 0 #f43f5e";
  })
);

startButton.addEventListener("click", (e) => {
  if (player1Input.value === "" || player2Input.value === "") return;
  e.preventDefault();
  squareButtons.forEach((square) => {
    square.disabled = false;
    square.innerHTML = "";
    square.style.boxShadow = "none";
  });
  hideWinner();
  currentGame = StartGame();
  gameBoard.classList.remove("hidden");
  gameForm.classList.add("hidden");
  player1Input.value = player2Input.value = "";
  turnDisplay.classList.remove("hidden");
  turnDisplay.textContent = `${
    currentGame[currentGame.currentPlayer].name
  } goes first`;
});
