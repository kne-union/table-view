# table-view

### 描述

A React table view component with column rendering, computed columns, formatting and sorting utilities

### 安装

```shell
npm i --save @kne/table-view
```

### 概述

`@kne/table-view` 是一个基于 React 和 Ant Design 的表格视图组件库，提供轻量灵活的 CSS Grid 表格布局，以及列渲染、格式化、排序、行选择等开箱即用的能力。专注于表格视图层与列渲染体系，可单独使用或嵌入业务页面。

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

### 渲染逻辑

#### 桌面端：CSS Grid 表格

`TableView` 默认以 CSS Grid 渲染表头与表体。列配置经 `resolveColumns` 解析后，按 `display !== false` 过滤得到布局列，再计算 `gridTemplateColumns`（支持 `span` 栅格、`width` 固定宽、列宽拖动后的 `colsSize`）。每行数据走统一的单元格渲染管线：

1. **`computeColumnsValue`**：按列取原始值（`getValueOf` 或 `dataSource[name]`），经 `format` 格式化，过滤 `display` 为 false 或空值不展示的行
2. **`computeDisplay`**：空值走 `placeholder` / `renderPlaceholder`；非空值调用列 `render`（见下方优先级）
3. **`renderCellContent`**：按列 `ellipsis` / `cellFullWidth` 包裹 `Ellipsis` 与宽度约束后输出

自定义外层布局时，可通过 `render={({ header, renderBody }) => ...}` 拆分表头与表体；无数据时仍渲染表头并展示 `empty`。

#### 列渲染优先级

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 1 | `column.render` | 自定义函数，**最高优先级**；存在时不再走 `renderType` 内置渲染 |
| 2 | `renderType` | 声明式类型（`main`、`amount`、`tag`、`status`、`tagList`、`list`、`options`、`description` 等），由 `resolveColumn` 注入对应 `render` 与列宽维度 |
| 3 | 原始值 | 无 `render` 且无有效 `renderType` 时，直接展示格式化后的 `value` |

`render` 与 `renderType` 可同时配置：`renderType` 仍负责注入 `width` / `min` / `max` / `ellipsis` 等布局维度，仅单元格内容由 `render` 覆盖。

`renderType` 支持尺寸修饰符组合，如 `enum-small`、`main-large`（`short` / `small` / `large`），维度可通过 `globalParams.renderTypeSize` 全局覆盖。

#### 移动端：`renderMobile`

移动端判断统一使用 `@kne/responsive-utils` 的 `useIsMobile()`（断点 768px）。仅当 `isRenderMobileActive(renderMobile, isMobile)` 为 true 时启用移动端专用渲染，桌面端始终走 Grid 或 `render`。

| `renderMobile` 值 | 行为 |
|-------------------|------|
| `true` | 默认卡片 List（`MobileCardList`）：每行一张卡片，普通列纵向「标题 + 内容」，`options` 操作列固定右侧 |
| `function` | 签名与 `render` 一致 `({ header, renderBody, ...props }) => ReactNode`，**完全接管**移动端渲染，优先级高于 `render`；可调用 `renderBody()` 复用默认卡片 |
| `string` | 从 `preset({ renderMobile: { [name]: fn } })` 按名称查找；找到等同 function，**未注册则视为未开启**，移动端回退普通表格 |
| 未设置 / `false` / 未注册 string | 不开启移动端专用渲染，移动端仍显示 Grid 表格 |

默认卡片 List 细节：

- 普通列与 `options` 列分离：`isOptionsColumn` 识别操作列，字段列在卡片主体纵向排列，操作列在右侧独立区域
- 移动端操作区紧凑展示：`options` 列设置 `mobileOptions` 与 `buttonGroup.showLength: 0`，仅保留「⋯」入口，避免按钮截断
- 支持 `rowSelection`（左侧 checkbox / radio）；`allowSelectedAll` 时列表顶部显示全选
- 卡片 padding 跟随 `size`，复用 `--kne-table-cell-padding` CSS 变量

### 列渲染类型系统

通过 `renderType` 属性，可以用声明式的方式定义列的渲染样式，无需手写 `render` 函数。内置 `main`、`amount`、`tag`、`status`、`tagList`、`list`、`options`、`description` 等类型，并支持与 `short` / `small` / `large` 尺寸修饰组合。

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
- **移动端适配**：`renderMobile` 启用卡片 List，或 CSS Grid 栅格式展示
- **自定义表格渲染**：通过 `render` 属性拆分表头与表体，灵活组合布局
- **列渲染复用**：`renderType` 体系统一 tag、status、amount 等常见列样式


### 示例

#### 示例代码

- TableView
- 表格视图组件，支持行选择、列宽设置、自定义渲染等
- _TableView(@kne/current-lib_table-view)[import * as _TableView from "@kne/table-view"],(@kne/current-lib_table-view/dist/index.css),antd(antd)

```jsx
const { TableView } = _TableView;
const { Flex, Tag, Card, Button } = antd;
const { useState } = React;

const orderStatusMap = {
  已完成: { type: 'success', text: '已完成' },
  处理中: { type: 'processing', text: '处理中' },
  待发货: { type: 'warning', text: '待发货' },
  已取消: { type: 'default', text: '已取消' }
};

const dataSource = [
  {
    id: 'ORD20240115001',
    customerName: '深圳市腾讯计算机系统有限公司',
    contact: '张三',
    phone: '13800138000',
    amount: 42500,
    status: '已完成',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-17'
  },
  {
    id: 'ORD20240115002',
    customerName: '华为技术有限公司',
    contact: '李四',
    phone: '13900149000',
    amount: 85000,
    status: '处理中',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-20'
  },
  {
    id: 'ORD20240115003',
    customerName: '阿里巴巴集团控股有限公司',
    contact: '王五',
    phone: '13700157000',
    amount: 120000,
    status: '待发货',
    orderDate: '2024-01-14',
    deliveryDate: '2024-01-22'
  },
  {
    id: 'ORD20240115004',
    customerName: '北京字节跳动科技有限公司',
    contact: '赵六',
    phone: '13600166000',
    amount: 65000,
    status: '已完成',
    orderDate: '2024-01-13',
    deliveryDate: '2024-01-16'
  },
  {
    id: 'ORD20240115005',
    customerName: '百度在线网络技术（北京）有限公司',
    contact: '钱七',
    phone: '13500175000',
    amount: 95000,
    status: '已取消',
    orderDate: '2024-01-12',
    deliveryDate: ''
  }
];

const columns = [
  { name: 'id', title: '订单编号', width: 180, renderType: 'small' },
  { name: 'customerName', title: '客户名称', span: 10, renderType: 'main' },
  { name: 'contact', title: '联系人', width: 80 },
  { name: 'phone', title: '联系电话', width: '130px', render: value => value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') },
  {
    name: 'amount',
    title: '订单金额(元)',
    renderType: 'amount',
    format: 'number-style:decimal-maximumFractionDigits:0-useGrouping:true-suffix:元'
  },
  { name: 'orderDate', title: '下单日期', format: 'date' },
  { name: 'deliveryDate', title: '预计送达', format: 'date' },
  {
    name: 'status',
    title: '订单状态',
    width: 100,
    renderType: 'status',
    getValueOf: item => orderStatusMap[item.status] || { type: 'default', text: item.status }
  }
];

const WithCheckbox = () => {
  const [selectKeys, setSelectKeys] = useState([]);
  const totalAmount = selectKeys.reduce((sum, id) => sum + (dataSource.find(d => d.id === id)?.amount || 0), 0);
  return (
    <div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <span>
          已选 <strong>{selectKeys.length}</strong> 个订单，总金额 <strong style={{ color: '#52c41a' }}>¥{totalAmount.toLocaleString()}</strong>
        </span>
      </Flex>
      <TableView
        dataSource={dataSource}
        columns={columns}
        rowSelection={{
          type: 'checkbox',
          allowSelectedAll: true,
          selectedRowKeys: selectKeys,
          onChange: setSelectKeys
        }}
      />
    </div>
  );
};

const WithRadio = () => {
  const [selectKeys, setSelectKeys] = useState([]);
  const selectedOrder = dataSource.find(d => d.id === selectKeys[0]);
  const radioColumns = [
    { name: 'id', title: '订单编号', width: 160, renderType: 'small' },
    { name: 'customerName', title: '客户名称', renderType: 'main' },
    {
      name: 'amount',
      title: '订单金额(元)',
      width: 120,
      renderType: 'amount',
      format: 'number-style:decimal-maximumFractionDigits:0-useGrouping:true-suffix:元'
    },
    {
      name: 'status',
      title: '订单状态',
      width: 100,
      renderType: 'status',
      getValueOf: item => orderStatusMap[item.status] || { type: 'default', text: item.status }
    }
  ];
  return (
    <div>
      <div style={{ marginBottom: 8, color: '#666' }}>单选 — 左侧为 Radio 选择列</div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <span>已选订单：{selectedOrder ? &#96;${selectedOrder.id} (${selectedOrder.customerName})&#96; : '无'}</span>
        {selectedOrder && <Tag color="blue">¥{selectedOrder.amount.toLocaleString()}</Tag>}
      </Flex>
      <TableView
        dataSource={dataSource}
        columns={radioColumns}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectKeys,
          onChange: setSelectKeys
        }}
      />
    </div>
  );
};

const WithCustomRender = () => {
  const displayData = dataSource.slice(0, 3);
  const totalAmount = displayData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card
      size="small"
      title="近期订单"
      extra={
        <Button type="link" size="small" onClick={() => console.log('查看全部')}>
          查看全部
        </Button>
      }
      styles={{ body: { padding: 0 } }}
    >
      <Flex
        justify="space-between"
        align="center"
        style={{ padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}
      >
        <Flex gap={8} align="center">
          <Tag color="blue">{displayData.length} 笔</Tag>
          <span style={{ color: 'rgba(0,0,0,0.65)', fontSize: 13 }}>
            合计 <strong style={{ color: '#52c41a' }}>¥{totalAmount.toLocaleString()}</strong>
          </span>
        </Flex>
        <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>render 自定义外层布局</span>
      </Flex>
      <TableView
        dataSource={displayData}
        columns={columns}
        render={({ renderBody }) => (
          <div style={{ overflowX: 'auto' }}>{renderBody(displayData)}</div>
        )}
      />
    </Card>
  );
};

const WithEmpty = () => (
  <TableView
    dataSource={[]}
    columns={columns}
    empty={
      <div style={{ padding: 24, color: '#999' }}>
        暂无订单数据
      </div>
    }
  />
);

const BaseExample = () => {
  return (
    <Flex vertical gap={24}>
      <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px' }}>
        订单列表 - 共 <strong>{dataSource.length}</strong> 个订单
      </div>
      <TableView dataSource={dataSource} columns={columns} />
      <WithCheckbox />
      <WithRadio />
      <WithCustomRender />
      <WithEmpty />
    </Flex>
  );
};

render(<BaseExample />);

```

- renderType
- 列 renderType 配置：main / amount / tag / status / tagList / list / options / description，支持与 short / small / large 尺寸修饰组合
- _TableView(@kne/current-lib_table-view)[import * as _TableView from "@kne/table-view"],(@kne/current-lib_table-view/dist/index.css),antd(antd)

```jsx
const { TableView } = _TableView;
const { Flex } = antd;

const statusMap = {
  待发货: { type: 'warning', text: '待发货' },
  处理中: { type: 'processing', text: '处理中' },
  已完成: { type: 'success', text: '已完成' }
};

const categoryMap = {
  企业客户: { type: 'default', text: '企业客户' },
  战略客户: { type: 'processing', text: '战略客户' }
};

const dataSource = [
  {
    id: 'ORD001',
    customerName: '深圳市腾讯计算机系统有限公司',
    category: '企业客户',
    tags: ['物流', '加急'],
    keywords: ['合同', '附件', '春节前'],
    remark: '客户要求春节前完成交付，需协调物流加急处理，并同步更新合同附件。',
    amount: 42500,
    status: '待发货'
  },
  {
    id: 'ORD002',
    customerName: '华为技术有限公司',
    category: '战略客户',
    tags: ['评审', '配置清单'],
    keywords: ['需求评审', '配置清单'],
    remark: '项目处于需求评审阶段，待客户确认最终配置清单后安排发货。',
    amount: 85000,
    status: '处理中'
  },
  {
    id: 'ORD003',
    customerName: '阿里巴巴集团控股有限公司',
    category: '企业客户',
    tags: ['拣货', '付款完成'],
    keywords: ['付款', '拣货', '发货'],
    remark: '已完成付款，仓库正在拣货，预计两个工作日内发出第一批货物。',
    amount: 120000,
    status: '已完成'
  }
];

const columns = [
  { name: 'id', title: '编号', renderType: 'small' },
  {
    name: 'customerName',
    title: '客户名称',
    renderType: 'main',
    primary: true,
    hover: true,
    onClick: ({ item }) => console.log('查看客户详情:', item)
  },
  {
    name: 'category',
    title: '分类',
    renderType: 'tag-short',
    getValueOf: item => categoryMap[item.category]
  },
  {
    name: 'tags',
    title: '标签',
    renderType: 'tagList',
    getValueOf: item =>
      (item.tags || []).map(text => ({
        type: text === '加急' ? 'error' : 'processing',
        text
      }))
  },
  {
    name: 'keywords',
    title: '关键词',
    renderType: 'list',
    split: '、',
    getValueOf: item => item.keywords
  },
  { name: 'remark', title: '备注', renderType: 'description' },
  {
    name: 'amount',
    title: '金额',
    renderType: 'amount',
    format: 'number-style:decimal-maximumFractionDigits:0-useGrouping:true-suffix:元'
  },
  {
    name: 'status',
    title: '状态',
    renderType: 'status',
    getValueOf: item => statusMap[item.status]
  },
  {
    name: 'options',
    title: '操作',
    renderType: 'options',
    getValueOf: item => {
      const actions = [
        { children: '查看', onClick: () => console.log('查看', item.id) },
        { children: '编辑', onClick: () => console.log('编辑', item.id) }
      ];
      if (item.status !== '已完成') {
        actions.push({
          children: '删除',
          isDelete: true,
          message: &#96;确定删除 ${item.id} 吗？&#96;,
          onClick: () => console.log('删除', item.id)
        });
      }
      return actions;
    }
  }
];

const BaseExample = () => {
  return (
    <Flex vertical gap={24}>
      <div style={{ color: '#666', fontSize: 13, lineHeight: 1.8 }}>
        <p>
          列配置 <code>renderType</code> 声明列的渲染方式，无需手写 <code>render</code>。内置类型：
        </p>
        <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
          <li><code>main</code> — 主信息列，支持 <code>primary</code> / <code>hover</code> / <code>onClick</code></li>
          <li><code>amount</code> — 金额列，右对齐，配合 <code>format</code> 格式化</li>
          <li><code>tag</code> — 单个 Tag，<code>getValueOf</code> 返回 <code>{'{ type, text }'}</code></li>
          <li><code>status</code> — 状态 Badge，<code>getValueOf</code> 返回 <code>{'{ type, text }'}</code></li>
          <li><code>tagList</code> — 多个 Tag 列表</li>
          <li><code>list</code> — 文本列表，可用 <code>split</code> 指定分隔符</li>
          <li><code>options</code> — 操作列，<code>getValueOf</code> 返回按钮配置数组</li>
          <li><code>description</code> — 长文本描述列</li>
        </ul>
        <p>
          可与尺寸修饰词组合：<code>short</code> / <code>small</code> / <code>large</code>（如 <code>tag-short</code>、<code>status-small</code>、<code>main-large</code>）。
          通过 <code>getValueOf</code> 传入 render 所需数据结构，通过 <code>format</code> 做日期、金额等展示格式化。
        </p>
      </div>
      <TableView dataSource={dataSource} columns={columns} />
    </Flex>
  );
};

render(<BaseExample />);

```

- column render
- 列同时配置 render 与 renderType 时，render 优先级最高，覆盖内置 renderType 的单元格渲染
- _TableView(@kne/current-lib_table-view)[import * as _TableView from "@kne/table-view"],(@kne/current-lib_table-view/dist/index.css),antd(antd)

```jsx
const { TableView } = _TableView;
const { Flex, Tag } = antd;

const statusMap = {
  待发货: { type: 'warning', text: '待发货' },
  处理中: { type: 'processing', text: '处理中' },
  已完成: { type: 'success', text: '已完成' }
};

const dataSource = [
  {
    id: 'ORD001',
    customerName: '深圳市腾讯计算机系统有限公司',
    amount: 42500,
    status: '待发货'
  },
  {
    id: 'ORD002',
    customerName: '华为技术有限公司',
    amount: 85000,
    status: '处理中'
  },
  {
    id: 'ORD003',
    customerName: '阿里巴巴集团控股有限公司',
    amount: 120000,
    status: '已完成'
  }
];

const columns = [
  { name: 'id', title: '编号', renderType: 'small' },
  { name: 'customerName', title: '客户名称', renderType: 'main' },
  {
    name: 'amount',
    title: '金额',
    renderType: 'amount',
    format: 'number-style:decimal-maximumFractionDigits:0-useGrouping:true-suffix:元'
  },
  {
    name: 'status',
    title: '状态（仅 renderType）',
    renderType: 'status',
    getValueOf: item => statusMap[item.status]
  },
  {
    name: 'statusRender',
    title: '状态（render 优先）',
    renderType: 'status',
    getValueOf: item => statusMap[item.status],
    render: (value, { dataSource }) => (
      <span style={{ color: '#1677ff' }}>
        自定义渲染：{dataSource.status}（未走 status Badge）
      </span>
    )
  }
];

const BaseExample = () => {
  return (
    <Flex vertical gap={24}>
      <div style={{ color: '#666', fontSize: 13, lineHeight: 1.8 }}>
        <p>
          列同时配置 <code>render</code> 与 <code>renderType</code> 时，
          <Tag color="blue" style={{ margin: '0 4px' }}>render 优先级最高</Tag>
          ，会直接使用自定义 <code>render</code>，不再走内置 renderType。
        </p>
        <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
          <li>「状态（仅 renderType）」列：走内置 <code>status</code>，渲染 Badge</li>
          <li>「状态（render 优先）」列：同样写了 <code>renderType: 'status'</code>，但因存在 <code>render</code>，最终显示自定义内容</li>
          <li>renderType 仍可提供列宽等维度（width / min / max），仅单元格内容渲染被 <code>render</code> 覆盖</li>
        </ul>
      </div>
      <TableView dataSource={dataSource} columns={columns} />
    </Flex>
  );
};

render(<BaseExample />);

```

- renderMobile
- 移动端专用渲染：true 为默认卡片 List；function 完全接管；string 从 preset 按名称查找；支持 mobileSortToolbar 排序工具栏
- _TableView(@kne/current-lib_table-view)[import * as _TableView from "@kne/table-view"],(@kne/current-lib_table-view/dist/index.css),antd(antd)

```jsx
const { TableView, preset } = _TableView;
const { Flex, Tag, Card, Button, Dropdown, Checkbox, Radio } = antd;
const { useState, useMemo } = React;

const statusMap = {
  已完成: { color: 'success', text: '已完成' },
  处理中: { color: 'processing', text: '处理中' },
  待发货: { color: 'warning', text: '待发货' }
};

const dataSource = [
  {
    id: 'ORD001',
    customerName: '深圳市腾讯计算机系统有限公司',
    contact: '张三',
    phone: '13800138000',
    amount: 42500,
    status: '已完成'
  },
  {
    id: 'ORD002',
    customerName: '华为技术有限公司',
    contact: '李四',
    phone: '13900149000',
    amount: 85000,
    status: '处理中'
  },
  {
    id: 'ORD003',
    customerName: '阿里巴巴集团控股有限公司',
    contact: '王五',
    phone: '13700157000',
    amount: 120000,
    status: '待发货'
  }
];

const columns = [
  { name: 'id', title: '订单编号', width: 120, renderType: 'small' },
  { name: 'customerName', title: '客户名称', span: 10, renderType: 'main', sort: true },
  { name: 'contact', title: '联系人', width: 80 },
  { name: 'phone', title: '联系电话', width: 130, render: value => value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') },
  {
    name: 'amount',
    title: '订单金额',
    sort: true,
    renderType: 'amount',
    format: 'number-style:decimal-maximumFractionDigits:0-useGrouping:true-suffix:元'
  },
  {
    name: 'status',
    title: '状态',
    width: 100,
    renderType: 'status',
    getValueOf: item => ({ type: statusMap[item.status]?.color || 'default', text: item.status })
  },
  {
    name: 'options',
    title: '操作',
    renderType: 'options',
    getValueOf: item => [
      { children: '查看', onClick: () => console.log('查看', item.id) },
      { children: '编辑', onClick: () => console.log('编辑', item.id) },
      { children: '删除', isDelete: true, message: &#96;确定删除 ${item.id} 吗？&#96;, onClick: () => console.log('删除', item.id) }
    ]
  }
];

preset({
  renderMobile: {
    orderCard: ({ renderBody, dataSource = [] }) => {
      const totalAmount = dataSource.reduce((sum, item) => sum + item.amount, 0);
      return (
        <div
          className="preset-order-card-example"
          style={{
            borderRadius: 12,
            background: '#f5f7fa',
            padding: 16
          }}
        >
          <style>{&#96;
            .preset-order-card-example .info-page-table-mobile-card:not(.is-mobile-card-selected):not(.is-mobile-card-selected-all) {
              background: linear-gradient(135deg, #ffffff 0%, #f9f0ff 52%, #eef2ff 100%) !important;
              border-color: #e8dfff !important;
            }
            .preset-order-card-example .info-page-table-mobile-card:not(.is-mobile-card-selected):not(.is-mobile-card-selected-all):hover {
              background: linear-gradient(135deg, #fafafa 0%, #f3ebff 52%, #e8eeff 100%) !important;
            }
          &#96;}</style>
          <div style={{ marginBottom: 16 }}>
            <Flex justify="space-between" align="center" gap={8} style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'rgba(0,0,0,0.88)' }}>近期订单</div>
              <Tag color="purple" style={{ margin: 0, flexShrink: 0 }}>
                preset: orderCard
              </Tag>
            </Flex>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
              {dataSource.length} 笔 · 合计 ¥{totalAmount.toLocaleString()}
            </div>
          </div>
          <div
            className="info-page-table"
            style={{
              '--kne-table-cell-padding': '14px 8px'
            }}
          >
            {renderBody()}
          </div>
        </div>
      );
    }
  }
});

const formatPhone = phone => phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');

const getOrderActions = item => [
  { key: 'view', label: '查看', onClick: () => console.log('查看', item.id) },
  { key: 'edit', label: '编辑', onClick: () => console.log('编辑', item.id) },
  { key: 'delete', label: '删除', danger: true, onClick: () => console.log('删除', item.id) }
];

const OrderMobileCard = ({ item, checked, disabled, onCheckChange, selectionType = 'checkbox' }) => {
  const status = statusMap[item.status] || { color: 'default', text: item.status };
  const actionItems = getOrderActions(item);
  const isSelected = checked;
  const SelectionControl = selectionType === 'radio' ? Radio : Checkbox;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        background: isSelected ? 'var(--primary-color-1, #e6f4ff)' : '#fff',
        borderRadius: 12,
        padding: 16,
        border: &#96;1px solid ${isSelected ? 'var(--primary-color-2, var(--primary-color, #1677ff))' : 'transparent'}&#96;,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        color: isSelected ? 'var(--primary-color, #1677ff)' : undefined,
        boxSizing: 'border-box'
      }}
    >
      <SelectionControl checked={checked} disabled={disabled} onChange={onCheckChange} style={{ marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Flex justify="space-between" align="center" gap={8} style={{ marginBottom: 10 }}>
          <Flex align="center" gap={8} wrap="wrap" style={{ flex: 1, minWidth: 0 }}>
            <Tag color={status.color} style={{ margin: 0 }}>
              {status.text}
            </Tag>
            <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{item.id}</span>
          </Flex>
          <Dropdown
            trigger={['click']}
            menu={{
              items: actionItems.map(({ key, label, danger, onClick }) => ({
                key,
                label,
                danger,
                onClick: ({ domEvent }) => {
                  domEvent.stopPropagation();
                  onClick();
                }
              }))
            }}
          >
            <Button type="text" size="small" style={{ padding: '0 4px' }} onClick={e => e.stopPropagation()}>
              ···
            </Button>
          </Dropdown>
        </Flex>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'rgba(0,0,0,0.88)',
            lineHeight: 1.5,
            marginBottom: 6
          }}
        >
          {item.customerName}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)', lineHeight: 1.6 }}>
          {item.contact} · {formatPhone(item.phone)}
        </div>
        <Flex
          justify="space-between"
          align="center"
          gap={12}
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid #f0f0f0'
          }}
        >
          <Flex align="baseline" gap={6} style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', flexShrink: 0 }}>订单金额</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1677ff' }}>¥{item.amount.toLocaleString()}</span>
          </Flex>
          <Flex gap={4} align="center" style={{ flexShrink: 0 }}>
            {actionItems.slice(0, 2).map(({ key, label, onClick }) => (
              <Button
                key={key}
                type="link"
                size="small"
                style={{ padding: '0 4px', height: 'auto' }}
                onClick={e => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                {label}
              </Button>
            ))}
          </Flex>
        </Flex>
      </div>
    </div>
  );
};

const DefaultMobileCards = () => {
  const [selectKeys, setSelectKeys] = useState([]);
  const totalAmount = selectKeys.reduce((sum, id) => sum + (dataSource.find(d => d.id === id)?.amount || 0), 0);
  return (
    <div>
      <div style={{ marginBottom: 12, color: '#666', fontSize: 13, lineHeight: 1.7 }}>
        <code>renderMobile={'{true}'}</code>：移动端启用默认卡片 List（每行一张卡片，操作列靠右）；
        开启 <code>allowSelectedAll</code> 后顶部工具栏左侧显示全选。请用示例预览的手机模式查看效果。
      </div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <span>
          已选 <strong>{selectKeys.length}</strong> 个订单，总金额 <strong style={{ color: '#52c41a' }}>¥{totalAmount.toLocaleString()}</strong>
        </span>
      </Flex>
      <TableView
        dataSource={dataSource}
        columns={columns}
        size="large"
        renderMobile
        rowSelection={{
          type: 'checkbox',
          allowSelectedAll: true,
          selectedRowKeys: selectKeys,
          onChange: keys => setSelectKeys(keys)
        }}
      />
    </div>
  );
};

const SortState = ({ sort }) => (
  <div style={{ marginBottom: 12, padding: '10px 12px', background: '#f5f5f5', borderRadius: 8, fontSize: 13 }}>
    当前排序：
    {sort.length ? (
      <span>
        {sort.map(item => (
          <Tag key={item.name} color="blue" style={{ marginLeft: 8 }}>
            {item.name} {item.sort}
          </Tag>
        ))}
      </span>
    ) : (
      <span style={{ marginLeft: 8, color: '#999' }}>无</span>
    )}
  </div>
);

const MobileSortExample = () => {
  const { sort, sortRender, mobileSortToolbar } = TableView.useSort({
    defaultSort: [{ name: 'amount', sort: 'DESC' }],
    onSortChange: value => console.log('移动端排序变更:', value)
  });
  const sortedData = useMemo(() => TableView.sortDataSource(dataSource, sort, columns), [sort]);

  return (
    <Flex vertical gap={24}>
      <div>
        <div style={{ marginBottom: 12, color: '#666', fontSize: 13, lineHeight: 1.7 }}>
          移动端排序：列配置 <code>sort: true</code>，配合 <code>TableView.useSort</code> 传入 <code>mobileSortToolbar</code>。
          工具栏居右，下拉选择排序列，方向为单图标，点击按「降序 → 升序 → 取消」循环（与 PC 端列头排序一致）；也可在下拉选「取消排序」清除。数据需自行用 <code>sortDataSource</code> 排序。
        </div>
        <SortState sort={sort} />
        <TableView
          dataSource={sortedData}
          columns={columns}
          size="large"
          renderMobile
          sortRender={sortRender}
          mobileSortToolbar={mobileSortToolbar}
        />
      </div>
      <div>
        <div style={{ marginBottom: 12, color: '#666', fontSize: 13, lineHeight: 1.7 }}>
          排序与全选同时开启：工具栏左侧全选、右侧排序。
        </div>
        <MobileSortWithSelectAll />
      </div>
    </Flex>
  );
};

const MobileSortWithSelectAll = () => {
  const [selectKeys, setSelectKeys] = useState([]);
  const { sort, sortRender, mobileSortToolbar } = TableView.useSort({});
  const sortedData = useMemo(() => TableView.sortDataSource(dataSource, sort, columns), [sort]);

  return (
    <TableView
      dataSource={sortedData}
      columns={columns}
      size="large"
      renderMobile
      sortRender={sortRender}
      mobileSortToolbar={mobileSortToolbar}
      rowSelection={{
        type: 'checkbox',
        allowSelectedAll: true,
        selectedRowKeys: selectKeys,
        onChange: keys => setSelectKeys(keys)
      }}
    />
  );
};

const CustomMobileRender = () => {
  const [selectKeys, setSelectKeys] = useState([]);
  const { sort, sortRender, mobileSortToolbar } = TableView.useSort({});
  const sortedData = useMemo(() => TableView.sortDataSource(dataSource, sort, columns), [sort]);
  const totalAmount = dataSource.reduce((sum, item) => sum + item.amount, 0);
  const selectedAmount = selectKeys.reduce((sum, id) => sum + (dataSource.find(d => d.id === id)?.amount || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: 12, color: '#666', fontSize: 13, lineHeight: 1.7 }}>
        <code>renderMobile</code> 为 function 时完全接管渲染，可自定义卡片内容；
        全选 / 排序请用回调里的 <code>renderToolbar()</code>（与默认 MobileCard 同一套实现），
        行勾选用 <code>getSelectionProps(item)</code>，不必自己维护全选状态或排序 UI。
        桌面端仍走 <code>render</code>。
      </div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <span>
          已选 <strong>{selectKeys.length}</strong> 个订单，金额 <strong style={{ color: '#52c41a' }}>¥{selectedAmount.toLocaleString()}</strong>
        </span>
      </Flex>
      <Card size="small" title="近期订单" extra={<Tag>桌面 render</Tag>} styles={{ body: { padding: 0 } }}>
        <Flex
          justify="space-between"
          align="center"
          style={{ padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}
        >
          <Flex gap={8} align="center">
            <Tag color="blue">{dataSource.length} 笔</Tag>
            <span style={{ color: 'rgba(0,0,0,0.65)', fontSize: 13 }}>
              合计 <strong style={{ color: '#52c41a' }}>¥{totalAmount.toLocaleString()}</strong>
            </span>
          </Flex>
          <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>桌面端 render 自定义外层</span>
        </Flex>
        <TableView
          dataSource={sortedData}
          columns={columns}
          sortRender={sortRender}
          mobileSortToolbar={mobileSortToolbar}
          rowSelection={{
            type: 'checkbox',
            allowSelectedAll: true,
            selectedRowKeys: selectKeys,
            onChange: keys => setSelectKeys(keys)
          }}
          render={({ renderBody }) => <div style={{ overflowX: 'auto' }}>{renderBody()}</div>}
          renderMobile={({ dataSource: mobileList = [], renderToolbar, getSelectionProps, getRowKey }) => (
            <div
              style={{
                borderRadius: 12,
                background: '#f5f7fa',
                padding: 16
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <Flex justify="space-between" align="center" gap={8} style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 17, fontWeight: 600, color: 'rgba(0,0,0,0.88)' }}>近期订单</div>
                  <Tag color="processing" style={{ margin: 0, flexShrink: 0 }}>
                    renderMobile
                  </Tag>
                </Flex>
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                  {mobileList.length} 笔 · 合计 ¥{mobileList.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                </div>
              </div>
              {renderToolbar()}
              <Flex vertical gap={12} style={{ marginTop: 12 }}>
                {mobileList.map(item => {
                  const selection = getSelectionProps(item);
                  return (
                    <OrderMobileCard
                      key={getRowKey(item)}
                      item={item}
                      checked={selection.checked}
                      disabled={selection.disabled}
                      onCheckChange={selection.onChange}
                    />
                  );
                })}
              </Flex>
            </div>
          )}
        />
      </Card>
    </div>
  );
};

const CustomMobileRadioRender = () => {
  const [selectKeys, setSelectKeys] = useState([]);
  const { sort, sortRender, mobileSortToolbar } = TableView.useSort({});
  const sortedData = useMemo(() => TableView.sortDataSource(dataSource, sort, columns), [sort]);
  const selectedOrder = dataSource.find(item => item.id === selectKeys[0]);

  return (
    <div>
      <div style={{ marginBottom: 12, color: '#666', fontSize: 13, lineHeight: 1.7 }}>
        自定义 <code>renderMobile</code> 单选：<code>rowSelection.type</code> 设为 <code>radio</code>，
        卡片上的 Radio 直接绑 <code>getSelectionProps(item)</code>，选中态与切换逻辑由 TableView 管理；
        工具栏 <code>renderToolbar()</code> 此时仅显示排序（单选无全选）。
      </div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <span>
          当前选中：
          {selectedOrder ? (
            <strong>
              {selectedOrder.id} · ¥{selectedOrder.amount.toLocaleString()}
            </strong>
          ) : (
            <span style={{ color: '#999' }}>未选择</span>
          )}
        </span>
      </Flex>
      <TableView
        dataSource={sortedData}
        columns={columns}
        sortRender={sortRender}
        mobileSortToolbar={mobileSortToolbar}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectKeys,
          onChange: keys => setSelectKeys(keys)
        }}
        renderMobile={({ dataSource: mobileList = [], renderToolbar, getSelectionProps, getRowKey }) => (
          <div
            style={{
              borderRadius: 12,
              background: '#f5f7fa',
              padding: 16
            }}
          >
            {renderToolbar()}
            <Flex vertical gap={12} style={{ marginTop: 12 }}>
              {mobileList.map(item => {
                const selection = getSelectionProps(item);
                return (
                  <OrderMobileCard
                    key={getRowKey(item)}
                    item={item}
                    selectionType="radio"
                    checked={selection.checked}
                    disabled={selection.disabled}
                    onCheckChange={selection.onChange}
                  />
                );
              })}
            </Flex>
          </div>
        )}
      />
    </div>
  );
};

const PresetStringRender = () => {
  const [selectKeys, setSelectKeys] = useState([]);
  const { sort, sortRender, mobileSortToolbar } = TableView.useSort({
    defaultSort: [{ name: 'amount', sort: 'DESC' }]
  });
  const sortedData = useMemo(() => TableView.sortDataSource(dataSource, sort, columns), [sort]);

  return (
    <Flex vertical gap={24}>
      <div>
        <div style={{ marginBottom: 12, color: '#666', fontSize: 13, lineHeight: 1.7 }}>
          <code>renderMobile="orderCard"</code>：通过 <code>preset({'{ renderMobile }'})</code> 注册名称对应的渲染函数；
          仅移动端生效，支持全选与选中样式。可配合 <code>mobileSortToolbar</code> 开启排序。
        </div>
        <TableView
          dataSource={sortedData}
          columns={columns}
          size="large"
          renderMobile="orderCard"
          sortRender={sortRender}
          mobileSortToolbar={mobileSortToolbar}
          rowSelection={{
            type: 'checkbox',
            allowSelectedAll: true,
            selectedRowKeys: selectKeys,
            onChange: keys => setSelectKeys(keys)
          }}
        />
      </div>
      <div>
        <div style={{ marginBottom: 12, color: '#666', fontSize: 13, lineHeight: 1.7 }}>
          <code>renderMobile="notRegistered"</code>：preset 中未注册时视为未开启，移动端仍显示普通表格。
        </div>
        <TableView dataSource={dataSource} columns={columns} renderMobile="notRegistered" />
      </div>
    </Flex>
  );
};

const BaseExample = () => {
  return (
    <Flex vertical gap={32}>
      <DefaultMobileCards />
      <MobileSortExample />
      <CustomMobileRender />
      <CustomMobileRadioRender />
      <PresetStringRender />
    </Flex>
  );
};

render(<BaseExample />);

```

- useSelectedRow
- 行选择 Hook，配合 TableView 实现多选、全选、批量操作与单选
- _TableView(@kne/current-lib_table-view)[import * as _TableView from "@kne/table-view"],(@kne/current-lib_table-view/dist/index.css),antd(antd)

```jsx
const { TableView } = _TableView;
const { Button, Flex, Space, message } = antd;

const orderStatusMap = {
  已完成: { type: 'success', text: '已完成' },
  处理中: { type: 'processing', text: '处理中' },
  待发货: { type: 'warning', text: '待发货' },
  已取消: { type: 'default', text: '已取消' }
};

const dataSource = [
  {
    id: 'ORD20240115001',
    customerName: '深圳市腾讯计算机系统有限公司',
    contact: '张三',
    amount: 42500,
    status: '待发货',
    orderDate: '2024-01-15'
  },
  {
    id: 'ORD20240115002',
    customerName: '华为技术有限公司',
    contact: '李四',
    amount: 85000,
    status: '处理中',
    orderDate: '2024-01-15'
  },
  {
    id: 'ORD20240115003',
    customerName: '阿里巴巴集团控股有限公司',
    contact: '王五',
    amount: 120000,
    status: '待发货',
    orderDate: '2024-01-14'
  },
  {
    id: 'ORD20240115004',
    customerName: '北京字节跳动科技有限公司',
    contact: '赵六',
    amount: 65000,
    status: '已完成',
    orderDate: '2024-01-13'
  },
  {
    id: 'ORD20240115005',
    customerName: '百度在线网络技术（北京）有限公司',
    contact: '钱七',
    amount: 95000,
    status: '已取消',
    orderDate: '2024-01-12'
  }
];

const columns = [
  { name: 'id', title: '订单编号', width: 180, renderType: 'small' },
  { name: 'customerName', title: '客户名称', width: 220, renderType: 'main' },
  { name: 'contact', title: '联系人', width: 100 },
  {
    name: 'amount',
    title: '订单金额(元)',
    width: 130,
    renderType: 'amount',
    format: 'number-style:decimal-maximumFractionDigits:0-useGrouping:true-suffix:元'
  },
  { name: 'orderDate', title: '下单日期', width: 120, format: 'date' },
  {
    name: 'status',
    title: '订单状态',
    width: 100,
    renderType: 'status',
    getValueOf: item => orderStatusMap[item.status] || { type: 'default', text: item.status }
  }
];

const BatchToolbar = ({ selectedRowKeys, selectedRows, clearSelectedRows, onBatchShip, onBatchExport }) => {
  const totalAmount = selectedRows.reduce((sum, item) => sum + (item.amount || 0), 0);
  return (
    <Flex justify="space-between" align="center" style={{ marginBottom: 12, padding: '12px', background: '#f5f5f5', borderRadius: 8 }}>
      <Space>
        <span>
          已选 <strong>{selectedRowKeys.length}</strong> 个订单，总金额 <strong style={{ color: '#52c41a' }}>¥{totalAmount.toLocaleString()}</strong>
        </span>
        <Button type="primary" size="small" disabled={!selectedRowKeys.length} onClick={onBatchShip}>
          批量发货
        </Button>
        <Button size="small" disabled={!selectedRowKeys.length} onClick={onBatchExport}>
          批量导出
        </Button>
        <Button size="small" disabled={!selectedRowKeys.length} onClick={clearSelectedRows}>
          清空选择
        </Button>
      </Space>
    </Flex>
  );
};

const CheckboxExample = () => {
  const { selectedRowKeys, selectedRows, getRowSelection, clearSelectedRows } = TableView.useSelectedRow({ rowKey: 'id' });

  return (
    <div>
      <div style={{ marginBottom: 8, color: '#666' }}>多选模式 useSelectedRow + getRowSelection</div>
      <BatchToolbar
        selectedRowKeys={selectedRowKeys}
        selectedRows={selectedRows}
        clearSelectedRows={clearSelectedRows}
        onBatchShip={() => {
          message.success(&#96;已批量发货 ${selectedRowKeys.length} 个订单&#96;);
          clearSelectedRows();
        }}
        onBatchExport={() => message.info(&#96;正在导出 ${selectedRowKeys.length} 个订单&#96;)}
      />
      <TableView dataSource={dataSource} columns={columns} rowSelection={getRowSelection(dataSource)} />
    </div>
  );
};

const radioColumns = [
  { name: 'id', title: '订单编号', width: 160, renderType: 'small' },
  { name: 'customerName', title: '客户名称', renderType: 'main' },
  {
    name: 'amount',
    title: '订单金额(元)',
    width: 120,
    renderType: 'amount',
    format: 'number-style:decimal-maximumFractionDigits:0-useGrouping:true-suffix:元'
  },
  {
    name: 'status',
    title: '订单状态',
    width: 100,
    renderType: 'status',
    getValueOf: item => orderStatusMap[item.status] || { type: 'default', text: item.status }
  }
];

const RadioExample = () => {
  const { selectedRowKeys, selectedRows, getRowSelection } = TableView.useSelectedRow({ rowKey: 'id', type: 'radio' });
  const selectedOrder = selectedRows[0];

  return (
    <div>
      <div style={{ marginBottom: 8, color: '#666' }}>
        单选模式 <code>type: &apos;radio&apos;</code> — 选择列在表格最左侧
      </div>
      <div style={{ marginBottom: 12, padding: '12px', background: '#f5f5f5', borderRadius: 8 }}>
        当前选中：{selectedOrder ? &#96;${selectedOrder.id}（${selectedOrder.customerName}）&#96; : '无'}
      </div>
      <TableView dataSource={dataSource} columns={radioColumns} rowSelection={getRowSelection(dataSource)} />
    </div>
  );
};

const BaseExample = () => {
  return (
    <Flex vertical gap={24}>
      <CheckboxExample />
      <RadioExample />
    </Flex>
  );
};

render(<BaseExample />);

```

- useSort
- 排序 Hook，配合 TableView 实现表头排序、单列/多列排序与 sortDataSource 本地排序
- _TableView(@kne/current-lib_table-view)[import * as _TableView from "@kne/table-view"],(@kne/current-lib_table-view/dist/index.css),antd(antd)

```jsx
const { TableView } = _TableView;
const { Flex, Tag } = antd;
const { useMemo } = React;

const orderStatusMap = {
  已完成: { type: 'success', text: '已完成' },
  处理中: { type: 'processing', text: '处理中' },
  待发货: { type: 'warning', text: '待发货' },
  已取消: { type: 'default', text: '已取消' }
};

const dataSource = [
  { id: 'ORD001', customerName: '深圳市腾讯计算机系统有限公司', amount: 42500, status: '已完成', orderDate: '2024-01-15' },
  { id: 'ORD002', customerName: '华为技术有限公司', amount: 85000, status: '处理中', orderDate: '2024-01-14' },
  { id: 'ORD003', customerName: '阿里巴巴集团控股有限公司', amount: 120000, status: '待发货', orderDate: '2024-01-16' },
  { id: 'ORD004', customerName: '北京字节跳动科技有限公司', amount: 65000, status: '已完成', orderDate: '2024-01-13' },
  { id: 'ORD005', customerName: '百度在线网络技术（北京）有限公司', amount: 95000, status: '已取消', orderDate: '2024-01-12' }
];

const columns = [
  { name: 'id', title: '订单编号', width: 140, sort: { single: true }, renderType: 'small' },
  { name: 'customerName', title: '客户名称', width: 240, sort: true, renderType: 'main' },
  {
    name: 'amount',
    title: '订单金额(元)',
    width: 130,
    sort: true,
    renderType: 'amount',
    format: 'number-style:decimal-maximumFractionDigits:0-useGrouping:true-suffix:元'
  },
  { name: 'orderDate', title: '下单日期', width: 120, sort: true, format: 'date' },
  {
    name: 'status',
    title: '订单状态',
    width: 100,
    renderType: 'status',
    getValueOf: item => orderStatusMap[item.status] || { type: 'default', text: item.status }
  }
];

const SortState = ({ sort }) => (
  <div style={{ marginBottom: 12, padding: '12px', background: '#f5f5f5', borderRadius: 8 }}>
    当前排序：
    {sort.length ? (
      <span>
        {sort.map(item => (
          <Tag key={item.name} color="blue" style={{ marginLeft: 8 }}>
            {item.name} {item.sort}
          </Tag>
        ))}
      </span>
    ) : (
      <span style={{ marginLeft: 8, color: '#999' }}>无</span>
    )}
  </div>
);

const SingleSortExample = () => {
  const { sort, sortRender, mobileSortToolbar } = TableView.useSort({
    onSortChange: value => console.log('单列排序变更:', value)
  });
  const sortedData = useMemo(() => TableView.sortDataSource(dataSource, sort, columns), [sort]);

  return (
    <div>
      <div style={{ marginBottom: 8, color: '#666' }}>单列排序（订单编号 sort: {'{ single: true }'}）</div>
      <SortState sort={sort} />
      <TableView dataSource={sortedData} columns={columns} sortRender={sortRender} mobileSortToolbar={mobileSortToolbar} renderMobile />
    </div>
  );
};

const MultiSortExample = () => {
  const { sort, sortRender, mobileSortToolbar } = TableView.useSort({
    defaultSort: [{ name: 'orderDate', sort: 'DESC' }],
    onSortChange: value => console.log('多列排序变更:', value)
  });
  const sortedData = useMemo(() => TableView.sortDataSource(dataSource, sort, columns), [sort]);

  return (
    <div>
      <div style={{ marginBottom: 8, color: '#666' }}>多列排序（默认按下单日期降序，金额/日期支持多列排序）</div>
      <SortState sort={sort} />
      <TableView dataSource={sortedData} columns={columns} sortRender={sortRender} mobileSortToolbar={mobileSortToolbar} renderMobile />
    </div>
  );
};

const BaseExample = () => {
  return (
    <Flex vertical gap={24}>
      <div style={{ color: '#666', fontSize: 13 }}>
        列配置 <code>sort: true</code> 开启排序，<code>sort: {'{ single: true }'}</code> 为单列排序。点击表头三角切换 DESC → ASC → 取消。
      </div>
      <SingleSortExample />
      <MultiSortExample />
    </Flex>
  );
};

render(<BaseExample />);

```

- column ellipsis
- 表头 title 超出列宽自动省略、悬停 tooltip；单元格 ellipsis 配置基于 antd Typography 实现内容省略
- _TableView(@kne/current-lib_table-view)[import * as _TableView from "@kne/table-view"],(@kne/current-lib_table-view/dist/index.css),antd(antd)

```jsx
const { TableView } = _TableView;
const { Flex, Tag } = antd;
const { useMemo } = React;

const orderStatusMap = {
  已完成: { type: 'success', text: '已完成' },
  处理中: { type: 'processing', text: '处理中' },
  待发货: { type: 'warning', text: '待发货' }
};

const dataSource = [
  {
    id: 'ORD001',
    customerName: '深圳市腾讯计算机系统有限公司深圳总部研发中心',
    remark: '客户要求春节前完成交付，需协调物流加急处理，并同步更新合同附件与验收标准说明文档。',
    amount: 42500,
    status: '待发货'
  },
  {
    id: 'ORD002',
    customerName: '华为技术有限公司坂田基地采购中心',
    remark: '项目处于需求评审阶段，待客户确认最终配置清单后安排发货。',
    amount: 85000,
    status: '处理中'
  },
  {
    id: 'ORD003',
    customerName: '阿里巴巴集团控股有限公司滨江园区',
    remark: '已完成付款，仓库正在拣货，预计两个工作日内发出第一批货物。',
    amount: 120000,
    status: '待发货'
  }
];

const columns = [
  { name: 'id', title: '订单编号（系统流水号）', width: 110, renderType: 'small' },
  {
    name: 'customerName',
    title: '客户名称（签约主体全称）',
    width: 140,
    renderType: 'main',
    ellipsis: true
  },
  {
    name: 'remark',
    title: '备注说明（内部流转备注）',
    width: 160,
    renderType: 'description',
    ellipsis: { showTitle: true }
  },
  {
    name: 'amount',
    title: '订单应付金额（含税，单位：元）',
    width: 120,
    sort: true,
    renderType: 'amount',
    format: 'number-style:decimal-maximumFractionDigits:0-useGrouping:true-suffix:元'
  },
  {
    name: 'status',
    title: '订单履约状态（业务状态）',
    width: 100,
    renderType: 'status',
    getValueOf: item => orderStatusMap[item.status] || { type: 'default', text: item.status }
  }
];

const TIP_TAG_STYLE = { marginRight: 8 };

const Tips = () => (
  <div style={{ color: '#666', fontSize: 13, lineHeight: 1.8 }}>
    <div>
      <Tag style={TIP_TAG_STYLE} color="blue">表头省略</Tag>
      列 <code>title</code> 超出列宽时自动单行省略，悬停 tooltip 显示完整标题；带排序的列同样生效，无需额外配置。
    </div>
    <div>
      <Tag style={TIP_TAG_STYLE} color="green">单元格省略</Tag>
      列配置 <code>ellipsis: true</code> 或 <code>ellipsis: {'{ showTitle: true }'}</code>，单元格内容超出时省略，悬停显示完整内容（基于 antd Typography）。
    </div>
    <div style={{ color: '#999' }}>
      本示例刻意使用较长表头与较窄列宽，便于观察省略与 tooltip 效果；可将鼠标悬停在表头或单元格上查看。
    </div>
  </div>
);

const BaseExample = () => {
  const { sort, sortRender } = TableView.useSort({});
  const sortedData = useMemo(() => TableView.sortDataSource(dataSource, sort, columns), [sort]);

  return (
    <Flex vertical gap={24}>
      <Tips />
      <TableView dataSource={sortedData} columns={columns} sortRender={sortRender} />
    </Flex>
  );
};

render(<BaseExample />);

```

- size
- 单元格 padding 尺寸：默认 8px，small 为 4px，large 为 14px 8px；支持 CSS 变量 --kne-table-cell-padding-* 覆盖
- _TableView(@kne/current-lib_table-view)[import * as _TableView from "@kne/table-view"],(@kne/current-lib_table-view/dist/index.css),antd(antd)

```jsx
const { TableView } = _TableView;
const { Flex, Radio } = antd;
const { useState } = React;

const dataSource = [
  {
    id: 'ORD001',
    customerName: '深圳市腾讯计算机系统有限公司',
    contact: '张三',
    amount: 42500,
    status: '已完成'
  },
  {
    id: 'ORD002',
    customerName: '华为技术有限公司',
    contact: '李四',
    amount: 85000,
    status: '处理中'
  },
  {
    id: 'ORD003',
    customerName: '阿里巴巴集团控股有限公司',
    contact: '王五',
    amount: 120000,
    status: '待发货'
  }
];

const columns = [
  { name: 'id', title: '订单编号', width: 120, renderType: 'small' },
  { name: 'customerName', title: '客户名称', span: 10, renderType: 'main' },
  { name: 'contact', title: '联系人', width: 80 },
  {
    name: 'amount',
    title: '订单金额',
    width: 120,
    renderType: 'amount',
    format: 'number-style:decimal-maximumFractionDigits:0-useGrouping:true-suffix:元'
  },
  { name: 'status', title: '状态', width: 100 }
];

const SizeDemo = ({ title, description, size }) => (
  <div>
    <div style={{ marginBottom: 8 }}>
      <strong>{title}</strong>
      <span style={{ marginLeft: 8, color: '#666', fontSize: 13 }}>{description}</span>
    </div>
    <TableView dataSource={dataSource} columns={columns} size={size} />
  </div>
);

const InteractiveSize = () => {
  const [size, setSize] = useState('default');
  return (
    <div>
      <Flex align="center" gap={12} style={{ marginBottom: 12 }}>
        <strong>切换 size</strong>
        <Radio.Group
          optionType="button"
          value={size}
          onChange={e => setSize(e.target.value)}
          options={[
            { label: 'default (8px)', value: 'default' },
            { label: 'small (4px)', value: 'small' },
            { label: 'large (14px 8px)', value: 'large' }
          ]}
        />
      </Flex>
      <TableView dataSource={dataSource} columns={columns} size={size === 'default' ? undefined : size} />
    </div>
  );
};

const BaseExample = () => {
  return (
    <Flex vertical gap={24}>
      <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: 8, fontSize: 13 }}>
        <div>
          <code>size</code> 控制单元格 padding：默认 <code>8px</code>，<code>small</code> 为 <code>4px</code>，
          <code>large</code> 为 <code>14px 8px</code>
        </div>
        <div style={{ marginTop: 4, color: '#666' }}>
          可通过 CSS 变量覆盖：
          <code>--kne-table-cell-padding-default</code> /
          <code>--kne-table-cell-padding-small</code> /
          <code>--kne-table-cell-padding-large</code>，或直接设
          <code>--kne-table-cell-padding</code>
        </div>
      </div>

      <InteractiveSize />

      <SizeDemo title="default" description="padding: 8px" />
      <SizeDemo title='size="small"' description="padding: 4px" size="small" />
      <SizeDemo title='size="large"' description="padding: 14px 8px" size="large" />

      <div>
        <div style={{ marginBottom: 8 }}>
          <strong>CSS 变量覆盖</strong>
          <span style={{ marginLeft: 8, color: '#666', fontSize: 13 }}>
            --kne-table-cell-padding-default: 12px 16px
          </span>
        </div>
        <div style={{ '--kne-table-cell-padding-default': '12px 16px' }}>
          <TableView dataSource={dataSource} columns={columns} />
        </div>
      </div>
    </Flex>
  );
};

render(<BaseExample />);

```

### API

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
- 支持 `rowSelection`（左侧 checkbox / radio）；开启 `allowSelectedAll` 或排序（传入 `mobileSortToolbar`）时，卡片列表顶部显示工具栏：**全选居左**、**排序居右**（下拉选择排序列，方向为单图标，点击按「降序 → 升序 → 取消」循环，与 PC 端列头排序一致；也可在下拉选「取消排序」清除）
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
