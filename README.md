# 五子棋游戏 (Gomoku Game)

一个使用 TypeScript 开发的经典五子棋游戏，支持人机对战和悔棋功能。

## 在线体验

直接在浏览器中打开 `index.html` 即可开始游戏。

## 功能特性

- ✨ **双人对战** - 黑白双方轮流落子
- 🎯 **智能判胜** - 自动检测横、竖、斜四个方向的五子连珠
- ↩️ **悔棋功能** - 支持撤销上一步操作
- 🔄 **重新开始** - 一键重置游戏
- 🎨 **精美界面** - 木质棋盘风格，渐变棋子效果
- ⚡ **获胜动画** - 闪烁高亮显示获胜线路
- 📱 **响应式设计** - 适配不同屏幕尺寸

## 技术栈

- **TypeScript** - 类型安全的 JavaScript 超集
- **ES 模块** - 使用 import/export 模块化开发
- **Canvas API** - 高性能 2D 图形渲染
- **面向对象设计** - 游戏逻辑与渲染分离

## 项目结构

```
gomoku-game/
├── src/
│   ├── types.ts      # 类型定义
│   ├── game.ts       # 游戏核心逻辑
│   ├── board.ts      # 棋盘渲染器
│   └── index.ts      # 游戏入口
├── dist/             # 编译后的 JavaScript
├── index.html        # 游戏页面
├── package.json      # 项目配置
├── tsconfig.json     # TypeScript 配置
└── README.md         # 项目说明
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 编译项目

```bash
npm run build
```

### 运行游戏

```bash
npm run serve
```

然后打开浏览器访问 `http://localhost:3000`

### 类型检查

```bash
npm run typecheck
```

## 游戏规则

1. 黑棋先行，双方轮流在棋盘交叉点落子
2. 五子连珠（横、竖、斜任意方向）即为获胜
3. 棋盘为 15×15 标准规格
4. 支持悔棋，可撤销上一步操作

## 核心类说明

### GomokuGame

游戏核心逻辑类，负责：
- 管理游戏状态（棋盘、当前玩家、胜负判断）
- 处理落子逻辑
- 检测获胜条件
- 支持悔棋和重新开始

### BoardRenderer

棋盘渲染类，负责：
- Canvas 画布初始化
- 绘制棋盘网格和星位
- 渲染棋子（带渐变效果）
- 显示最后落子标记
- 获胜连线动画

### GameUI

游戏界面控制类，负责：
- 绑定按钮事件
- 更新游戏状态显示
- 处理游戏回调

## 示例代码

```typescript
import { GomokuGame } from './game.js';

// 创建游戏实例
const game = new GomokuGame({
  boardSize: 15,    // 15×15 棋盘
  cellSize: 40,     // 格子大小 40px
  padding: 25       // 边距 25px
});

// 落子
game.placePiece(7, 7);  // 在第8行第8列落子

// 悔棋
game.undo();

// 重新开始
game.restart();

// 监听获胜事件
game.onWin((winner, positions) => {
  console.log(`${winner} 获胜！`);
});
```

## 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 开发计划

- [ ] 添加 AI 对战模式
- [ ] 支持音效
- [ ] 添加计时功能
- [ ] 保存游戏记录
- [ ] 支持多语言

## 许可证

MIT License

## 作者

- 作者：zhishan
- 日期：2024-01-01

---

欢迎 Star ⭐ 和 Fork！
