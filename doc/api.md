### TableView

表格视图组件，基于 CSS Grid 布局实现，支持列配置、行选择、排序、自定义渲染等能力。

#### 属性

| 属性                 | 类型                                 | 默认值          | 说明                                                                                                                                                                 |
| -------------------- | ------------------------------------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dataSource           | array                                | -               | 表格数据源                                                                                                                                                           |
| columns              | array                                | -               | 列配置，见下方 columns 说明                                                                                                                                          |
| rowKey               | string \| function                   | `'id'`          | 行唯一标识字段名或取值函数                                                                                                                                           |
| rowSelection         | object                               | -               | 行选择配置，见下方 rowSelection 说明                                                                                                                                 |
| placeholder          | string                               | `'-'`           | 空值占位符                                                                                                                                                           |
| emptyIsPlaceholder   | boolean                              | `true`          | 空值是否显示占位符                                                                                                                                                   |
| valueIsEmpty         | function                             | `@kne/is-empty` | 判断值是否为空的函数                                                                                                                                                 |
| empty                | ReactNode                            | `<Empty />`     | 无数据时的展示内容                                                                                                                                                   |
| headerStyle          | object                               | -               | 表头自定义样式，仅在 `render` 自定义渲染时作用于 `header`                                                                                                            |
| onRowSelect          | function                             | -               | 行点击回调 `(item, { columns, dataSource }) => void`                                                                                                                 |
| render               | function                             | -               | 自定义渲染 `({ header, renderBody }) => ReactNode`，可拆分表头与表体；返回值会包在默认 `.info-page-table` 容器内，单元格 padding 与普通 TableView 一致               |
| renderMobile         | boolean \| function \| string        | -               | 仅移动端生效。`true` 使用默认卡片 List；为 function 时完全接管渲染（见下方回调参数）；为 string 时从 `preset({ renderMobile })` 按名称取渲染函数，未注册则视为未开启 |
| sortRender           | function                             | -               | 排序按钮渲染，由 `useSort` 提供（桌面端表头）                                                                                                                        |
| mobileSortToolbar    | function                             | -               | 移动端排序工具栏，由 `useSort` 提供；与 `sortRender` 配合传入 TableView，由 `renderToolbar` / 默认卡片复用                                                           |
| context              | object                               | -               | 列渲染上下文，会传入 `render`、`getValueOf` 等回调                                                                                                                   |
| className            | string                               | -               | 自定义类名                                                                                                                                                           |
| size                 | `'small'` \| `'large'`               | -               | 单元格内边距：默认 `8px`，`small` 为 `4px`，`large` 为 `14px 8px`；可通过 CSS 变量覆盖，见下方说明                                                                   |
| dataType             | `'list'` \| `'tree'` \| `'treeList'` | `'list'`        | 数据形态。`list` 为扁平列表；`tree` 使用 `childrenKey` 嵌套子节点；`treeList` 按 `parentKey` 组装为树（空父级为根）                                                  |
| parentKey            | string                               | `'parentId'`    | `treeList` 模式下父子关联字段                                                                                                                                        |
| childrenKey          | string                               | `'children'`    | `tree` / 组装后的子节点字段名                                                                                                                                        |
| hasChildrenKey       | string                               | `'hasChildren'` | 节点是否仍有子级的标记字段；为 `true` 时即使尚无 `children` 也显示展开三角                                                                                           |
| treeTitleKey         | string \| function                   | `'name'`        | 移动端树形面包屑文案字段；为 function 时签名 `(item) => string`                                                                                                      |
| onLoadChildren       | function                             | -               | 懒加载：`(item, { key }) => void \| Promise`；首次展开且本地无子节点时触发，组件不改 dataSource，请用 `mergeTreeChildren` 合并                                       |
| expandedKeys         | `true` \| `false` \| `Array`         | -               | 受控展开。`true` 全部展开，`false` 全部收起，数组为展开的行 key                                                                                                      |
| defaultExpandedKeys  | `true` \| `false` \| `Array`         | `false`         | 非受控初始展开状态                                                                                                                                                   |
| onExpandedKeysChange | function                             | -               | 展开变化回调 `(keys) => void`；单节点切换时为 key 数组，全开/全关可为 `true` / `false`                                                                               |
| indentSize           | number                               | `16`            | 树形每层缩进宽度（px）                                                                                                                                               |

树形模式说明：

- 首列在勾选/单选前显示展开三角；无 `rowSelection` 时三角占原勾选位置
- 子级行（`level > 0`）默认灰色背景
- 全选范围包含**全部节点**（含收起的子行）；表体仅渲染当前展开可见行
- 移动端默认卡片同样支持缩进与展开三角，全选基于全部节点
- 懒加载：`hasChildren === true` 且无本地子节点时，展开会调用 `onLoadChildren`，三角显示 loading；同一节点只自动请求一次
- 移动端树形卡片顶部：`展开三角` + `checkbox/radio`（若有）+ `面包屑`（根到当前节点路径，按 `treeTitleKey` 取值，`/` 分隔）

`renderMobile` 为 function 时，TableView 会传入已接好 `rowSelection` / `mobileSortToolbar` 的能力，自定义布局只需选用，不必自己实现全选或排序：

| 回调参数                                        | 说明                                                       |
| ----------------------------------------------- | ---------------------------------------------------------- |
| `dataSource`                                    | 原始数据源                                                 |
| `displayDataSource`                             | 树形下为当前展开可见行；非树形与 `dataSource` 相同         |
| `columns`                                       | 布局后的列配置                                             |
| `rowKey` / `rowSelection` / `context` / `empty` | 与 TableView 一致                                          |
| `isTree`                                        | 是否为树形模式                                             |
| `renderBody`                                    | 渲染默认移动端卡片 List（含顶部工具栏）                    |
| `renderToolbar`                                 | 渲染组件级工具栏（全选居左、排序居右）；可自由决定摆放位置 |
| `getRowKey(item)`                               | 按 `rowKey` 取行 key                                       |
| `getSelectionProps(item)`                       | 返回 `{ checked, indeterminate, disabled, onChange }`      |
| `getTreeRowMeta(item)`                          | 树形行 meta：`{ key, level, hasChildren, expanded }`       |
| `getBreadcrumb(item)`                           | 面包屑文案数组（根 → 当前）                                |
| `isExpandLoading(item)`                         | 该行是否正在懒加载子节点                                   |
| `onToggleExpand(key)`                           | 切换展开                                                   |
| `onSelectionChange`                             | 行选择切换，签名与内部逻辑一致                             |

```jsx
renderMobile={({ displayDataSource, renderToolbar, getSelectionProps, getRowKey, getTreeRowMeta, getBreadcrumb, onToggleExpand }) => (
  <>
    {renderToolbar()}
    {displayDataSource.map(item => {
      const selection = getSelectionProps(item);
      const meta = getTreeRowMeta(item);
      return <MyTreeCard key={getRowKey(item)} item={item} meta={meta} breadcrumb={getBreadcrumb(item)} onExpand={() => onToggleExpand(getRowKey(item))} {...selection} />;
    })}
  </>
)}
```

`renderMobile` 默认卡片 List 行为：

- 每行一张卡片，卡片间距 `12px`，表格外边框隐藏
- 卡片 padding 跟随 `size`（复用 `--kne-table-cell-padding`）
- 普通列以「标题 + 内容」纵向排列；`options` 操作列固定在卡片右侧（ButtonGroup）
- 支持 `rowSelection`（左侧 checkbox / radio）；开启 `allowSelectedAll` 或排序（传入 `mobileSortToolbar`）时，卡片列表顶部显示工具栏：**全选居左**、**排序居右**（下拉选择排序列，方向为单图标，点击按「降序 → 升序 → 取消」循环，与 PC 端列头排序一致；也可在下拉选「取消排序」清除）
- 树形（`dataType` 为 `tree` / `treeList`）时卡片顶部为：`展开三角` + `勾选`（若有）+ `面包屑`（根到当前，按 `treeTitleKey`，`/` 分隔）
- 为 string 时通过 `preset({ renderMobile: { [name]: renderFn } })` 注册，用法：`renderMobile="orderCard"`

字符串类型说明：

| 值                      | 行为                                                                        |
| ----------------------- | --------------------------------------------------------------------------- |
| `true`                  | 默认卡片 List                                                               |
| `function`              | 自定义渲染，完全接管                                                        |
| `string`                | 从 preset 查找同名渲染函数；找到则等同 function，未找到则移动端回退普通表格 |
| `false` / 未注册 string | 不开启移动端专用渲染                                                        |

单元格 padding 由 CSS 变量控制，可在外层覆盖：

```css
.info-page-table {
  --kne-table-cell-padding-default: 8px; /* 默认 size */
  --kne-table-cell-padding-small: 4px; /* size="small" */
  --kne-table-cell-padding-large: 14px 8px; /* size="large" */
  /* 或直接覆盖当前生效值：--kne-table-cell-padding: 10px; */
}
```

#### columns

| 属性               | 类型                | 默认值         | 说明                                                                                                           |
| ------------------ | ------------------- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| name               | string              | -              | 字段名，对应 dataSource 中的属性                                                                               |
| title              | ReactNode           | -              | 列标题                                                                                                         |
| width              | number \| string    | -              | 列最小宽度，支持数字（如 `180`，视为 180px）或字符串（如 `'180px'`），内容超出时会自动撑开                     |
| span               | number              | -              | 列占比（基于 24 栅格），未设置时自动均分剩余栅格                                                               |
| min                | number              | -              | 列最小宽度（px），由 renderType 自动注入，也可手动覆盖                                                         |
| max                | number              | -              | 列最大宽度（px），由 renderType 自动注入，也可手动覆盖                                                         |
| align              | string              | `'top'`        | 垂直对齐方式                                                                                                   |
| justify            | string              | `'flex-start'` | 水平对齐方式                                                                                                   |
| format             | string \| function  | -              | 值格式化，见下方 format 说明                                                                                   |
| render             | function            | -              | 自定义单元格渲染 `(value, { column, dataSource, context }) => ReactNode`；与 `renderType` 同时存在时优先级最高 |
| renderType         | string              | -              | 声明式列渲染类型，见下方 renderType 说明；存在 `render` 时仅保留列宽等维度，不参与单元格渲染                   |
| getValueOf         | function            | -              | 自定义取值 `(dataSource, { column, context }) => any`，用于 render 所需复杂数据                                |
| sort               | boolean \| object   | -              | 是否支持排序，`{ single: true }` 为单列排序                                                                    |
| ellipsis           | boolean \| object   | `false`        | 超出省略，基于 antd Typography；`true` 开启省略与 tooltip，`{ showTitle: false }` 关闭 tooltip                 |
| display            | boolean \| function | -              | 是否显示该列                                                                                                   |
| emptyIsPlaceholder | boolean             | -              | 该列空值是否显示占位符                                                                                         |
| placeholder        | string              | -              | 该列空值占位符                                                                                                 |
| renderPlaceholder  | function            | -              | 自定义空值渲染                                                                                                 |
| type               | string              | -              | 列类型，如 `'options'` 表示操作列                                                                              |
| primary            | boolean             | -              | main 类型：是否显示主色样式                                                                                    |
| hover              | boolean             | -              | main 类型：是否显示悬停样式                                                                                    |
| onClick            | function            | -              | main 类型：点击回调 `({ item, colItem, event }) => void`                                                       |
| split              | string              | -              | list 类型：列表项分隔符，默认 `,`                                                                              |
| buttonGroup        | object              | -              | options 类型：透传给 `@kne/button-group` 的属性                                                                |

#### rowSelection

| 属性                | 类型                                     | 默认值     | 说明                                                                                                                                                                                                     |
| ------------------- | ---------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type                | `'checkbox'` \| `'radio'`                | -          | 选择类型                                                                                                                                                                                                 |
| selectedRowKeys     | array                                    | -          | 已选中的行 key 列表                                                                                                                                                                                      |
| onChange            | function                                 | -          | 选中变化回调 `(selectedRowKeys, id, { context, checked }) => void`                                                                                                                                       |
| allowSelectedAll    | boolean                                  | -          | 是否允许全选（仅 checkbox 模式）                                                                                                                                                                         |
| isSelectedAll       | boolean                                  | -          | 是否全选状态                                                                                                                                                                                             |
| onIsSelectAllChange | function                                 | -          | 全选状态变化回调                                                                                                                                                                                         |
| checkRelation       | `'parent'` \| `'all'` \| `'independent'` | `'parent'` | 树形 checkbox 父子勾选关联。仅 `dataType` 为 `tree` / `treeList` 时生效：`parent` 勾父级时子级 UI 全勾但值只留父级，取消子级会拆分父级，半选；`all` 值含父级与全部子孙，半选；`independent` 父子互不影响 |

树形 `checkRelation` 补充说明：

- `parent`（默认）：勾选节点会写入该 key 并去掉其子孙 key；子级全部勾选后折叠为父级；父级半选表示部分子孙被选
- `all`：勾选/取消同步增删子孙 key；子级全选时父级也写入值；父级半选
- `independent`：点哪个改哪个，无半选联动
- 全选：`parent` 写入各根节点 key；`all` / `independent` 写入全部节点 key（含收起子行）

#### 静态属性

| 属性                     | 类型      | 说明                 |
| ------------------------ | --------- | -------------------- |
| TableView.Header         | Component | 表头组件，可单独使用 |
| TableView.useSelectedRow | Hook      | 行选择 Hook          |
| TableView.useSort        | Hook      | 排序 Hook            |
| TableView.sortDataSource | function  | 本地排序工具函数     |

#### 示例

```jsx
<TableView
  dataSource={dataSource}
  columns={[
    { name: 'id', title: '订单编号', width: 160, renderType: 'small' },
    { name: 'customerName', title: '客户名称', renderType: 'main' },
    { name: 'amount', title: '金额', renderType: 'amount', format: 'number-style:decimal-suffix:元' }
  ]}
  rowSelection={{
    type: 'checkbox',
    selectedRowKeys,
    onChange: setSelectedRowKeys
  }}
/>
```

完整示例见文档 `TableView`。

### useSelectedRow

行选择 Hook，用于配合 `TableView` 的 `rowSelection`。

#### 参数

| 属性   | 类型                      | 默认值       | 说明       |
| ------ | ------------------------- | ------------ | ---------- |
| rowKey | string \| function        | `'id'`       | 行唯一标识 |
| type   | `'checkbox'` \| `'radio'` | `'checkbox'` | 选择类型   |

#### 返回值

| 属性               | 类型     | 说明                                                            |
| ------------------ | -------- | --------------------------------------------------------------- |
| selectedRowKeys    | array    | 已选行 key 列表                                                 |
| selectedRows       | array    | 已选行数据                                                      |
| onSelect           | function | `(item, checked) => void`                                       |
| onSelectAll        | function | `(checked, selected, items) => void`                            |
| setSelectedRows    | function | 直接设置已选行数据                                              |
| setSelectedRowKeys | function | `(keys, dataSource) => void`                                    |
| clearSelectedRows  | function | 清空选择                                                        |
| getRowSelection    | function | `(dataSource, extra?) => rowSelection` 生成 `rowSelection` 配置 |

#### 示例

```jsx
const { selectedRowKeys, selectedRows, getRowSelection, clearSelectedRows } = TableView.useSelectedRow({ rowKey: 'id' });

<TableView dataSource={dataSource} columns={columns} rowSelection={getRowSelection(dataSource)} />;
```

完整示例见文档 `useSelectedRow`。

### useSort

排序 Hook，配合 `TableView` 的 `sortRender` 实现表头排序。

#### 参数

| 属性         | 类型     | 默认值 | 说明                                           |
| ------------ | -------- | ------ | ---------------------------------------------- |
| sort         | array    | -      | 受控排序值 `[{ name, sort: 'ASC' \| 'DESC' }]` |
| defaultSort  | array    | `[]`   | 默认排序                                       |
| onSortChange | function | -      | 排序变化回调 `(sort) => void`                  |

#### 返回值

| 属性              | 类型     | 说明                                                          |
| ----------------- | -------- | ------------------------------------------------------------- |
| sort              | array    | 当前排序配置                                                  |
| setSort           | function | 设置排序                                                      |
| sortRender        | function | `({ name, single }) => ReactNode`，传给 TableView 表头        |
| mobileSortToolbar | function | `({ columns }) => ReactNode`，传给 TableView 移动端工具栏右侧 |

#### columns.sort

| 值                  | 说明                         |
| ------------------- | ---------------------------- |
| `true`              | 开启排序，默认单列模式       |
| `{ single: true }`  | 单列排序，切换列时清除其他列 |
| `{ single: false }` | 多列排序                     |

#### sortDataSource

本地排序工具函数：`sortDataSource(dataSource, sort, columns)`。支持数字排序与中文 `localeCompare` 排序，空值始终排在末尾。

#### 示例

```jsx
const { sort, sortRender, mobileSortToolbar } = TableView.useSort({ onSortChange: console.log });
const sortedData = useMemo(() => TableView.sortDataSource(dataSource, sort, columns), [sort, dataSource]);

<TableView dataSource={sortedData} columns={columns} sortRender={sortRender} mobileSortToolbar={mobileSortToolbar} />;
```

完整示例见文档 `useSort`。

### renderType

通过 `columns.renderType` 声明列的渲染方式，无需手写 `render`。可与尺寸修饰词组合。若同时配置了 `columns.render`，则以 `render` 为准（优先级最高），`renderType` 仍可注入 width / min / max 等维度。

#### 内置类型

| 类型          | 说明                                                     | 默认宽度 |
| ------------- | -------------------------------------------------------- | -------- |
| `main`        | 主信息列，支持 `primary` / `hover` / `onClick`，自动省略 | 300px    |
| `amount`      | 金额列，右对齐，自动省略                                 | 140px    |
| `options`     | 操作列，铺满单元格，配合 `@kne/button-group`             | 180px    |
| `tag`         | 单个 Tag，`getValueOf` 返回 `{ type, text }`             | 140px    |
| `status`      | 状态 Badge，`getValueOf` 返回 `{ type, text }`           | 100px    |
| `tagList`     | 多个 Tag 列表                                            | 300px    |
| `list`        | 文本列表，可用 `split` 指定分隔符                        | 200px    |
| `description` | 长文本描述列，自动省略                                   | 400px    |

#### 尺寸修饰词

可与类型组合，如 `tag-short`、`status-small`、`main-large`：

| 修饰词  | 说明     | 宽度  |
| ------- | -------- | ----- |
| `short` | 缩短列宽 | 120px |
| `small` | 最小列宽 | 100px |
| `large` | 放大列宽 | 300px |

#### options 列按钮配置

`getValueOf` 返回按钮配置数组，每项支持：

| 属性     | 类型      | 说明                       |
| -------- | --------- | -------------------------- |
| children | ReactNode | 按钮文案                   |
| onClick  | function  | 点击回调                   |
| isDelete | boolean   | 是否为删除操作（弹出确认） |
| message  | string    | 删除确认文案               |
| hidden   | boolean   | 是否隐藏                   |

完整示例见文档 `renderType`。

### format

通过 `columns.format` 声明式格式化展示值，支持链式组合（空格分隔多个格式化器）。

#### 内置格式化器

| 名称        | 参数        | 说明           | 示例                                            |
| ----------- | ----------- | -------------- | ----------------------------------------------- |
| `date`      | 模板        | 日期格式化     | `format: 'date'` 或 `format: 'date-YYYY/MM/DD'` |
| `datetime`  | 模板        | 日期时间格式化 | `format: 'datetime'`                            |
| `dateRange` | 模板, allow | 日期范围       | `format: 'dateRange-YYYY-MM-DD-allow'`          |
| `boolean`   | trueValue   | 布尔值转是/否  | `format: 'boolean'`                             |
| `number`    | 见下方      | 数字格式化     | `format: 'number-style:decimal-suffix:元'`      |
| `money`     | 单位        | 金额拼接       | `format: 'money-元'`                            |

#### number 格式化参数

通过 `calcArgs` 解析，格式为 `number-style:decimal-maximumFractionDigits:0-useGrouping:true-suffix:元`：

| 参数                  | 类型    | 默认值         | 说明           |
| --------------------- | ------- | -------------- | -------------- |
| style                 | string  | `'decimal'`    | Intl 数字样式  |
| unit                  | number  | `1`            | 除数           |
| maximumFractionDigits | number  | `2`            | 最大小数位     |
| useGrouping           | boolean | `true`         | 是否使用千分位 |
| roundingMode          | string  | `'halfExpand'` | 舍入模式       |
| suffix                | string  | `''`           | 后缀           |

也可传入函数：`format: (value, { dataSource, column, context }) => string`。

### preset / globalParams

全局参数预设，用于定制 renderType 映射、列宽与标签颜色。

```jsx
import { preset } from '@kne/table-view';

preset({
  renderTypeSize: {
    main: { width: 400, min: 200, max: 600 }
  },
  renderMobile: {
    orderCard: ({ renderBody }) => <div>{renderBody()}</div>
  },
  tagTypeColors: {
    custom: '#1890ff'
  },
  statusTypeColors: {
    custom: '#52c41a'
  }
});
```

| 属性             | 类型   | 说明                                                   |
| ---------------- | ------ | ------------------------------------------------------ |
| renderType       | object | 自定义 renderType 映射                                 |
| renderTypeSize   | object | 覆盖内置类型的 width / min / max                       |
| renderMobile     | object | 注册移动端渲染函数，`renderMobile="name"` 时按名称查找 |
| tagTypeColors    | object | Tag 颜色映射                                           |
| statusTypeColors | object | Status 颜色映射                                        |

### 列解析工具

| 函数                                           | 说明                                                |
| ---------------------------------------------- | --------------------------------------------------- |
| `resolveColumns(columns)`                      | 批量解析列配置，自动注入 render、width、ellipsis 等 |
| `resolveColumn(column)`                        | 解析单个列配置                                      |
| `parseRenderType(renderType)`                  | 解析 renderType 字符串，返回 `{ type, size }`       |
| `resolveRenderType(renderType)`                | 解析 renderType 并返回完整维度信息                  |
| `getColumnRender(column)`                      | 获取列的 render 函数                                |
| `getRenderTypeNames()`                         | 获取所有已注册的 renderType 名称                    |
| `isOptionsColumn(column)`                      | 判断是否为操作列                                    |
| `resolveRenderMobile(renderMobile)`            | 解析 renderMobile 配置，string 时从 preset 查找     |
| `isRenderMobileActive(renderMobile, isMobile)` | 判断当前是否应启用移动端专用渲染                    |

### 列值计算

| 函数                             | 说明                                   |
| -------------------------------- | -------------------------------------- |
| `computeColumnsValue(options)`   | 计算列值，处理 format、display、空值等 |
| `computeDisplay(options)`        | 根据列值渲染展示内容                   |
| `computeColumnsDisplay(options)` | 批量计算并渲染列展示内容               |

`computeColumnsValue` 参数：

| 属性               | 类型     | 默认值 | 说明                           |
| ------------------ | -------- | ------ | ------------------------------ |
| columns            | array    | -      | 列配置                         |
| dataSource         | object   | -      | 行数据                         |
| context            | object   | -      | 渲染上下文                     |
| emptyIsPlaceholder | boolean  | -      | 空值是否显示占位符             |
| valueIsEmpty       | function | -      | 空值判断函数                   |
| placeholder        | string   | -      | 占位符                         |
| removeEmpty        | boolean  | `true` | 是否过滤 display 为 false 的列 |

### 渲染工具

| 函数                                            | 说明                   |
| ----------------------------------------------- | ---------------------- |
| `renderCellContent(content, column, className)` | 渲染单元格内容         |
| `getColumnEllipsis(column)`                     | 获取列的 ellipsis 配置 |
| `wrapColumnHeaderTitle(title)`                  | 包装表头标题，支持省略 |
| `renderColumnTitle(title, column, sortRender)`  | 渲染带排序的表头标题   |
| `getTagColor(type)`                             | 获取 Tag 颜色          |
| `renderTagItem(value)`                          | 渲染单个 Tag           |
| `renderTagList(value)`                          | 渲染 Tag 列表          |
| `getStatusType(type)`                           | 获取 Status 类型       |
| `renderStatusItem(value)`                       | 渲染 Status            |

### 列宽工具

| 函数                                       | 说明                                               |
| ------------------------------------------ | -------------------------------------------------- |
| `parseColumnWidth(width)`                  | 解析列宽值为数字（px）                             |
| `getColumnLayout(column, options)`         | 获取列布局信息（widthBased、fillRemaining、style） |
| `getGridTemplateColumns(columns, options)` | 生成 CSS Grid 模板列                               |
| `getTreeSelectionColumnWidth(options)`     | 计算树形/选择列宽度                                |
| `hasColumnSpan(column)`                    | 是否设置了 span                                    |
| `hasColumnWidth(column, columns)`          | 是否设置了 width                                   |

### 树形数据工具

| 函数                                                   | 说明                                 |
| ------------------------------------------------------ | ------------------------------------ |
| `isTreeDataType(dataType)`                             | 是否为 `tree` / `treeList`           |
| `buildTreeFromList(list, options)`                     | 扁平列表按 `parentKey` 组装为树      |
| `normalizeTreeData(dataSource, options)`               | 按 `dataType` 归一化为树             |
| `flattenVisibleTree(tree, options)`                    | 按展开状态展平可见行                 |
| `flattenAllTree(tree, options)`                        | 展平全部节点（含收起子行，用于全选） |
| `collectExpandableKeys(tree, options)`                 | 收集所有可展开节点 key               |
| `toggleExpandedKey(expandedKeys, key, expandableKeys)` | 切换单个节点展开状态                 |
| `nodeCanExpand(item, options)`                         | 是否显示展开三角（含 hasChildren）   |
| `mergeTreeChildren(dataSource, children, options)`     | 懒加载后合并子节点（tree/treeList）  |
| `getTreeBreadcrumbItems(key, maps)`                    | 移动端面包屑：根到当前节点的节点列表 |
| `buildTreeKeyMaps(tree, options)`                      | 构建父子/子孙 key 映射               |
| `toggleTreeCheck(options)`                             | 按 checkRelation 切换勾选 keys       |
| `getTreeCheckState(key, selectedKeys, mode, maps)`     | 返回 `{ checked, indeterminate }`    |
| `normalizeParentKeys(keys, maps)`                      | parent 模式折叠全选子树为父 key      |
| `buildSelectAllKeys` / `buildClearSelectAllKeys`       | 树形全选 / 取消全选 keys             |

### 常量

| 常量                | 说明                                         |
| ------------------- | -------------------------------------------- |
| `RENDER_TYPE_NAMES` | 所有 renderType 名称数组                     |
| `SIZE_NAMES`        | 尺寸修饰词数组 `['short', 'small', 'large']` |
