/**
 * 五子棋游戏入口
 *
 * @author zhishan
 * @date 2024-01-01
 */

import { GomokuGame } from './game.js';
import { BoardRenderer } from './board.js';
import { GameStatus, type PieceType } from './types.js';

/**
 * 游戏 UI 控制器
 */
class GameUI {
  /** 游戏实例 */
  private readonly game: GomokuGame;
  /** 棋盘渲染器 */
  private readonly renderer: BoardRenderer;
  /** 状态显示元素 */
  private readonly statusElement: HTMLElement;
  /** 当前玩家显示元素 */
  private readonly currentPlayerElement: HTMLElement;
  /** 悔棋按钮 */
  private readonly undoButton: HTMLButtonElement;
  /** 重新开始按钮 */
  private readonly restartButton: HTMLButtonElement;

  /**
   * 构造函数
   */
  constructor() {
    // 创建游戏实例
    this.game = new GomokuGame({
      boardSize: 15,
      cellSize: 40,
      padding: 25,
    });

    // 创建棋盘渲染器
    this.renderer = new BoardRenderer('gameCanvas', this.game);

    // 获取 UI 元素
    this.statusElement = document.getElementById('status')!;
    this.currentPlayerElement = document.getElementById('currentPlayer')!;
    this.undoButton = document.getElementById('undoBtn') as HTMLButtonElement;
    this.restartButton = document.getElementById(
      'restartBtn'
    ) as HTMLButtonElement;

    // 绑定事件
    this.bindEvents();

    // 绑定游戏回调
    this.bindGameCallbacks();

    // 初始渲染
    this.renderer.render();
    this.updateUI();
  }

  /**
   * 绑定按钮事件
   */
  private bindEvents(): void {
    // 悔棋按钮
    this.undoButton.addEventListener('click', () => {
      if (this.game.undo()) {
        this.renderer.reset();
        this.updateUI();
      }
    });

    // 重新开始按钮
    this.restartButton.addEventListener('click', () => {
      this.game.restart();
      this.renderer.reset();
      this.updateUI();
    });
  }

  /**
   * 绑定游戏回调
   */
  private bindGameCallbacks(): void {
    // 落子回调
    this.game.onMove(() => {
      this.updateUI();
    });

    // 获胜回调
    this.game.onWin((winner) => {
      this.showWinMessage(winner);
    });
  }

  /**
   * 更新 UI 显示
   */
  private updateUI(): void {
    const status = this.game.getGameStatus();
    const currentPlayer = this.game.getCurrentPlayer();

    // 更新当前玩家显示
    if (currentPlayer) {
      const playerText = currentPlayer === 'black' ? '黑棋' : '白棋';
      const playerColor = currentPlayer === 'black' ? '#000000' : '#666666';
      this.currentPlayerElement.innerHTML = `当前玩家：<span style="color: ${playerColor}; font-weight: bold;">${playerText}</span>`;
    }

    // 更新状态显示
    switch (status) {
      case GameStatus.PLAYING:
        this.statusElement.textContent = '游戏进行中';
        this.undoButton.disabled = false;
        break;
      case GameStatus.BLACK_WIN:
        this.statusElement.innerHTML =
          '<span style="color: #000000; font-weight: bold;">🎉 黑棋获胜！</span>';
        this.undoButton.disabled = true;
        break;
      case GameStatus.WHITE_WIN:
        this.statusElement.innerHTML =
          '<span style="color: #666666; font-weight: bold;">🎉 白棋获胜！</span>';
        this.undoButton.disabled = true;
        break;
      case GameStatus.DRAW:
        this.statusElement.textContent = '🤝 平局！';
        this.undoButton.disabled = true;
        break;
    }
  }

  /**
   * 显示获胜消息
   * @param winner 获胜方
   */
  private showWinMessage(winner: PieceType): void {
    if (!winner) return;

    const winnerText = winner === 'black' ? '黑棋' : '白棋';
    setTimeout(() => {
      alert(`恭喜！${winnerText}获胜！`);
    }, 100);
  }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
  new GameUI();
});
