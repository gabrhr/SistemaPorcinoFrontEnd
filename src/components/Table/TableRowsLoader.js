import { Skeleton, TableCell, TableRow } from '@mui/material';

function TableCellLoader({ type, index }) {
  if (type === 'status') {
    return (
      <TableCell align='center'>
        <Skeleton variant="text" sx={{ fontSize: '2rem', display:"inline-flex"}} width="60%"/>
      </TableCell>
    );
  }

  if (type === 'action') {
    return (
      <TableCell align='center'>
        <Skeleton variant="text" sx={{ fontSize: '2.5rem', display:"inline-flex"}}  width="90%"/>
      </TableCell>
    );
  }

  return (
    <TableCell align={index===0? "left": "center"}>
      <Skeleton variant="text" width={index===0? "50%": "20%"} sx={{display:"inline-flex"}} />
    </TableCell>
  );
}

function TableRowsLoader({
  rowsNum,
  cellsRow = null,
  cellsNum = 0,
  action = false
}) {
  return [...Array(rowsNum)].map((row, index) => (
    <TableRow key={index}>
      {cellsNum > 0 &&
        [...Array(cellsNum)].map((_, index) => <TableCellLoader key={index} index={index}/>)}
      {action && <TableCellLoader type="action" />}

      {cellsRow && cellsRow.map((cell, index) => <TableCellLoader key={index} type={cell} index={index}/>)}
    </TableRow>
  ));
}

export default TableRowsLoader;
