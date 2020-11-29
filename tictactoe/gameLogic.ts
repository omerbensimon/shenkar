import {IMove, deepClone} from '../common/common';

export type Board = string[][];
export interface BoardDelta {
  row: number;
  col: number;
}
export interface IState {
  board: Board;
  delta?: BoardDelta;
}

export const ROWS = 3;
export const COLS = 3;

/** Returns the initial TicTacToe board, which is a ROWSxCOLS matrix containing ''. */
export function getInitialBoard(): Board {
  const board: Board = [];
  for (let i = 0; i < ROWS; i++) {
    board[i] = [];
    for (let j = 0; j < COLS; j++) {
      board[i][j] = '';
    }
  }
  return board;
}

export function getInitialState(): IState {
  return {board: getInitialBoard()};
}

/**
 * Returns true if the game ended in a tie because there are no empty cells.
 * E.g., isGameOver returns true for the following board:
 *     [['X', 'O', 'X'],
 *      ['X', 'O', 'O'],
 *      ['O', 'X', 'X']]
 */
function isGameOver(board: Board): boolean {
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      if (board[i][j] === '') {
        // If there is an empty cell then we do not have a tie.
        return false;
      }
    }
  }
  // No empty cells, so we have a tie!
  return true;
}

/**
 * Return the winner (either 'X' or 'O') or '' if there is no winner.
 * The board is a matrix of size 3x3 containing either 'X', 'O', or ''.
 * E.g., getWinner returns 'X' for the following board:
 *     [['X', 'O', ''],
 *      ['X', 'O', ''],
 *      ['X', '', '']]
 */
function getWinner(board: Board): string {
  let boardString = '';
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const cell = board[i][j];
      boardString += cell === '' ? ' ' : cell;
    }
  }
  const winPatterns = [
    'XXX......',
    '...XXX...',
    '......XXX',
    'X..X..X..',
    '.X..X..X.',
    '..X..X..X',
    'X...X...X',
    '..X.X.X..',
  ];
  for (const winPattern of winPatterns) {
    const xRegexp = new RegExp(winPattern);
    const oRegexp = new RegExp(winPattern.replace(/X/g, 'O'));
    if (xRegexp.test(boardString)) {
      return 'X';
    }
    if (oRegexp.test(boardString)) {
      return 'O';
    }
  }
  return '';
}

/**
 * Returns the move that should be performed when player
 * with index turnIndexBeforeMove makes a move in cell row X col.
 */
export function createMove(
  stateBeforeMove: IState | null,
  row: number,
  col: number,
  turnIndexBeforeMove: number
): IMove<IState> {
  if (!stateBeforeMove) {
    stateBeforeMove = getInitialState();
  }
  const board: Board = stateBeforeMove.board;
  if (board[row][col] !== '') {
    throw new Error('One can only make a move in an empty position!');
  }
  if (getWinner(board) !== '' || isGameOver(board)) {
    throw new Error('Can only make a move if the game is not over!');
  }
  const boardAfterMove = deepClone(board);
  boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'X' : 'O';
  const winner = getWinner(boardAfterMove);
  let endMatchScores: number[] | null;
  let turnIndex: number;
  if (winner !== '' || isGameOver(boardAfterMove)) {
    // Game over.
    turnIndex = -1;
    endMatchScores = winner === 'X' ? [1, 0] : winner === 'O' ? [0, 1] : [0, 0];
  } else {
    // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
    turnIndex = 1 - turnIndexBeforeMove;
    endMatchScores = null;
  }
  const delta: BoardDelta = {row, col};
  const state: IState = {delta, board: boardAfterMove};
  return {
    endMatchScores,
    turnIndex,
    state,
  };
}
