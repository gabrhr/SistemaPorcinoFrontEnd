import { Grid, Typography } from "@mui/material";

export function SubtitleForm({subtitle = "", description = "", d2="", children, list = false}) {

    if(list){
        return (
            <Grid container item xs={12} sm={12} md={12} spacing={4} justifyContent="space-between" marginTop={0}>
            <Grid item xs={12} sm={12} md={5}>
                <Typography variant='h6' gutterBottom>
                    {subtitle}
                </Typography>
                { description !== "" &&<Typography variant='body1' gutterBottom>
                    {description}
                </Typography>}
            </Grid>
            <Grid item xs={12} sm={12} md={6} className="end-content">
                {children}
            </Grid>
            </Grid>
        )
    }

    return (
        <Grid item xs={12} sm={12} md={12}  marginTop={0} marginBottom={0}>
            <Typography variant='h6' gutterBottom>
                {subtitle}
            </Typography>
            { description !== "" &&<Typography variant='body1' gutterBottom>
                {description} 
            </Typography>}
            { d2 !== "" &&<Typography variant='body1' gutterBottom>
                {d2}
            </Typography>}
        </Grid>
    )
}