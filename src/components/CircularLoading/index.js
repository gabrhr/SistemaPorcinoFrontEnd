import { CircularProgress } from "@mui/material"

function CircularLoading() {
    return (
        <div
          style={{
            display: 'grid',
            justifyContent: 'center',
            paddingTop: '6rem',
            paddingBottom: '6rem'
          }}
        >
          <CircularProgress
            color="secondary"
            sx={{ mb: '1rem', mx: '10rem' }}
          />
        </div>
    )
}
export default CircularLoading