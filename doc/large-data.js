const { Table, resolveColumns } = _TableView;
const { Flex, Segmented, Button, Skeleton, Space } = antd;
const { useState, useEffect, useRef } = React;

const companies = ['深圳市腾讯计算机系统有限公司', '华为技术有限公司', '阿里巴巴集团控股有限公司', '北京字节跳动科技有限公司', '百度在线网络技术（北京）有限公司', '网易（杭州）网络有限公司', '小米科技有限责任公司', '京东世纪贸易有限公司'];
const contacts = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
const statusList = ['待发货', '处理中', '已完成', '已取消'];
const statusMap = {
  待发货: { type: 'warning', text: '待发货' },
  处理中: { type: 'processing', text: '处理中' },
  已完成: { type: 'success', text: '已完成' },
  已取消: { type: 'default', text: '已取消' }
};
const tagPool = ['加急', '物流', '评审', '大客户', '续约', '分期'];
const remarks = ['客户要求春节前完成交付，需协调物流加急处理，并同步更新合同附件。', '项目处于需求评审阶段，待客户确认最终配置清单后安排发货。', '已完成付款，仓库正在拣货，预计两个工作日内发出第一批货物。'];

const createOrders = count =>
  Array.from({ length: count }, (_, index) => {
    const status = statusList[index % statusList.length];
    const day = String((index % 28) + 1).padStart(2, '0');
    return {
      id: `ORD2024${String(index + 1).padStart(6, '0')}`,
      customerName: companies[index % companies.length],
      contact: contacts[index % contacts.length],
      phone: `13${String(800138000 + index * 7919).slice(0, 9)}`,
      amount: 10000 + ((index * 3779) % 190000),
      status,
      tags: [tagPool[index % tagPool.length], tagPool[(index + 2) % tagPool.length]],
      remark: remarks[index % remarks.length],
      orderDate: `2024-01-${day}`,
      deliveryDate: status === '已取消' ? '' : `2024-02-${day}`,
      disabled: status === '已取消'
    };
  });

// 列定义放在组件外保持引用稳定，表格才能复用单元格渲染结果
const columns = [
  { name: 'id', title: '订单编号', width: 170, renderType: 'small' },
  { name: 'customerName', title: '客户名称', renderType: 'main', onClick: ({ item }) => console.log('查看客户', item) },
  { name: 'contact', title: '联系人', width: 90 },
  { name: 'phone', title: '联系电话', width: 130, render: value => value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') },
  {
    name: 'amount',
    title: '订单金额',
    renderType: 'amount',
    format: 'number-style:decimal-maximumFractionDigits:0-useGrouping:true-suffix:元'
  },
  {
    name: 'tags',
    title: '标签',
    renderType: 'tagList',
    getValueOf: item => item.tags.map(text => ({ type: text === '加急' ? 'error' : 'processing', text }))
  },
  { name: 'remark', title: '备注', renderType: 'description' },
  { name: 'orderDate', title: '下单日期', format: 'date' },
  { name: 'deliveryDate', title: '预计送达', format: 'date' },
  { name: 'status', title: '订单状态', renderType: 'status', getValueOf: item => statusMap[item.status] },
  {
    name: 'options',
    title: '操作',
    renderType: 'options',
    getValueOf: item => [
      { children: '查看', onClick: () => console.log('查看', item.id) },
      { children: '编辑', onClick: () => console.log('编辑', item.id) },
      { children: '删除', isDelete: true, message: `确定删除 ${item.id} 吗？`, onClick: () => console.log('删除', item.id) }
    ]
  }
];

// 骨架屏复用正式列的标题与列宽（含 renderType 推导的默认宽度），单元格统一画骨架；
// valueIsEmpty 恒 false，避免空值走 placeholder 不调用 render
const skeletonColumns = resolveColumns(columns).map(column => ({
  name: column.name,
  title: column.title,
  width: column.width,
  min: column.min,
  max: column.max,
  valueIsEmpty: () => false,
  getValueOf: () => '__skeleton__',
  render: () => <Skeleton.Button active size="small" style={{ width: '70%', minWidth: 40, height: 16 }} />
}));

const skeletonDataSource = Array.from({ length: 8 }, (_, index) => ({ id: `__skeleton_row_${index}` }));

const skeletonRowSelection = {
  type: 'checkbox',
  allowSelectedAll: true,
  selectedRowKeys: [],
  onChange: () => {},
  getCheckboxProps: () => ({ disabled: true })
};

// 下一帧绘制完成后回调，用于近似测量「到用户看到」的耗时
const afterPaint = callback => requestAnimationFrame(() => setTimeout(callback, 0));

const LargeDataExample = () => {
  const [count, setCount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectKeys, setSelectKeys] = useState([]);
  const [renderCost, setRenderCost] = useState(null);
  const [selectCost, setSelectCost] = useState(null);
  const renderStartRef = useRef(null);
  const selectStartRef = useRef(null);

  const load = (rowCount = count) => {
    setLoading(true);
    setRenderCost(null);
    setSelectCost(null);
    setSelectKeys([]);
    // 模拟接口请求 600ms
    setTimeout(() => {
      renderStartRef.current = performance.now();
      setDataSource(createOrders(rowCount));
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading || renderStartRef.current === null) {
      return;
    }
    const start = renderStartRef.current;
    renderStartRef.current = null;
    afterPaint(() => setRenderCost(Math.round(performance.now() - start)));
  }, [loading, dataSource]);

  useEffect(() => {
    if (selectStartRef.current === null) {
      return;
    }
    const start = selectStartRef.current;
    selectStartRef.current = null;
    afterPaint(() => setSelectCost(Math.round(performance.now() - start)));
  }, [selectKeys]);

  return (
    <Flex vertical gap={12}>
      <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8 }}>大数据量加载：模拟接口返回后从骨架屏切到真实表格，观察是否出现表格区域塌陷空白；表格含省略号列、标签列、操作列，可勾选行观察重渲染耗时</div>
      <Flex gap={12} align="center" wrap>
        <span>数据量</span>
        <Segmented
          value={count}
          onChange={value => {
            setCount(value);
            load(value);
          }}
          options={[100, 300, 500, 1000].map(value => ({ value, label: `${value} 行` }))}
        />
        <Button type="primary" loading={loading} onClick={() => load()}>
          重新加载
        </Button>
        <Space size={16} style={{ color: '#666' }}>
          <span>
            首屏渲染：<strong>{renderCost === null ? '-' : `${renderCost} ms`}</strong>
          </span>
          <span>
            勾选响应：<strong>{selectCost === null ? '-' : `${selectCost} ms`}</strong>
          </span>
          <span>
            已选 <strong>{selectKeys.length}</strong> 行
          </span>
        </Space>
      </Flex>
      {loading ? (
        <Table controllerOpen={false} loading dataSource={skeletonDataSource} columns={skeletonColumns} rowSelection={skeletonRowSelection} />
      ) : (
        <Table
          name="large-data-example"
          sticky
          scroll={{ y: 400 }}
          dataSource={dataSource}
          columns={columns}
          rowSelection={{
            type: 'checkbox',
            allowSelectedAll: true,
            selectedRowKeys: selectKeys,
            onChange: keys => {
              selectStartRef.current = performance.now();
              setSelectKeys(keys);
            }
          }}
        />
      )}
    </Flex>
  );
};

render(<LargeDataExample />);
