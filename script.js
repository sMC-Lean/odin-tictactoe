"use strict";

const squareButtons = document.querySelectorAll(".square");
const startButton = document.querySelector(".start-game-button");
const winnerDisplay = document.querySelector(".display-winner");
const sidebar = document.querySelector(".sidebar");
const gameForm = document.querySelector(".game-form");
const gameBoard = document.querySelector(".board");
const player1Input = document.querySelector(".player-1-input");
const player2Input = document.querySelector(".player-2-input");

// function to build the array of game squares. provided via variable so the size is described and eliminates a magic number;
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

function GetPlayer(playerNumber) {
  const name = document.querySelector(`.player-${playerNumber}-input`).value;
  const icon = playerNumber === 1 ? "❌" : "⭕";
  //   const name = "test";
  //   const name = prompt("input name");
  return { name, icon };
}

function showWinner(name) {
  console.log(name);
  winnerDisplay.textContent = `${name} is the winner!`;
  winnerDisplay.classList.remove("hidden");
}
function hideWinner() {
  winnerDisplay.textContent = "";
  winnerDisplay.classList.add("hidden");
}

function StartGame() {
  const board = GetGameBoard();
  const player1 = GetPlayer(1);
  const player2 = GetPlayer(2);
  const currentPlayer = "player1";

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

  function takeTurn(row, column, player) {
    this.board.setSquareValue(
      row,
      column,
      this[player].name,
      this[player].icon
    );
    this.currentPlayer =
      this.currentPlayer === "player1" ? "player2" : "player1";
    this.renderSquareValues();
    this.checkForWinner();
  }

  function gameOver(winner) {
    squareButtons.forEach((square) => (square.disabled = true));
    showWinner(winner.name);
    gameForm.classList.remove("hidden");
  }

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

  function checkForWinner() {
    this.checkRows();
    this.checkColumns();
    this.checkDiagonals();
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
});
