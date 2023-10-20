import { Backdrop, CircularProgress } from "@mui/material"

function BackdropLoading({open = false}) {
    return <Backdrop
    sx={{ color: '#fff', paddingLeft: 10, zIndex: (theme) => theme.zIndex.drawer + 1 }}
    open={open}
  >
    <CircularProgress color="inherit" />
  </Backdrop>
}

export default BackdropLoading