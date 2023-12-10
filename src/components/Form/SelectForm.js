import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material";

function SelectForm({label, name, value, onChange, errors, touched, children, 
    number= false, disabled= false, handleBlur, helper = false, helperText=""}) {
    return(
        <FormControl sx={{ width: '100%'}} id={`label-${name}`}>
                <InputLabel id={`select-label-${name}`}>
                    {label}
                </InputLabel>
                <Select
                    labelId={`select-label-${name}`}
                    name={name}
                    value={value}
                    label={label}
                    size="small"
                    onChange={onChange}
                    error = {Boolean(touched[name] && errors[name])}
                    disabled={disabled}
                    onBlur={handleBlur}
                >
                    <MenuItem disabled value={number? -1 : "none"}>
                        <em style={{color:"gray"}}>Seleccionar</em>
                    </MenuItem>
                    {children}
                </Select>
                <FormHelperText error>{touched[name] && errors[name]}</FormHelperText>
                {helper && <FormHelperText>{helperText}</FormHelperText>}
                </FormControl>
    )
}

export default SelectForm;