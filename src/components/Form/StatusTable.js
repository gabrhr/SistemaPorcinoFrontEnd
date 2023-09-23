import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import { Box, Button, Menu, MenuItem } from "@mui/material";
import { allStatus } from 'src/utils/defaultValues';

function StatusTable({actionRef,setOpenStatus,openStatus, status, 
    setStatus, menuList, handleChange}) {
    
    return(
        <Box>
            <Box>
            <Button
              size="small"
              variant="outlined"
              ref={actionRef}
              onClick={() => setOpenStatus(true)}
              endIcon={<ExpandMoreTwoToneIcon fontSize="small" />}
            >
              {status}
            </Button>
          </Box>
          <Menu
            disableScrollLock
            anchorEl={actionRef.current}
            onClose={() => setOpenStatus(false)}
            open={openStatus}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left'
            }}
          >
            <MenuItem
                onClick={() => {
                    handleChange(allStatus.value)
                    setStatus(allStatus.text);
                    setOpenStatus(false);
                }}
                selected = {status === allStatus.text}
              >
                Todos
              </MenuItem>
            {menuList.map((item) => (
              <MenuItem
                key={item.value}
                onClick={() => {
                    handleChange(item.value)
                    setStatus(item.text);
                    setOpenStatus(false);
                }}
                selected={status === item.text}
              >
                {item.text}
              </MenuItem>
            ))}
          </Menu>
        </Box>
    )
}

export default StatusTable;