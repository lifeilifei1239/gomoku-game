/**
 * GomokuGame 单元测试
 *
 * @author zhishan
 * @date 2024-01-01
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GomokuGame } from '../game.js';
import { GameStatus } from '../types.js';

describe('GomokuGame', () => {
  let game: GomokuGame;

  beforeEach(() => {
    game = new GomokuGame();
  });

  describe('初始化', () => {
    it('应该正确初始化游戏状态', () => {
      const state = game.getState();
      expect(state.status).toBe(GameStatus.PLAYING);
      expect(state.currentPlayer).toBe('black');
      expect(state.history).toHaveLength(0);
      expect(state.winningPositions).toHaveLength(0);
    });

    it('应该正确初始化棋盘', () => {
      const state = game.getState();
      expect(state.board).toHaveLength(15);
      state.board.forEach((row) => {
        expect(row).toHaveLength(15);
        row.forEach((cell) => {
          expect(cell).toBeNull();
        });
      });
    });
  });

  describe('落子', () => {
    it('黑棋先行', () => {
      expect(game.getCurrentPlayer()).toBe('black');
    });

    it('成功落子后切换玩家', () => {
      const result = game.placePiece(7, 7);
      expect(result).toBe(true);
      expect(game.getCurrentPlayer()).toBe('white');
    });

    it('不能在已被占用的位置落子', () => {
      game.placePiece(7, 7);
      const result = game.placePiece(7, 7);
      expect(result).toBe(false);
    });

    it('不能在棋盘外落子', () => {
      expect(game.placePiece(-1, 7)).toBe(false);
      expect(game.placePiece(7, -1)).toBe(false);
      expect(game.placePiece(15, 7)).toBe(false);
      expect(game.placePiece(7, 15)).toBe(false);
    });

    it('游戏结束后不能落子', () => {
      // 创建获胜局面
      game.placePiece(0, 0); // black
      game.placePiece(1, 0); // white
      game.placePiece(0, 1); // black
      game.placePiece(1, 1); // white
      game.placePiece(0, 2); // black
      game.placePiece(1, 2); // white
      game.placePiece(0, 3); // black
      game.placePiece(1, 3); // white
      game.placePiece(0, 4); // black - 获胜

      expect(game.isGameOver()).toBe(true);
      expect(game.placePiece(2, 2)).toBe(false);
    });
  });

  describe('输入验证', () => {
    it('应该拒绝非整数坐标', () => {
      expect(game.placePiece(7.5, 7)).toBe(false);
      expect(game.placePiece(7, 7.5)).toBe(false);
      expect(game.placePiece(7.5, 7.5)).toBe(false);
    });

    it('应该拒绝 NaN', () => {
      expect(game.placePiece(NaN, 7)).toBe(false);
      expect(game.placePiece(7, NaN)).toBe(false);
    });

    it('应该拒绝 Infinity', () => {
      expect(game.placePiece(Infinity, 7)).toBe(false);
      expect(game.placePiece(7, Infinity)).toBe(false);
    });
  });

  describe('获胜判断', () => {
    it('应该正确判断水平五子连珠', () => {
      game.placePiece(0, 0); // black
      game.placePiece(1, 0); // white
      game.placePiece(0, 1); // black
      game.placePiece(1, 1); // white
      game.placePiece(0, 2); // black
      game.placePiece(1, 2); // white
      game.placePiece(0, 3); // black
      game.placePiece(1, 3); // white
      game.placePiece(0, 4); // black - 获胜

      expect(game.getGameStatus()).toBe(GameStatus.BLACK_WIN);
    });

    it('应该正确判断垂直五子连珠', () => {
      game.placePiece(0, 0); // black
      game.placePiece(0, 1); // white
      game.placePiece(1, 0); // black
      game.placePiece(1, 1); // white
      game.placePiece(2, 0); // black
      game.placePiece(2, 1); // white
      game.placePiece(3, 0); // black
      game.placePiece(3, 1); // white
      game.placePiece(4, 0); // black - 获胜

      expect(game.getGameStatus()).toBe(GameStatus.BLACK_WIN);
    });

    it('应该正确判断对角线五子连珠（左上到右下）', () => {
      game.placePiece(0, 0); // black
      game.placePiece(0, 1); // white
      game.placePiece(1, 1); // black
      game.placePiece(1, 2); // white
      game.placePiece(2, 2); // black
      game.placePiece(2, 3); // white
      game.placePiece(3, 3); // black
      game.placePiece(3, 4); // white
      game.placePiece(4, 4); // black - 获胜

      expect(game.getGameStatus()).toBe(GameStatus.BLACK_WIN);
    });

    it('应该正确判断对角线五子连珠（右上到左下）', () => {
      game.placePiece(0, 4); // black
      game.placePiece(0, 0); // white
      game.placePiece(1, 3); // black
      game.placePiece(1, 1); // white
      game.placePiece(2, 2); // black
      game.placePiece(2, 2); // 被占用，失败
      game.placePiece(2, 1); // white
      game.placePiece(3, 1); // black
      game.placePiece(3, 2); // white
      game.placePiece(4, 0); // black - 获胜

      expect(game.getGameStatus()).toBe(GameStatus.BLACK_WIN);
    });

    it('白棋获胜应该正确判断', () => {
      game.placePiece(0, 0); // black
      game.placePiece(0, 1); // white
      game.placePiece(1, 0); // black
      game.placePiece(1, 1); // white
      game.placePiece(2, 0); // black
      game.placePiece(2, 1); // white
      game.placePiece(3, 0); // black
      game.placePiece(3, 1); // white
      game.placePiece(8, 8); // black
      game.placePiece(4, 1); // white - 获胜

      expect(game.getGameStatus()).toBe(GameStatus.WHITE_WIN);
    });
  });

  describe('悔棋', () => {
    it('应该成功悔棋', () => {
      game.placePiece(7, 7);
      const result = game.undo();
      expect(result).toBe(true);
      expect(game.getCurrentPlayer()).toBe('black');
    });

    it('悔棋后该位置应该为空', () => {
      game.placePiece(7, 7);
      game.undo();
      const state = game.getState();
      expect(state.board[7][7]).toBeNull();
    });

    it('没有历史记录时悔棋应该失败', () => {
      const result = game.undo();
      expect(result).toBe(false);
    });

    it('悔棋后应该清除获胜状态', () => {
      // 创建获胜局面
      game.placePiece(0, 0);
      game.placePiece(1, 0);
      game.placePiece(0, 1);
      game.placePiece(1, 1);
      game.placePiece(0, 2);
      game.placePiece(1, 2);
      game.placePiece(0, 3);
      game.placePiece(1, 3);
      game.placePiece(0, 4); // 获胜

      expect(game.isGameOver()).toBe(true);

      game.undo();

      expect(game.isGameOver()).toBe(false);
      expect(game.getGameStatus()).toBe(GameStatus.PLAYING);
    });
  });

  describe('重新开始', () => {
    it('应该重置游戏状态', () => {
      game.placePiece(7, 7);
      game.restart();

      const state = game.getState();
      expect(state.status).toBe(GameStatus.PLAYING);
      expect(state.currentPlayer).toBe('black');
      expect(state.history).toHaveLength(0);
      expect(state.winningPositions).toHaveLength(0);
      expect(state.board[7][7]).toBeNull();
    });
  });

  describe('平局', () => {
    it('棋盘满时应该判断为平局', () => {
      // 填满棋盘但不产生获胜
      const game2 = new GomokuGame({ boardSize: 3, cellSize: 40, padding: 20 });

      // 填满 3x3 棋盘
      game2.placePiece(0, 0); // black
      game2.placePiece(0, 1); // white
      game2.placePiece(0, 2); // black
      game2.placePiece(1, 0); // white
      game2.placePiece(1, 1); // black
      game2.placePiece(1, 2); // white
      game2.placePiece(2, 0); // black
      game2.placePiece(2, 1); // white
      game2.placePiece(2, 2); // black

      expect(game2.getGameStatus()).toBe(GameStatus.DRAW);
    });
  });
});
