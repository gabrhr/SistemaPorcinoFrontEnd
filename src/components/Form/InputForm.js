import { TextField } from "@mui/material"


function InputForm({inputName, touched, errors,
     placeholder = "", label,handleBlur, handleChange, value,
     multiline = false, type = "text", disabled = false, inputProps={}
    }) {
    return(
        <TextField
            error={Boolean(touched[inputName] && errors[inputName])}
            fullWidth
            size="small"
            helperText={touched[inputName] && errors[inputName]}
            name={inputName}
            placeholder={placeholder}
            label={label}
            onBlur={handleBlur}
            onChange={handleChange}
            variant="outlined"
            minRows={3}
            multiline={multiline}
            value={value}
            type={type}
            disabled={disabled}
            inputProps={inputProps}
            />
    )
}

export default InputForm