/**
 * 五子棋游戏类型定义
 *
 * @author zhishan
 * @date 2024-01-01
 */

/** 棋子类型 */
export type PieceType = 'black' | 'white' | null;

/** 游戏状态 */
export enum GameStatus {
  /** 等待中 */
  WAITING = 'waiting',
  /** 进行中 */
  PLAYING = 'playing',
  /** 黑棋获胜 */
  BLACK_WIN = 'black_win',
  /** 白棋获胜 */
  WHITE_WIN = 'white_win',
  /** 平局 */
  DRAW = 'draw',
}

/** 棋盘位置 */
export interface Position {
  /** 行索引 */
  row: number;
  /** 列索引 */
  col: number;
}

/** 游戏配置 */
export interface GameConfig {
  /** 棋盘大小（默认15） */
  boardSize: number;
  /** 格子大小（像素） */
  cellSize: number;
  /** 棋盘边距 */
  padding: number;
}

/** 游戏状态对象 */
export interface GameState {
  /** 当前玩家 */
  currentPlayer: PieceType;
  /** 游戏状态 */
  status: GameStatus;
  /** 棋盘数据 */
  board: PieceType[][];
  /** 获胜位置 */
  winningPositions: Position[];
  /** 历史记录 */
  history: Position[];
}

/** 获胜方向 */
export enum WinDirection {
  /** 水平 */
  HORIZONTAL = 'horizontal',
  /** 垂直 */
  VERTICAL = 'vertical',
  /** 左上到右下 */
  DIAGONAL_1 = 'diagonal1',
  /** 右上到左下 */
  DIAGONAL_2 = 'diagonal2',
}
