import { DataGrid } from '@mui/x-data-grid';
import Math from 'math';

const FileTable = ({ headers, fileData, count }) => {
  const rows = fileData.slice(0, count);
  const cols = () => headers.map(item => ({
    field: item,
    headerName: item,
  }));
  const columns = cols();
  let counter = 0;
  const getRowId = (row) => {
    count++;
    return Object.values(row)[0] + '_' + counter + '_' + Math.random();
  };

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        getRowId={getRowId}
        rows={rows}
        columns={columns}        
      />
    </div>
  );
}

export default FileTable;