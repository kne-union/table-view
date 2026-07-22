const { TableView, mergeTreeChildren } = _TableView;
const { Space, Button, Radio, Checkbox, Flex } = antd;
const { useState } = React;

const columns = [
  { name: 'name', title: '名称', renderType: 'main' },
  { name: 'code', title: '编码', width: 120 },
  { name: 'owner', title: '负责人', width: 100 }
];

const treeData = [
  {
    id: '1',
    name: '华东区',
    code: 'EAST',
    owner: '张三',
    children: [
      {
        id: '1-1',
        name: '上海',
        code: 'SH',
        owner: '李四',
        children: [
          { id: '1-1-1', name: '浦东分部', code: 'SH-PD', owner: '王五' },
          { id: '1-1-2', name: '徐汇分部', code: 'SH-XH', owner: '赵六' }
        ]
      },
      { id: '1-2', name: '杭州', code: 'HZ', owner: '钱七' }
    ]
  },
  {
    id: '2',
    name: '华北区',
    code: 'NORTH',
    owner: '孙八',
    children: [{ id: '2-1', name: '北京', code: 'BJ', owner: '周九' }]
  }
];

const treeListData = [
  { id: '1', name: '华东区', code: 'EAST', owner: '张三', parentId: null },
  { id: '1-1', name: '上海', code: 'SH', owner: '李四', parentId: '1' },
  { id: '1-1-1', name: '浦东分部', code: 'SH-PD', owner: '王五', parentId: '1-1' },
  { id: '1-1-2', name: '徐汇分部', code: 'SH-XH', owner: '赵六', parentId: '1-1' },
  { id: '1-2', name: '杭州', code: 'HZ', owner: '钱七', parentId: '1' },
  { id: '2', name: '华北区', code: 'NORTH', owner: '孙八', parentId: '' },
  { id: '2-1', name: '北京', code: 'BJ', owner: '周九', parentId: '2' }
];

const lazyRootData = [
  { id: 'org-1', name: '集团总部', code: 'HQ', owner: '张三', parentId: null, hasChildren: true },
  { id: 'org-2', name: '分公司', code: 'BR', owner: '李四', parentId: null, hasChildren: true }
];

const lazyChildrenMap = {
  'org-1': [
    { id: 'org-1-1', name: '研发中心', code: 'RD', owner: '王五', hasChildren: true },
    { id: 'org-1-2', name: '市场部', code: 'MKT', owner: '赵六', hasChildren: false }
  ],
  'org-1-1': [
    { id: 'org-1-1-1', name: '前端组', code: 'FE', owner: '钱七', hasChildren: false },
    { id: 'org-1-1-2', name: '后端组', code: 'BE', owner: '孙八', hasChildren: false }
  ],
  'org-2': [{ id: 'org-2-1', name: '华南办', code: 'SC', owner: '周九', hasChildren: false }]
};

const OrgTreeMobileCard = ({ item, meta, breadcrumb, checked, indeterminate, disabled, onChange, onExpand, loading }) => {
  const path = (breadcrumb || []).slice(0, -1);
  const hasChildren = !!meta?.hasChildren;
  const level = meta?.level || 0;
  const isChild = level > 0;

  return (
    <div
      style={{
        background: checked ? 'var(--primary-color-1, #e6f4ff)' : isChild ? 'var(--bg-color-grey-1, #f5f5f5)' : '#fff',
        border: `1px solid ${checked ? 'var(--primary-color-2, #91caff)' : isChild ? '#e8e8e8' : '#f0f0f0'}`,
        borderLeft: `${isChild ? level * 18 : 1}px solid ${checked ? 'var(--primary-color, #1677ff)' : isChild ? '#bfbfbf' : '#f0f0f0'}`,
        borderRadius: 8,
        padding: '12px 14px',
        color: checked ? 'var(--primary-color, #1677ff)' : undefined,
        transition: 'background 200ms, border-color 200ms, border-left-width 200ms'
      }}
    >
      <Flex
        align="center"
        gap={8}
        style={{
          paddingBottom: 10,
          marginBottom: 10,
          borderBottom: `1px solid ${isChild ? '#ebebeb' : '#f0f0f0'}`
        }}
      >
        <button
          type="button"
          aria-label={meta?.expanded ? '收起' : '展开'}
          disabled={!hasChildren || loading}
          onClick={e => {
            e.stopPropagation();
            if (hasChildren) {
              onExpand?.();
            }
          }}
          style={{
            width: 22,
            height: 22,
            border: 'none',
            background: 'transparent',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: hasChildren ? 'pointer' : 'default',
            color: hasChildren ? 'rgba(0,0,0,0.45)' : 'transparent',
            transform: meta?.expanded ? 'rotate(90deg)' : 'none',
            transition: 'transform 200ms',
            flexShrink: 0,
            fontSize: 12,
            lineHeight: 1,
            opacity: loading ? 0.5 : 1
          }}
        >
          {loading ? '…' : '▸'}
        </button>
        <Checkbox checked={checked} indeterminate={indeterminate} disabled={disabled} onChange={onChange} onClick={e => e.stopPropagation()} />
        <span
          style={{
            flexShrink: 0,
            fontSize: 11,
            lineHeight: '18px',
            padding: '0 6px',
            borderRadius: 4,
            background: isChild ? 'rgba(0,0,0,0.06)' : 'var(--primary-color-1, #e6f4ff)',
            color: isChild ? 'rgba(0,0,0,0.45)' : 'var(--primary-color, #1677ff)'
          }}
        >
          {isChild ? `子级 L${level}` : '根节点'}
        </span>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 12,
            lineHeight: '20px',
            color: 'rgba(0,0,0,0.45)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {path.length > 0 ? path.join(' / ') : '—'}
        </div>
      </Flex>

      <div style={{ fontSize: isChild ? 14 : 16, fontWeight: isChild ? 500 : 600, lineHeight: 1.4, color: checked ? 'inherit' : 'rgba(0,0,0,0.88)' }}>{item.name}</div>
      <Flex gap={16} style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5, color: checked ? 'inherit' : 'rgba(0,0,0,0.45)' }}>
        <span>编码 {item.code}</span>
        <span>负责人 {item.owner}</span>
      </Flex>
    </div>
  );
};

const TreeExample = () => {
  const { selectedRowKeys, getRowSelection, clearSelectedRows } = TableView.useSelectedRow({ rowKey: 'id' });
  const mobileSelection = TableView.useSelectedRow({ rowKey: 'id' });
  const customMobileSelection = TableView.useSelectedRow({ rowKey: 'id' });
  const [expandedKeys, setExpandedKeys] = useState(false);
  const [checkRelation, setCheckRelation] = useState('parent');
  const [lazyData, setLazyData] = useState(lazyRootData);

  const handleLoadChildren = (item, { key }) =>
    new Promise(resolve => {
      setTimeout(() => {
        const children = lazyChildrenMap[key] || [];
        setLazyData(prev =>
          mergeTreeChildren(prev, children, {
            parentKeyValue: key,
            dataType: 'treeList',
            rowKey: 'id',
            parentKey: 'parentId',
            hasChildrenKey: 'hasChildren'
          })
        );
        resolve();
      }, 800);
    });

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <div style={{ marginBottom: 8 }}>tree：嵌套 children</div>
        <TableView dataSource={treeData} columns={columns} dataType="tree" defaultExpandedKeys />
      </div>

      <div>
        <div style={{ marginBottom: 8 }}>懒加载：hasChildren + onLoadChildren + mergeTreeChildren（展开显示 loading）</div>
        <TableView dataSource={lazyData} columns={columns} dataType="treeList" onLoadChildren={handleLoadChildren} />
      </div>

      <div>
        <div style={{ marginBottom: 8 }}>移动端树形默认卡片：三角 + 勾选 + 面包屑</div>
        <TableView
          dataSource={treeListData}
          columns={columns}
          dataType="treeList"
          defaultExpandedKeys
          treeTitleKey="name"
          renderMobile
          rowSelection={mobileSelection.getRowSelection(treeListData, { allowSelectedAll: true, checkRelation: 'parent' })}
        />
      </div>

      <div>
        <div style={{ marginBottom: 8 }}>自定义 renderMobile：根节点 / 子级（meta.level）视觉区分</div>
        <TableView
          dataSource={treeListData}
          columns={columns}
          dataType="treeList"
          defaultExpandedKeys
          treeTitleKey="name"
          rowSelection={customMobileSelection.getRowSelection(treeListData, { allowSelectedAll: true, checkRelation: 'parent' })}
          renderMobile={({ displayDataSource, renderToolbar, getRowKey, getSelectionProps, getTreeRowMeta, getBreadcrumb, isExpandLoading, onToggleExpand }) => (
            <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 12 }}>
              <div style={{ marginBottom: 12 }}>{renderToolbar()}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(displayDataSource || []).map(item => {
                  const key = getRowKey(item);
                  const selection = getSelectionProps(item);
                  return (
                    <OrgTreeMobileCard
                      key={key}
                      item={item}
                      meta={getTreeRowMeta(item)}
                      breadcrumb={getBreadcrumb(item)}
                      loading={isExpandLoading(item)}
                      onExpand={() => onToggleExpand(key)}
                      {...selection}
                    />
                  );
                })}
              </div>
            </div>
          )}
        />
      </div>

      <div>
        <div style={{ marginBottom: 8 }}>checkRelation：parent（默认，值只留父级）/ all（含子孙）/ independent（互不影响）</div>
        <Space style={{ marginBottom: 8 }} wrap>
          <Radio.Group
            value={checkRelation}
            optionType="button"
            options={[
              { label: 'parent', value: 'parent' },
              { label: 'all', value: 'all' },
              { label: 'independent', value: 'independent' }
            ]}
            onChange={e => {
              setCheckRelation(e.target.value);
              clearSelectedRows();
            }}
          />
        </Space>
        <TableView dataSource={treeListData} columns={columns} dataType="treeList" defaultExpandedKeys rowSelection={getRowSelection(treeListData, { allowSelectedAll: true, checkRelation })} />
        <div style={{ marginTop: 8 }}>已选 key：{selectedRowKeys.join(', ') || '无'}</div>
      </div>

      <div>
        <div style={{ marginBottom: 8 }}>受控展开：true 全开 / false 全关 / key 数组</div>
        <Space style={{ marginBottom: 8 }}>
          <Button size="small" onClick={() => setExpandedKeys(true)}>
            全部展开
          </Button>
          <Button size="small" onClick={() => setExpandedKeys(false)}>
            全部收起
          </Button>
          <Button size="small" onClick={() => setExpandedKeys(['1', '1-1'])}>
            展开指定节点
          </Button>
        </Space>
        <TableView dataSource={treeData} columns={columns} dataType="tree" expandedKeys={expandedKeys} onExpandedKeysChange={setExpandedKeys} />
      </div>
    </Space>
  );
};

render(<TreeExample />);
