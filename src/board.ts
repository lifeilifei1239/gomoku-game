/**
 * 五子棋棋盘渲染
 *
 * @author zhishan
 * @date 2024-01-01
 */

import { type PieceType, type Position, GameStatus } from './types.js';
import { GomokuGame } from './game.js';

/**
 * 棋盘渲染器类
 */
export class BoardRenderer {
  /** Canvas 元素 */
  private readonly canvas: HTMLCanvasElement;
  /** 绘图上下文 */
  private readonly ctx: CanvasRenderingContext2D;
  /** 游戏实例 */
  private readonly game: GomokuGame;
  /** 游戏配置 */
  private readonly config: {
    cellSize: number;
    padding: number;
    boardSize: number;
  };
  /** 最后落子位置（用于标记） */
  private lastMove: Position | null = null;
  /** 获胜标记动画计数器 */
  private winAnimationFrame: number = 0;
  /** 动画帧ID（用于取消动画） */
  private animationId: number | null = null;

  /**
   * 构造函数
   * @param canvasId Canvas 元素 ID
   * @param game 游戏实例
   */
  constructor(canvasId: string, game: GomokuGame) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`找不到 Canvas 元素: ${canvasId}`);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取 Canvas 2D 上下文');
    }

    this.canvas = canvas;
    this.ctx = ctx;
    this.game = game;

    const gameConfig = game.getConfig();
    this.config = {
      cellSize: gameConfig.cellSize,
      padding: gameConfig.padding,
      boardSize: gameConfig.boardSize,
    };

    // 设置 Canvas 尺寸
    this.setupCanvas();

    // 绑定点击事件
    this.bindClickEvent();

    // 绑定游戏回调
    this.bindGameCallbacks();
  }

  /**
   * 设置 Canvas 尺寸
   */
  private setupCanvas(): void {
    const { cellSize, padding, boardSize } = this.config;
    const size = padding * 2 + cellSize * (boardSize - 1);
    this.canvas.width = size;
    this.canvas.height = size;
  }

  /**
   * 绑定点击事件
   */
  private bindClickEvent(): void {
    this.canvas.addEventListener('click', (e) => {
      // 游戏已结束则不能落子
      if (this.game.isGameOver()) {
        return;
      }

      const pos = this.getPositionFromClick(e);
      if (pos) {
        const success = this.game.placePiece(pos.row, pos.col);
        if (success) {
          this.lastMove = pos;
          this.render();
        }
      }
    });
  }

  /**
   * 绑定游戏回调
   */
  private bindGameCallbacks(): void {
    // 落子回调
    this.game.onMove((position) => {
      this.lastMove = position;
    });

    // 获胜回调
    this.game.onWin(() => {
      this.startWinAnimation();
    });
  }

  /**
   * 从点击位置计算棋盘坐标
   * @param e 鼠标事件
   * @returns 棋盘位置或 null
   */
  private getPositionFromClick(e: MouseEvent): Position | null {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { cellSize, padding } = this.config;

    // 计算最近的交叉点
    const col = Math.round((x - padding) / cellSize);
    const row = Math.round((y - padding) / cellSize);

    // 检查是否在有效范围内
    if (
      row < 0 ||
      row >= this.config.boardSize ||
      col < 0 ||
      col >= this.config.boardSize
    ) {
      return null;
    }

    // 检查点击位置是否足够接近交叉点
    const centerX = padding + col * cellSize;
    const centerY = padding + row * cellSize;
    const distance = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );

    // 允许一定的点击误差（半个格子大小）
    if (distance > cellSize / 2) {
      return null;
    }

    return { row, col };
  }

  /**
   * 渲染棋盘
   */
  render(): void {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制背景
    this.drawBackground();

    // 绘制网格
    this.drawGrid();

    // 绘制星位（天元和小星）
    this.drawStarPoints();

    // 绘制棋子
    this.drawPieces();

    // 绘制最后落子标记
    this.drawLastMoveMarker();

    // 绘制获胜连线
    this.drawWinLine();
  }

  /**
   * 绘制背景
   */
  private drawBackground(): void {
    this.ctx.fillStyle = '#E3C16F'; // 木质棋盘颜色
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 绘制网格线
   */
  private drawGrid(): void {
    const { cellSize, padding, boardSize } = this.config;
    const end = padding + cellSize * (boardSize - 1);

    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1;

    // 绘制横线
    for (let i = 0; i < boardSize; i++) {
      const y = padding + i * cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(padding, y);
      this.ctx.lineTo(end, y);
      this.ctx.stroke();
    }

    // 绘制竖线
    for (let i = 0; i < boardSize; i++) {
      const x = padding + i * cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x, padding);
      this.ctx.lineTo(x, end);
      this.ctx.stroke();
    }
  }

  /**
   * 绘制星位点
   */
  private drawStarPoints(): void {
    const { cellSize, padding, boardSize } = this.config;
    const starSize = 4;

    // 标准五子棋星位（3-3、3-11、7-7、11-3、11-11，0索引）
    const stars: Position[] = [
      { row: 3, col: 3 },
      { row: 3, col: 11 },
      { row: 7, col: 7 },
      { row: 11, col: 3 },
      { row: 11, col: 11 },
    ];

    this.ctx.fillStyle = '#000000';
    for (const star of stars) {
      const x = padding + star.col * cellSize;
      const y = padding + star.row * cellSize;

      this.ctx.beginPath();
      this.ctx.arc(x, y, starSize, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * 绘制所有棋子
   */
  private drawPieces(): void {
    const state = this.game.getState();
    for (let row = 0; row < this.config.boardSize; row++) {
      for (let col = 0; col < this.config.boardSize; col++) {
        const piece = state.board[row][col];
        if (piece) {
          this.drawPiece(row, col, piece);
        }
      }
    }
  }

  /**
   * 绘制单个棋子
   * @param row 行索引
   * @param col 列索引
   * @param piece 棋子类型
   */
  private drawPiece(row: number, col: number, piece: PieceType): void {
    const { cellSize, padding } = this.config;
    const x = padding + col * cellSize;
    const y = padding + row * cellSize;
    const radius = cellSize * 0.4;

    // 创建渐变效果
    const gradient = this.ctx.createRadialGradient(
      x - radius / 3,
      y - radius / 3,
      radius / 10,
      x,
      y,
      radius
    );

    if (piece === 'black') {
      gradient.addColorStop(0, '#666666');
      gradient.addColorStop(1, '#000000');
    } else {
      gradient.addColorStop(0, '#FFFFFF');
      gradient.addColorStop(1, '#D0D0D0');
    }

    // 绘制棋子
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // 绘制边框
    this.ctx.strokeStyle = piece === 'black' ? '#000000' : '#999999';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  /**
   * 绘制最后落子标记
   */
  private drawLastMoveMarker(): void {
    if (!this.lastMove) return;

    const { cellSize, padding } = this.config;
    const x = padding + this.lastMove.col * cellSize;
    const y = padding + this.lastMove.row * cellSize;
    const size = cellSize * 0.15;

    // 绘制红色小方块标记最后落子
    this.ctx.fillStyle = '#FF0000';
    this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }

  /**
   * 绘制获胜连线
   */
  private drawWinLine(): void {
    const state = this.game.getState();
    if (state.winningPositions.length < 5) return;

    const { cellSize, padding } = this.config;

    // 计算连线的起点和终点
    const start = state.winningPositions[0];
    const end =
      state.winningPositions[state.winningPositions.length - 1];

    const startX = padding + start.col * cellSize;
    const startY = padding + start.row * cellSize;
    const endX = padding + end.col * cellSize;
    const endY = padding + end.row * cellSize;

    // 闪烁效果
    const alpha = 0.5 + 0.5 * Math.sin(this.winAnimationFrame * 0.2);

    // 绘制获胜连线
    this.ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    // 绘制端点高亮
    this.ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
    for (const pos of state.winningPositions) {
      const x = padding + pos.col * cellSize;
      const y = padding + pos.row * cellSize;
      this.ctx.beginPath();
      this.ctx.arc(x, y, cellSize * 0.45, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * 开始获胜动画
   */
  private startWinAnimation(): void {
    // 先停止之前的动画（如果有）
    this.stopWinAnimation();

    const animate = () => {
      if (!this.game.isGameOver()) {
        this.animationId = null;
        return;
      }

      this.winAnimationFrame++;
      this.render();
      this.animationId = requestAnimationFrame(animate);
    };
    this.animationId = requestAnimationFrame(animate);
  }

  /**
   * 停止获胜动画
   */
  private stopWinAnimation(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    // 重置动画帧计数器
    this.winAnimationFrame = 0;
  }

  /**
   * 获取 Canvas 元素
   * @returns Canvas 元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 重置棋盘渲染（用于悔棋或重新开始）
   */
  reset(): void {
    // 停止获胜动画
    this.stopWinAnimation();
    // 清除最后落子标记
    this.lastMove = null;
    // 重新渲染
    this.render();
  }
}
