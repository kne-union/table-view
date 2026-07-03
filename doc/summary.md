`@kne/table-view` 是一个基于 React 和 Ant Design 的表格视图组件库，提供轻量灵活的 CSS Grid 表格布局，以及列渲染、格式化、排序、行选择等开箱即用的能力。组件库从 `@kne/table-page` 中独立拆分，专注于表格视图层与列渲染体系，可单独使用，也可被 `TablePage`、`Table` 等上层组件集成。

### 核心组件

#### TableView

基于 CSS Grid 的表格视图组件，以栅格布局实现表头与表体的对齐展示。相比于 antd `Table`，它更轻量灵活，适合需要自定义渲染、移动端适配或卡片式表格场景。支持：

- 基于 24 栅格的列宽分配（`span` 属性）与固定宽度（`width`）
- CSS Grid 自动布局，内容超出时自动撑开
- 行选择（checkbox 多选 / radio 单选）
- 行点击事件与自定义 `render` 拆分表头/表体
- 通过 `sortRender` 配合 `useSort` 实现表头排序

### 核心 Hooks

#### useSelectedRow

行选择 Hook，支持多选（checkbox）和单选（radio）两种模式。提供 `getRowSelection(dataSource)` 生成标准 `rowSelection` 配置，以及 `selectedRowKeys`、`selectedRows`、`clearSelectedRows` 等状态管理能力。

#### useSort

排序 Hook，配合 `TableView` 的 `sortRender` 实现表头排序交互。支持单列排序与多列排序，排序状态循环切换：DESC → ASC → 取消。提供 `sortDataSource` 工具函数用于本地排序（包含中文排序）。

### 列渲染类型系统

通过 `renderType` 属性，可以用声明式的方式定义列的渲染样式，无需手写 `render` 函数。内置 `main`、`amount`、`tag`、`status`、`tagList`、`list`、`options`、`description`、`enum` 等类型，并支持与 `short` / `small` / `large` 尺寸修饰组合。

配合 `format` 属性可实现日期、金额、布尔值等展示格式化；配合 `getValueOf` 可传入 render 所需的复杂数据结构。

### 工具函数

| 导出项 | 说明 |
|--------|------|
| `computeColumnsValue` / `computeDisplay` | 列值计算与展示渲染 |
| `formatView` / `defaultFormat` | 声明式值格式化 |
| `resolveColumns` / `resolveColumn` | 列配置解析，自动注入 renderType 对应的 render 与宽度 |
| `preset` / `globalParams` | 全局参数预设，定制 renderType 映射与标签颜色 |
| `getTagColor` / `renderTagItem` / `renderTagList` | Tag 渲染工具 |
| `getStatusType` / `renderStatusItem` | Status 渲染工具 |

### 使用场景

- **详情页信息展示**：在 InfoPage 等场景中展示结构化数据列表
- **轻量列表页**：不需要 antd Table 复杂能力时的简洁表格
- **移动端适配**：栅格式布局更适合窄屏展示
- **自定义表格渲染**：通过 `render` 属性拆分表头与表体，灵活组合布局
- **列渲染复用**：`renderType` 体系统一 tag、status、amount 等常见列样式
