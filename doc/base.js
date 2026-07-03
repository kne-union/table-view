const { TableView } = _TableView;

const BaseExample = () => {
  return (
    <TableView
      dataSource={[
        { id: '1', name: '示例数据' }
      ]}
      columns={[
        { name: 'id', title: '编号', width: 100 },
        { name: 'name', title: '名称', renderType: 'main' }
      ]}
    />
  );
};

render(<BaseExample />);
