import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material";

function SelectForm({label, name, value, onChange, errors, touched, children, number= false, disabled= false}) {
    return(
        <FormControl sx={{ width: '100%'}}>
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
                >
                    <MenuItem disabled value={number? -1 : "none"}>
                        <em style={{color:"gray"}}>Seleccionar</em>
                    </MenuItem>
                    {children}
                </Select>
                <FormHelperText error>{touched[name] && errors[name]}</FormHelperText>
                </FormControl>
    )
}

export default SelectForm;