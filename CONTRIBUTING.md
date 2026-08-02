# 贡献指南

感谢你对 Music Web Player 项目的关注！欢迎参与贡献。

## 开发流程

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交变更：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

## 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 代码检查
npm run lint

# 构建
npm run build
```

## 代码规范

- 遵循 ESLint 配置，提交前确保 `npm run lint` 通过
- 使用 TypeScript，保持类型完整
- 遵循项目现有代码风格和命名约定
- 组件使用函数式组件 + Hooks

## 提交规范

提交信息请遵循 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

- `feat: 新功能`
- `fix: 修复 Bug`
- `docs: 文档变更`
- `style: 代码格式（不影响功能）`
- `refactor: 重构`
- `perf: 性能优化`
- `test: 测试`
- `chore: 构建或辅助工具变更`

## Pull Request

- PR 标题遵循提交规范格式
- 确保通过 lint 和 build 检查
- 如有 UI 变更，请附截图
- 关联相关 Issue（如 `Closes #123`）

## Issue

- Bug 报告请使用 Bug Report 模板
- 功能建议请使用 Feature Request 模板
- 请尽量提供详细的复现步骤和环境信息

## 许可

提交代码即表示你同意以 MIT 协议授权你的贡献。
