# online-doc-manage

轻量化纯静态在线文档地址管理系统 - 通过 JSON 文件存储，JavaScript 动态渲染，支持分类筛选和关键词搜索。

## 特点

- 🪶 **极度轻量化**：无数据库，无后端，纯静态 HTML + JavaScript
- 🎨 **美观卡片展示**：响应式卡片布局，支持移动端
- 🔍 **快速搜索**：支持关键词实时搜索
- 🏷️ **分类筛选**：支持自由分类，点击筛选
- 🚀 **一键部署**：支持 GitHub Pages 等静态托管，免费使用
- ➕ **方便新增**：只需编辑 JSON 文件添加文档，提交即生效

## 文件结构

```
online-doc-manage/
├── index.html          # 主页面
├── app.js              # 主逻辑
├── data/
│   └── documents.json  # 数据文件（分类和文档都存在这里）
└── README.md
```

## 使用方法

### 新增文档

1. 打开 `data/documents.json`
2. 找到最后一个文档 ID，递增生成新 ID（如 `doc-1` → `doc-2`）
3. 添加新文档记录：

```json
{
  "id": "doc-2",
  "name": "文档名称",
  "url": "https://xxx",
  "categoryId": "category-1",
  "remark": "文档备注说明",
  "createdAt": "2026-03-27"
}
```

4. 保存文件，提交到 Git，推送到 GitHub，GitHub Pages 会自动部署

### 新增分类

1. 打开 `data/documents.json`
2. 在 `categories` 数组中添加新分类：

```json
{
  "id": "category-3",
  "name": "分类名称",
  "sort": 3
}
```

3. `sort` 是排序号，从小到大排序

## 本地开发

直接用浏览器打开 `index.html` 即可查看效果。

```bash
# Mac
open index.html

# Windows
start index.html
```

## 部署到 GitHub Pages

1. 将本仓库推送到你的 GitHub
2. 进入仓库 → Settings → Pages
3. **Source** 选择 `Deploy from a branch`
4. **Branch** 选择 `main` 分支，目录选择 `/root`
5. 点击 Save，等待几分钟即可访问
6. 地址：`https://<用户名>.github.io/<仓库名>/`

## 技术栈

- HTML + 原生 JavaScript（无框架依赖）
- Tailwind CSS（CDN 引入，无需构建）
- JSON 文件存储

## 许可证

MIT
