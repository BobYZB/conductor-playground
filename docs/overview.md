# 文档总览

这份文档是整个 `docs/` 目录的入口。

如果你不确定先看哪份文档，就从这里开始。

---

## 1. 按目的选择文档

### 想快速理解项目是什么

先看：

- `docs/tech-stack.md`

适合场景：

- 刚接手项目
- 想了解框架、部署、依赖、环境变量
- 想知道项目为什么这样设计

### 想知道模块和文件分别负责什么

先看：

- `docs/development-guide.md`

如果需要更细的接口信息，继续看：

- `docs/component-api.md`
- `docs/lib-api.md`

如果需求涉及内容字段和文档资源，继续看：

- `docs/content-model.md`

适合场景：

- 已经知道要改哪一类功能
- 想按模块定位代码文件
- 想理解页面、组件、工具层职责

### 想按页面区域找文件

先看：

- `docs/ui-location-guide.md`

如果还要继续改样式，配合看：

- `docs/ui-style-index.md`

适合场景：

- 想改首页某一块 UI
- 想改文档库筛选区
- 想改 PDF 阅读器界面
- 想改登录入口或回调页

### 想按任务找修改步骤

先看：

- `docs/common-tasks.md`

如果还想知道改完后怎么验证，配合看：

- `docs/validation-and-release.md`

适合场景：

- 想改阅读器交互
- 想改详情页布局
- 想新增字段
- 想新增文档
- 想改登录或同步逻辑

### 想知道最近已经改过什么

先看：

- `docs/changelog.md`

适合场景：

- 改动前先确认是否已有类似修改
- 需要追溯阅读器、布局、文档体系的最近变更

### 想看模块之间怎么连接

先看：

- `docs/module-dependency-map.md`

适合场景：

- 想知道页面依赖哪些组件
- 想知道组件依赖哪些 `lib`
- 想知道阅读器、登录、内容系统的调用关系

### 想理解内容字段和 PDF 目录规范

先看：

- `docs/content-model.md`

适合场景：

- 想新增 Frontmatter 字段
- 想新增 PDF 文档
- 想知道 Markdown 和 PDF 文件如何关联

### 想知道每类改动该怎么验证

先看：

- `docs/validation-and-release.md`

适合场景：

- 改完功能后准备收尾
- 发布前想快速过检查项
- 想知道不同改动的最低验证要求

---

## 2. 推荐阅读路径

### 第一次接手项目

建议顺序：

1. `docs/overview.md`
2. `docs/tech-stack.md`
3. `docs/development-guide.md`
4. `docs/component-api.md`
5. `docs/lib-api.md`
6. `docs/content-model.md`
7. `docs/module-dependency-map.md`

### 只想改一个界面

建议顺序：

1. `docs/overview.md`
2. `docs/ui-location-guide.md`
3. `docs/ui-style-index.md`
4. 对应页面 / 组件文件
5. `src/styles/global.css`

### 只想完成一个具体任务

建议顺序：

1. `docs/overview.md`
2. `docs/common-tasks.md`
3. `docs/development-guide.md`
4. `docs/validation-and-release.md`
5. 对应代码文件

### 修改前想先看历史

建议顺序：

1. `docs/changelog.md`
2. `docs/development-guide.md`
3. 对应代码文件

---

## 3. 最短决策法

如果你时间很少，可以直接这样判断：

- 改架构 / 依赖 / 部署：看 `docs/tech-stack.md`
- 改模块 / 代码职责：看 `docs/development-guide.md`
- 改组件输入输出：看 `docs/component-api.md`
- 改工具函数 / 数据访问：看 `docs/lib-api.md`
- 改内容字段 / PDF 目录：看 `docs/content-model.md`
- 改页面 / UI：看 `docs/ui-location-guide.md`
- 改 CSS 样式细节：看 `docs/ui-style-index.md`
- 改具体功能：看 `docs/common-tasks.md`
- 看验证与发布检查：看 `docs/validation-and-release.md`
- 查之前改过什么：看 `docs/changelog.md`
- 查调用关系：看 `docs/module-dependency-map.md`

---

## 4. 推荐维护方式

后续新增文档时，建议同步更新本文件，把新文档加到：

- “按目的选择文档”
- “推荐阅读路径”
- “最短决策法”

这样 `docs/overview.md` 就能一直作为文档入口使用。
