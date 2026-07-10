const { TableView, preset } = _TableView;
const { Flex, Tag, Card, Button, Dropdown } = antd;
const { useState } = React;

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
  { name: 'customerName', title: '客户名称', span: 10, renderType: 'main' },
  { name: 'contact', title: '联系人', width: 80 },
  { name: 'phone', title: '联系电话', width: 130, render: value => value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') },
  {
    name: 'amount',
    title: '订单金额',
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
      { children: '删除', isDelete: true, message: `确定删除 ${item.id} 吗？`, onClick: () => console.log('删除', item.id) }
    ]
  }
];

preset({
  renderMobile: {
    orderCard: ({ renderBody }) => {
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
          <style>{`
            .preset-order-card-example .info-page-table-mobile-card {
              background: linear-gradient(135deg, #ffffff 0%, #f9f0ff 52%, #eef2ff 100%) !important;
              border-color: #e8dfff !important;
            }
            .preset-order-card-example .info-page-table-mobile-card:hover {
              background: linear-gradient(135deg, #fafafa 0%, #f3ebff 52%, #e8eeff 100%) !important;
            }
          `}</style>
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

const OrderMobileCard = ({ item }) => {
  const status = statusMap[item.status] || { color: 'default', text: item.status };
  const actionItems = getOrderActions(item);

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
      }}
    >
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
  );
};

const DefaultMobileCards = () => {
  const [selectKeys, setSelectKeys] = useState([]);
  const totalAmount = selectKeys.reduce((sum, id) => sum + (dataSource.find(d => d.id === id)?.amount || 0), 0);
  return (
    <div>
      <div style={{ marginBottom: 12, color: '#666', fontSize: 13, lineHeight: 1.7 }}>
        <code>renderMobile={'{true}'}</code>：移动端启用默认卡片 List（每行一张卡片，操作列靠右）；
        开启 <code>allowSelectedAll</code> 后顶部显示全选。请用示例预览的手机模式查看效果。
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

const CustomMobileRender = () => {
  const totalAmount = dataSource.reduce((sum, item) => sum + item.amount, 0);
  return (
    <div>
      <div style={{ marginBottom: 12, color: '#666', fontSize: 13, lineHeight: 1.7 }}>
        <code>renderMobile</code> 为 function 时完全接管渲染，可自定义主次关系卡片：客户名称作主信息，状态/编号/联系人作次要信息。
        桌面端仍走 <code>render</code>，样式与普通 TableView 一致。
      </div>
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
          dataSource={dataSource}
          columns={columns}
          render={({ renderBody }) => <div style={{ overflowX: 'auto' }}>{renderBody(dataSource)}</div>}
          renderMobile={() => (
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
                  {dataSource.length} 笔 · 合计 ¥{totalAmount.toLocaleString()}
                </div>
              </div>
              <Flex vertical gap={12}>
                {dataSource.map(item => (
                  <OrderMobileCard key={item.id} item={item} />
                ))}
              </Flex>
            </div>
          )}
        />
      </Card>
    </div>
  );
};

const PresetStringRender = () => {
  return (
    <Flex vertical gap={24}>
      <div>
        <div style={{ marginBottom: 12, color: '#666', fontSize: 13, lineHeight: 1.7 }}>
          <code>renderMobile="orderCard"</code>：通过 <code>preset({'{ renderMobile }'})</code> 注册名称对应的渲染函数；
          仅移动端生效，优先级与 function 一致。
        </div>
        <TableView dataSource={dataSource} columns={columns} size="large" renderMobile="orderCard" />
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
      <CustomMobileRender />
      <PresetStringRender />
    </Flex>
  );
};

render(<BaseExample />);
