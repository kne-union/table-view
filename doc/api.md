### TableView

表格视图组件，基于 CSS Grid 布局实现，支持列配置、行选择、排序、自定义渲染等能力。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| dataSource | array | - | 表格数据源 |
| columns | array | - | 列配置，见下方 columns 说明 |
| rowKey | string \| function | `'id'` | 行唯一标识字段名或取值函数 |
| rowSelection | object | - | 行选择配置，见下方 rowSelection 说明 |
| placeholder | string | `'-'` | 空值占位符 |
| emptyIsPlaceholder | boolean | `true` | 空值是否显示占位符 |
| valueIsEmpty | function | `@kne/is-empty` | 判断值是否为空的函数 |
| empty | ReactNode | `<Empty />` | 无数据时的展示内容 |
| headerStyle | object | - | 表头自定义样式，仅在 `render` 自定义渲染时作用于 `header` |
| onRowSelect | function | - | 行点击回调 `(item, { columns, dataSource }) => void` |
| render | function | - | 自定义渲染 `({ header, renderBody }) => ReactNode`，可拆分表头与表体；返回值会包在默认 `.info-page-table` 容器内，单元格 padding 与普通 TableView 一致 |
| renderMobile | boolean \| function \| string | - | 仅移动端生效。`true` 使用默认卡片 List；为 function 时完全接管渲染（见下方回调参数）；为 string 时从 `preset({ renderMobile })` 按名称取渲染函数，未注册则视为未开启 |
| sortRender | function | - | 排序按钮渲染，由 `useSort` 提供（桌面端表头） |
| mobileSortToolbar | function | - | 移动端排序工具栏，由 `useSort` 提供；与 `sortRender` 配合传入 TableView，由 `renderToolbar` / 默认卡片复用 |
| context | object | - | 列渲染上下文，会传入 `render`、`getValueOf` 等回调 |
| className | string | - | 自定义类名 |
| size | `'small'` \| `'large'` | - | 单元格内边距：默认 `8px`，`small` 为 `4px`，`large` 为 `14px 8px`；可通过 CSS 变量覆盖，见下方说明 |

`renderMobile` 为 function 时，TableView 会传入已接好 `rowSelection` / `mobileSortToolbar` 的能力，自定义布局只需选用，不必自己实现全选或排序：

| 回调参数 | 说明 |
|------|------|
| `dataSource` | 当前页数据 |
| `columns` | 布局后的列配置 |
| `rowKey` / `rowSelection` / `context` / `empty` | 与 TableView 一致 |
| `renderBody` | 渲染默认移动端卡片 List（含顶部工具栏） |
| `renderToolbar` | 渲染组件级工具栏（全选居左、排序居右）；可自由决定摆放位置 |
| `getRowKey(item)` | 按 `rowKey` 取行 key |
| `getSelectionProps(item)` | 返回 `{ checked, disabled, onChange }`，可直接绑到卡片上的 Checkbox / Radio |
| `onSelectionChange` | 行选择切换，签名与内部逻辑一致 |

```jsx
renderMobile={({ dataSource, renderToolbar, getSelectionProps, getRowKey }) => (
  <>
    {renderToolbar()}
    {dataSource.map(item => {
      const selection = getSelectionProps(item);
      return <MyCard key={getRowKey(item)} item={item} {...selection} />;
    })}
  </>
)}
```

`renderMobile` 默认卡片 List 行为：

- 每行一张卡片，卡片间距 `12px`，表格外边框隐藏
- 卡片 padding 跟随 `size`（复用 `--kne-table-cell-padding`）
- 普通列以「标题 + 内容」纵向排列；`options` 操作列固定在卡片右侧（ButtonGroup）
- 支持 `rowSelection`（左侧 checkbox / radio）；开启 `allowSelectedAll` 或排序（传入 `mobileSortToolbar`）时，卡片列表顶部显示工具栏：**全选居左**、**排序居右**（可选择排序列、切换升序/降序；再次点击当前方向或下拉选「取消排序」可清除）
- 为 string 时通过 `preset({ renderMobile: { [name]: renderFn } })` 注册，用法：`renderMobile="orderCard"`

字符串类型说明：

| 值 | 行为 |
|------|------|
| `true` | 默认卡片 List |
| `function` | 自定义渲染，完全接管 |
| `string` | 从 preset 查找同名渲染函数；找到则等同 function，未找到则移动端回退普通表格 |
| `false` / 未注册 string | 不开启移动端专用渲染 |

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

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| name | string | - | 字段名，对应 dataSource 中的属性 |
| title | ReactNode | - | 列标题 |
| width | number \| string | - | 列最小宽度，支持数字（如 `180`，视为 180px）或字符串（如 `'180px'`），内容超出时会自动撑开 |
| span | number | - | 列占比（基于 24 栅格），未设置时自动均分剩余栅格 |
| min | number | - | 列最小宽度（px），由 renderType 自动注入，也可手动覆盖 |
| max | number | - | 列最大宽度（px），由 renderType 自动注入，也可手动覆盖 |
| align | string | `'top'` | 垂直对齐方式 |
| justify | string | `'flex-start'` | 水平对齐方式 |
| format | string \| function | - | 值格式化，见下方 format 说明 |
| render | function | - | 自定义单元格渲染 `(value, { column, dataSource, context }) => ReactNode`；与 `renderType` 同时存在时优先级最高 |
| renderType | string | - | 声明式列渲染类型，见下方 renderType 说明；存在 `render` 时仅保留列宽等维度，不参与单元格渲染 |
| getValueOf | function | - | 自定义取值 `(dataSource, { column, context }) => any`，用于 render 所需复杂数据 |
| sort | boolean \| object | - | 是否支持排序，`{ single: true }` 为单列排序 |
| ellipsis | boolean \| object | `false` | 超出省略，基于 antd Typography；`true` 开启省略与 tooltip，`{ showTitle: false }` 关闭 tooltip |
| display | boolean \| function | - | 是否显示该列 |
| emptyIsPlaceholder | boolean | - | 该列空值是否显示占位符 |
| placeholder | string | - | 该列空值占位符 |
| renderPlaceholder | function | - | 自定义空值渲染 |
| type | string | - | 列类型，如 `'options'` 表示操作列 |
| primary | boolean | - | main 类型：是否显示主色样式 |
| hover | boolean | - | main 类型：是否显示悬停样式 |
| onClick | function | - | main 类型：点击回调 `({ item, colItem, event }) => void` |
| split | string | - | list 类型：列表项分隔符，默认 `,` |
| buttonGroup | object | - | options 类型：透传给 `@kne/button-group` 的属性 |

#### rowSelection

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | `'checkbox'` \| `'radio'` | - | 选择类型 |
| selectedRowKeys | array | - | 已选中的行 key 列表 |
| onChange | function | - | 选中变化回调 `(selectedRowKeys, id, { context, checked }) => void` |
| allowSelectedAll | boolean | - | 是否允许全选（仅 checkbox 模式） |
| isSelectedAll | boolean | - | 是否全选状态 |
| onIsSelectAllChange | function | - | 全选状态变化回调 |

#### 静态属性

| 属性 | 类型 | 说明 |
|------|------|------|
| TableView.Header | Component | 表头组件，可单独使用 |
| TableView.useSelectedRow | Hook | 行选择 Hook |
| TableView.useSort | Hook | 排序 Hook |
| TableView.sortDataSource | function | 本地排序工具函数 |

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

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| rowKey | string \| function | `'id'` | 行唯一标识 |
| type | `'checkbox'` \| `'radio'` | `'checkbox'` | 选择类型 |

#### 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| selectedRowKeys | array | 已选行 key 列表 |
| selectedRows | array | 已选行数据 |
| onSelect | function | `(item, checked) => void` |
| onSelectAll | function | `(checked, selected, items) => void` |
| setSelectedRows | function | 直接设置已选行数据 |
| setSelectedRowKeys | function | `(keys, dataSource) => void` |
| clearSelectedRows | function | 清空选择 |
| getRowSelection | function | `(dataSource, extra?) => rowSelection` 生成 `rowSelection` 配置 |

#### 示例

```jsx
const { selectedRowKeys, selectedRows, getRowSelection, clearSelectedRows } = TableView.useSelectedRow({ rowKey: 'id' });

<TableView
  dataSource={dataSource}
  columns={columns}
  rowSelection={getRowSelection(dataSource)}
/>;
```

完整示例见文档 `useSelectedRow`。

### useSort

排序 Hook，配合 `TableView` 的 `sortRender` 实现表头排序。

#### 参数

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| sort | array | - | 受控排序值 `[{ name, sort: 'ASC' \| 'DESC' }]` |
| defaultSort | array | `[]` | 默认排序 |
| onSortChange | function | - | 排序变化回调 `(sort) => void` |

#### 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| sort | array | 当前排序配置 |
| setSort | function | 设置排序 |
| sortRender | function | `({ name, single }) => ReactNode`，传给 TableView 表头 |
| mobileSortToolbar | function | `({ columns }) => ReactNode`，传给 TableView 移动端工具栏右侧 |

#### columns.sort

| 值 | 说明 |
|----|------|
| `true` | 开启排序，默认单列模式 |
| `{ single: true }` | 单列排序，切换列时清除其他列 |
| `{ single: false }` | 多列排序 |

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

| 类型 | 说明 | 默认宽度 |
|------|------|----------|
| `main` | 主信息列，支持 `primary` / `hover` / `onClick`，自动省略 | 300px |
| `amount` | 金额列，右对齐，自动省略 | 140px |
| `options` | 操作列，铺满单元格，配合 `@kne/button-group` | 180px |
| `tag` | 单个 Tag，`getValueOf` 返回 `{ type, text }` | 140px |
| `status` | 状态 Badge，`getValueOf` 返回 `{ type, text }` | 100px |
| `tagList` | 多个 Tag 列表 | 300px |
| `list` | 文本列表，可用 `split` 指定分隔符 | 200px |
| `description` | 长文本描述列，自动省略 | 400px |

#### 尺寸修饰词

可与类型组合，如 `tag-short`、`status-small`、`main-large`：

| 修饰词 | 说明 | 宽度 |
|--------|------|------|
| `short` | 缩短列宽 | 120px |
| `small` | 最小列宽 | 100px |
| `large` | 放大列宽 | 300px |

#### options 列按钮配置

`getValueOf` 返回按钮配置数组，每项支持：

| 属性 | 类型 | 说明 |
|------|------|------|
| children | ReactNode | 按钮文案 |
| onClick | function | 点击回调 |
| isDelete | boolean | 是否为删除操作（弹出确认） |
| message | string | 删除确认文案 |
| hidden | boolean | 是否隐藏 |

完整示例见文档 `renderType`。

### format

通过 `columns.format` 声明式格式化展示值，支持链式组合（空格分隔多个格式化器）。

#### 内置格式化器

| 名称 | 参数 | 说明 | 示例 |
|------|------|------|------|
| `date` | 模板 | 日期格式化 | `format: 'date'` 或 `format: 'date-YYYY/MM/DD'` |
| `datetime` | 模板 | 日期时间格式化 | `format: 'datetime'` |
| `dateRange` | 模板, allow | 日期范围 | `format: 'dateRange-YYYY-MM-DD-allow'` |
| `boolean` | trueValue | 布尔值转是/否 | `format: 'boolean'` |
| `number` | 见下方 | 数字格式化 | `format: 'number-style:decimal-suffix:元'` |
| `money` | 单位 | 金额拼接 | `format: 'money-元'` |

#### number 格式化参数

通过 `calcArgs` 解析，格式为 `number-style:decimal-maximumFractionDigits:0-useGrouping:true-suffix:元`：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| style | string | `'decimal'` | Intl 数字样式 |
| unit | number | `1` | 除数 |
| maximumFractionDigits | number | `2` | 最大小数位 |
| useGrouping | boolean | `true` | 是否使用千分位 |
| roundingMode | string | `'halfExpand'` | 舍入模式 |
| suffix | string | `''` | 后缀 |

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
    orderCard: ({ renderBody }) => (
      <div>
        {renderBody()}
      </div>
    )
  },
  tagTypeColors: {
    custom: '#1890ff'
  },
  statusTypeColors: {
    custom: '#52c41a'
  }
});
```

| 属性 | 类型 | 说明 |
|------|------|------|
| renderType | object | 自定义 renderType 映射 |
| renderTypeSize | object | 覆盖内置类型的 width / min / max |
| renderMobile | object | 注册移动端渲染函数，`renderMobile="name"` 时按名称查找 |
| tagTypeColors | object | Tag 颜色映射 |
| statusTypeColors | object | Status 颜色映射 |

### 列解析工具

| 函数 | 说明 |
|------|------|
| `resolveColumns(columns)` | 批量解析列配置，自动注入 render、width、ellipsis 等 |
| `resolveColumn(column)` | 解析单个列配置 |
| `parseRenderType(renderType)` | 解析 renderType 字符串，返回 `{ type, size }` |
| `resolveRenderType(renderType)` | 解析 renderType 并返回完整维度信息 |
| `getColumnRender(column)` | 获取列的 render 函数 |
| `getRenderTypeNames()` | 获取所有已注册的 renderType 名称 |
| `isOptionsColumn(column)` | 判断是否为操作列 |
| `resolveRenderMobile(renderMobile)` | 解析 renderMobile 配置，string 时从 preset 查找 |
| `isRenderMobileActive(renderMobile, isMobile)` | 判断当前是否应启用移动端专用渲染 |

### 列值计算

| 函数 | 说明 |
|------|------|
| `computeColumnsValue(options)` | 计算列值，处理 format、display、空值等 |
| `computeDisplay(options)` | 根据列值渲染展示内容 |
| `computeColumnsDisplay(options)` | 批量计算并渲染列展示内容 |

`computeColumnsValue` 参数：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| columns | array | - | 列配置 |
| dataSource | object | - | 行数据 |
| context | object | - | 渲染上下文 |
| emptyIsPlaceholder | boolean | - | 空值是否显示占位符 |
| valueIsEmpty | function | - | 空值判断函数 |
| placeholder | string | - | 占位符 |
| removeEmpty | boolean | `true` | 是否过滤 display 为 false 的列 |

### 渲染工具

| 函数 | 说明 |
|------|------|
| `renderCellContent(content, column, className)` | 渲染单元格内容 |
| `getColumnEllipsis(column)` | 获取列的 ellipsis 配置 |
| `wrapColumnHeaderTitle(title)` | 包装表头标题，支持省略 |
| `renderColumnTitle(title, column, sortRender)` | 渲染带排序的表头标题 |
| `getTagColor(type)` | 获取 Tag 颜色 |
| `renderTagItem(value)` | 渲染单个 Tag |
| `renderTagList(value)` | 渲染 Tag 列表 |
| `getStatusType(type)` | 获取 Status 类型 |
| `renderStatusItem(value)` | 渲染 Status |

### 列宽工具

| 函数 | 说明 |
|------|------|
| `parseColumnWidth(width)` | 解析列宽值为数字（px） |
| `getColumnLayout(column, options)` | 获取列布局信息（widthBased、fillRemaining、style） |
| `getGridTemplateColumns(columns, options)` | 生成 CSS Grid 模板列 |
| `hasColumnSpan(column)` | 是否设置了 span |
| `hasColumnWidth(column, columns)` | 是否设置了 width |

### 常量

| 常量 | 说明 |
|------|------|
| `RENDER_TYPE_NAMES` | 所有 renderType 名称数组 |
| `SIZE_NAMES` | 尺寸修饰词数组 `['short', 'small', 'large']` |
