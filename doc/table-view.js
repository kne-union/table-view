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
        <span>已选订单：{selectedOrder ? `${selectedOrder.id} (${selectedOrder.customerName})` : '无'}</span>
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
