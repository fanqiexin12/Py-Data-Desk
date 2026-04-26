# Py Data Desk

🚀 **一个为数据科学家精心打造的离线 Python 数据处理指令指南**

Py Data Desk 是一个轻量级、响应迅速且功能完善的 Python 库速查工具。它涵盖了数据科学领域最核心的库（Pandas, NumPy, SciPy, Statsmodels, Scikit-learn, Keras, Gensim, Seaborn, Matplotlib），旨在帮助开发者在没有网络的环境下快速查阅指令、参数及示例。

## ✨ 主要功能与优点

- **库全覆盖**：集成 9 大主流数据科学库，从基础矩阵运算到深度学习模型。
- **参数说明**：每个指令都包含核心参数及其详细官方说明。
- **场景化搜索**：内置多种应用场景（如“数据清洗”、“统计建模”），通过场景快速定位指令。
- **智能模糊搜索**：基于标题、缩写及关键字的高权重匹配系统。
- **暗黑科技风 UI**：基于 Tailwind CSS 构建，提供流畅的视觉体验与动效。
- **离线运行**：项目已支持本地化资源加载，构建后可在无 Node.js、无网络的电脑上直接双击打开运行。

## 🛠️ 使用方式

### 方案 A：直接运行 (推荐离线电脑使用)
如果您已经拥有构建好的 `dist` 文件夹，只需进入该文件夹，双击 `index.html` 即可在浏览器中查看。
*注：本项目已配置 `base: './'`，支持本地文件协议 (file://) 直接访问。*

### 方案 B：本地构建
如果您是从 GitHub 克隆的代码，请按照以下步骤构建：

1. **安装环境**：确保电脑已安装 [Node.js](https://nodejs.org/)。
2. **安装依赖**：
   ```bash
   npm install
   ```
   *注意：如果报错 `vite: command not found`，通常是因为没有执行这一步。*
3. **本地开发预览**：
   ```bash
   npm run dev
   ```
4. **打包构建**：
   ```bash
   npm run build
   ```
   构建完成后，所有的静态资源将生成在 `dist` 目录下。

## 📂 目录说明
- `src/knowledge.js`: 核心知识库，包含所有库的指令数据。
- `src/App.tsx`: 主界面逻辑与 UI 组件。
- `vite.config.ts`: 针对离线访问进行的打包配置。

---

## ✒️ 署名
Created & Developed by **Bruno.Fang**

## 📄 开源协议
本项目采用 MIT 协议。欢迎提交 PR 或 Star！
