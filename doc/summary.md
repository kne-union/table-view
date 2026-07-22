`@kne/table-view` 是一个基于 React 和 Ant Design 的表格视图组件库，提供轻量灵活的 CSS Grid 表格布局，以及列渲染、格式化、排序、行选择等开箱即用的能力。专注于表格视图层与列渲染体系，可单独使用或嵌入业务页面。

### 核心组件

#### TableView

基于 CSS Grid 的表格视图组件，以栅格布局实现表头与表体的对齐展示。相比于 antd `Table`，它更轻量灵活，适合需要自定义渲染、移动端适配或卡片式表格场景。支持：

- 基于 24 栅格的列宽分配（`span` 属性）与固定宽度（`width`）
- CSS Grid 自动布局，内容超出时自动撑开
- 行选择（checkbox 多选 / radio 单选）
- 树形数据（`dataType`: `list` / `tree` / `treeList`），支持展开收起、层级缩进与全选含收起子行
- 行点击事件与自定义 `render` 拆分表头/表体
- 通过 `sortRender` 配合 `useSort` 实现表头排序

### 核心 Hooks

#### useSelectedRow

行选择 Hook，支持多选（checkbox）和单选（radio）两种模式。提供 `getRowSelection(dataSource)` 生成标准 `rowSelection` 配置，以及 `selectedRowKeys`、`selectedRows`、`clearSelectedRows` 等状态管理能力。

#### useSort

排序 Hook，配合 `TableView` 的 `sortRender` 实现表头排序交互。支持单列排序与多列排序，排序状态循环切换：DESC → ASC → 取消。提供 `sortDataSource` 工具函数用于本地排序（包含中文排序）。

### 渲染逻辑

#### 桌面端：CSS Grid 表格

`TableView` 默认以 CSS Grid 渲染表头与表体。列配置经 `resolveColumns` 解析后，按 `display !== false` 过滤得到布局列，再计算 `gridTemplateColumns`（支持 `span` 栅格、`width` 固定宽、列宽拖动后的 `colsSize`）。每行数据走统一的单元格渲染管线：

1. **`computeColumnsValue`**：按列取原始值（`getValueOf` 或 `dataSource[name]`），经 `format` 格式化，过滤 `display` 为 false 或空值不展示的行
2. **`computeDisplay`**：空值走 `placeholder` / `renderPlaceholder`；非空值调用列 `render`（见下方优先级）
3. **`renderCellContent`**：按列 `ellipsis` / `cellFullWidth` 包裹 `Ellipsis` 与宽度约束后输出

自定义外层布局时，可通过 `render={({ header, renderBody }) => ...}` 拆分表头与表体；无数据时仍渲染表头并展示 `empty`。

#### 列渲染优先级

| 优先级 | 来源            | 说明                                                                                                                                             |
| ------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1      | `column.render` | 自定义函数，**最高优先级**；存在时不再走 `renderType` 内置渲染                                                                                   |
| 2      | `renderType`    | 声明式类型（`main`、`amount`、`tag`、`status`、`tagList`、`list`、`options`、`description` 等），由 `resolveColumn` 注入对应 `render` 与列宽维度 |
| 3      | 原始值          | 无 `render` 且无有效 `renderType` 时，直接展示格式化后的 `value`                                                                                 |

`render` 与 `renderType` 可同时配置：`renderType` 仍负责注入 `width` / `min` / `max` / `ellipsis` 等布局维度，仅单元格内容由 `render` 覆盖。

`renderType` 支持尺寸修饰符组合，如 `enum-small`、`main-large`（`short` / `small` / `large`），维度可通过 `globalParams.renderTypeSize` 全局覆盖。

#### 移动端：`renderMobile`

移动端判断统一使用 `@kne/responsive-utils` 的 `useIsMobile()`（断点 768px）。仅当 `isRenderMobileActive(renderMobile, isMobile)` 为 true 时启用移动端专用渲染，桌面端始终走 Grid 或 `render`。

| `renderMobile` 值                | 行为                                                                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `true`                           | 默认卡片 List（`MobileCardList`）：每行一张卡片，普通列纵向「标题 + 内容」，`options` 操作列固定右侧                                                    |
| `function`                       | 签名与 `render` 一致 `({ header, renderBody, ...props }) => ReactNode`，**完全接管**移动端渲染，优先级高于 `render`；可调用 `renderBody()` 复用默认卡片 |
| `string`                         | 从 `preset({ renderMobile: { [name]: fn } })` 按名称查找；找到等同 function，**未注册则视为未开启**，移动端回退普通表格                                 |
| 未设置 / `false` / 未注册 string | 不开启移动端专用渲染，移动端仍显示 Grid 表格                                                                                                            |

默认卡片 List 细节：

- 普通列与 `options` 列分离：`isOptionsColumn` 识别操作列，字段列在卡片主体纵向排列，操作列在右侧独立区域
- 移动端操作区紧凑展示：`options` 列设置 `mobileOptions` 与 `buttonGroup.showLength: 0`，仅保留「⋯」入口，避免按钮截断
- 支持 `rowSelection`（左侧 checkbox / radio）；`allowSelectedAll` 时列表顶部显示全选
- 卡片 padding 跟随 `size`，复用 `--kne-table-cell-padding` CSS 变量

### 列渲染类型系统

通过 `renderType` 属性，可以用声明式的方式定义列的渲染样式，无需手写 `render` 函数。内置 `main`、`amount`、`tag`、`status`、`tagList`、`list`、`options`、`description` 等类型，并支持与 `short` / `small` / `large` 尺寸修饰组合。

配合 `format` 属性可实现日期、金额、布尔值等展示格式化；配合 `getValueOf` 可传入 render 所需的复杂数据结构。

### 工具函数

| 导出项                                                                              | 说明                                                 |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `computeColumnsValue` / `computeDisplay`                                            | 列值计算与展示渲染                                   |
| `formatView` / `defaultFormat`                                                      | 声明式值格式化                                       |
| `resolveColumns` / `resolveColumn`                                                  | 列配置解析，自动注入 renderType 对应的 render 与宽度 |
| `preset` / `globalParams`                                                           | 全局参数预设，定制 renderType 映射与标签颜色         |
| `getTagColor` / `renderTagItem` / `renderTagList`                                   | Tag 渲染工具                                         |
| `getStatusType` / `renderStatusItem`                                                | Status 渲染工具                                      |
| `buildTreeFromList` / `normalizeTreeData` / `flattenVisibleTree` / `flattenAllTree` | 树形数据组装与展平                                   |
| `collectExpandableKeys` / `toggleExpandedKey` / `isTreeDataType`                    | 树形展开状态工具                                     |
| `mergeTreeChildren` / `nodeCanExpand`                                               | 懒加载合并子节点 / 是否可展开                        |
| `getTreeBreadcrumbItems`                                                            | 移动端树形面包屑路径节点                             |
| `toggleTreeCheck` / `getTreeCheckState` / `buildTreeKeyMaps`                        | 树形勾选关联（checkRelation）                        |

### 使用场景

- **详情页信息展示**：在 InfoPage 等场景中展示结构化数据列表
- **轻量列表页**：不需要 antd Table 复杂能力时的简洁表格
- **移动端适配**：`renderMobile` 启用卡片 List，或 CSS Grid 栅格式展示
- **自定义表格渲染**：通过 `render` 属性拆分表头与表体，灵活组合布局
- **列渲染复用**：`renderType` 体系统一 tag、status、amount 等常见列样式
