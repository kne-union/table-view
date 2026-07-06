# table-view

### 描述

A React table view component with column rendering, computed columns, formatting and sorting utilities

### 安装

```shell
npm i --save @kne/table-view
```

### 概述

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
- **移动端适配**：栅格式布局更适合窄屏展示
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
  const { sort, sortRender } = TableView.useSort({
    onSortChange: value => console.log('单列排序变更:', value)
  });
  const sortedData = useMemo(() => TableView.sortDataSource(dataSource, sort, columns), [sort]);

  return (
    <div>
      <div style={{ marginBottom: 8, color: '#666' }}>单列排序（订单编号 sort: {'{ single: true }'}）</div>
      <SortState sort={sort} />
      <TableView dataSource={sortedData} columns={columns} sortRender={sortRender} />
    </div>
  );
};

const MultiSortExample = () => {
  const { sort, sortRender } = TableView.useSort({
    defaultSort: [{ name: 'orderDate', sort: 'DESC' }],
    onSortChange: value => console.log('多列排序变更:', value)
  });
  const sortedData = useMemo(() => TableView.sortDataSource(dataSource, sort, columns), [sort]);

  return (
    <div>
      <div style={{ marginBottom: 8, color: '#666' }}>多列排序（默认按下单日期降序，金额/日期支持多列排序）</div>
      <SortState sort={sort} />
      <TableView dataSource={sortedData} columns={columns} sortRender={sortRender} />
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
| render | function | - | 自定义渲染 `({ header, renderBody, ...others }) => ReactNode`，可拆分表头与表体 |
| sortRender | function | - | 排序按钮渲染，由 `useSort` 提供 |
| context | object | - | 列渲染上下文，会传入 `render`、`getValueOf` 等回调 |
| className | string | - | 自定义类名 |

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
| render | function | - | 自定义单元格渲染 `(value, { column, dataSource, context }) => ReactNode` |
| renderType | string | - | 声明式列渲染类型，见下方 renderType 说明 |
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
| sortRender | function | `({ name, single }) => ReactNode`，传给 TableView |

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
const { sort, sortRender } = TableView.useSort({ onSortChange: console.log });
const sortedData = useMemo(() => TableView.sortDataSource(dataSource, sort, columns), [sort, dataSource]);

<TableView dataSource={sortedData} columns={columns} sortRender={sortRender} />;
```

完整示例见文档 `useSort`。

### renderType

通过 `columns.renderType` 声明列的渲染方式，无需手写 `render`。可与尺寸修饰词组合。

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
