/**
 * 五子棋游戏逻辑
 *
 * @author zhishan
 * @date 2024-01-01
 */

import {
  type PieceType,
  type Position,
  type GameConfig,
  type GameState,
  GameStatus,
  WinDirection,
} from './types.js';

/** 默认游戏配置 */
const DEFAULT_CONFIG: GameConfig = {
  boardSize: 15,
  cellSize: 40,
  padding: 20,
};

/**
 * 五子棋游戏类
 */
export class GomokuGame {
  /** 游戏配置 */
  private readonly config: GameConfig;
  /** 游戏状态 */
  private state: GameState;
  /** 获胜回调 */
  private onWinCallback?: (winner: PieceType, positions: Position[]) => void;
  /** 落子回调 */
  private onMoveCallback?: (position: Position, player: PieceType) => void;

  /**
   * 构造函数
   * @param config 游戏配置（可选）
   */
  constructor(config: Partial<GameConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = this.createInitialState();
  }

  /**
   * 创建初始游戏状态
   * @returns 初始状态
   */
  private createInitialState(): GameState {
    const { boardSize } = this.config;
    return {
      currentPlayer: 'black',
      status: GameStatus.PLAYING,
      board: Array(boardSize)
        .fill(null)
        .map(() => Array(boardSize).fill(null)),
      winningPositions: [],
      history: [],
    };
  }

  /**
   * 获取当前游戏状态
   * @returns 游戏状态副本
   */
  getState(): GameState {
    return {
      ...this.state,
      board: this.state.board.map((row) => [...row]),
      winningPositions: [...this.state.winningPositions],
      history: [...this.state.history],
    };
  }

  /**
   * 获取游戏配置
   * @returns 游戏配置
   */
  getConfig(): GameConfig {
    return { ...this.config };
  }

  /**
   * 落子
   * @param row 行索引
   * @param col 列索引
   * @returns 是否落子成功
   */
  placePiece(row: number, col: number): boolean {
    // 检查输入是否为整数
    if (!Number.isInteger(row) || !Number.isInteger(col)) {
      console.warn('坐标必须是整数');
      return false;
    }

    // 检查游戏是否进行中
    if (this.state.status !== GameStatus.PLAYING) {
      console.warn('游戏已结束，无法落子');
      return false;
    }

    // 检查位置是否有效
    if (!this.isValidPosition(row, col)) {
      console.warn(`无效的位置: (${row}, ${col})`);
      return false;
    }

    // 检查位置是否已被占用
    if (this.state.board[row][col] !== null) {
      console.warn(`位置 (${row}, ${col}) 已被占用`);
      return false;
    }

    // 落子
    const currentPlayer = this.state.currentPlayer;
    this.state.board[row][col] = currentPlayer;
    this.state.history.push({ row, col });

    // 触发落子回调
    if (this.onMoveCallback) {
      this.onMoveCallback({ row, col }, currentPlayer);
    }

    // 检查获胜
    const winResult = this.checkWin(row, col);
    if (winResult) {
      this.handleWin(currentPlayer, winResult.positions);
      return true;
    }

    // 检查平局
    if (this.isBoardFull()) {
      this.state.status = GameStatus.DRAW;
      return true;
    }

    // 切换玩家
    this.switchPlayer();
    return true;
  }

  /**
   * 检查位置是否有效
   * @param row 行索引
   * @param col 列索引
   * @returns 是否有效
   */
  private isValidPosition(row: number, col: number): boolean {
    const { boardSize } = this.config;
    return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
  }

  /**
   * 检查是否获胜
   * @param row 落子行
   * @param col 落子列
   * @returns 获胜信息或null
   */
  private checkWin(
    row: number,
    col: number
  ): { positions: Position[] } | null {
    const player = this.state.board[row][col];
    if (!player) return null;

    const directions = [
      { dr: 0, dc: 1, direction: WinDirection.HORIZONTAL }, // 水平
      { dr: 1, dc: 0, direction: WinDirection.VERTICAL }, // 垂直
      { dr: 1, dc: 1, direction: WinDirection.DIAGONAL_1 }, // 左上到右下
      { dr: 1, dc: -1, direction: WinDirection.DIAGONAL_2 }, // 右上到左下
    ];

    for (const { dr, dc } of directions) {
      const positions = this.countInDirection(row, col, dr, dc, player);
      if (positions.length >= 5) {
        return { positions };
      }
    }

    return null;
  }

  /**
   * 沿某个方向统计连续棋子
   * @param row 起始行
   * @param col 起始列
   * @param dr 行增量
   * @param dc 列增量
   * @param player 玩家
   * @returns 连续位置数组
   */
  private countInDirection(
    row: number,
    col: number,
    dr: number,
    dc: number,
    player: PieceType
  ): Position[] {
    const positions: Position[] = [{ row, col }];

    // 正向统计
    let r = row + dr;
    let c = col + dc;
    while (this.isValidPosition(r, c) && this.state.board[r][c] === player) {
      positions.push({ row: r, col: c });
      r += dr;
      c += dc;
    }

    // 反向统计
    r = row - dr;
    c = col - dc;
    while (this.isValidPosition(r, c) && this.state.board[r][c] === player) {
      positions.push({ row: r, col: c });
      r -= dr;
      c -= dc;
    }

    return positions;
  }

  /**
   * 处理获胜
   * @param winner 获胜方
   * @param positions 获胜位置
   */
  private handleWin(winner: PieceType, positions: Position[]): void {
    this.state.winningPositions = positions;
    this.state.status =
      winner === 'black' ? GameStatus.BLACK_WIN : GameStatus.WHITE_WIN;

    if (this.onWinCallback) {
      this.onWinCallback(winner, positions);
    }
  }

  /**
   * 检查棋盘是否已满
   * @returns 是否已满
   */
  private isBoardFull(): boolean {
    return this.state.board.every((row) =>
      row.every((cell) => cell !== null)
    );
  }

  /**
   * 切换玩家
   */
  private switchPlayer(): void {
    this.state.currentPlayer =
      this.state.currentPlayer === 'black' ? 'white' : 'black';
  }

  /**
   * 悔棋（撤销上一步）
   * @returns 是否成功悔棋
   */
  undo(): boolean {
    if (this.state.history.length === 0) {
      return false;
    }

    const lastMove = this.state.history.pop();
    if (!lastMove) return false;

    this.state.board[lastMove.row][lastMove.col] = null;
    this.state.status = GameStatus.PLAYING;
    this.state.winningPositions = [];
    this.switchPlayer();

    return true;
  }

  /**
   * 重新开始游戏
   */
  restart(): void {
    this.state = this.createInitialState();
  }

  /**
   * 设置获胜回调
   * @param callback 回调函数
   */
  onWin(callback: (winner: PieceType, positions: Position[]) => void): void {
    this.onWinCallback = callback;
  }

  /**
   * 设置落子回调
   * @param callback 回调函数
   */
  onMove(callback: (position: Position, player: PieceType) => void): void {
    this.onMoveCallback = callback;
  }

  /**
   * 获取当前玩家
   * @returns 当前玩家
   */
  getCurrentPlayer(): PieceType {
    return this.state.currentPlayer;
  }

  /**
   * 获取游戏状态
   * @returns 游戏状态
   */
  getGameStatus(): GameStatus {
    return this.state.status;
  }

  /**
   * 判断游戏是否结束
   * @returns 是否结束
   */
  isGameOver(): boolean {
    return (
      this.state.status === GameStatus.BLACK_WIN ||
      this.state.status === GameStatus.WHITE_WIN ||
      this.state.status === GameStatus.DRAW
    );
  }
}
