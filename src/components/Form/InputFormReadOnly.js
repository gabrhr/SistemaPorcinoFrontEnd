import { TextField } from "@mui/material"


function InputFormReadOnly({inputName, label, value}) {
    return(
        <TextField
            value={value}
            fullWidth
            size="small"
            name={inputName}
            label={label}
            variant="outlined"
            disabled
        />
    )
}

export default InputFormReadOnly