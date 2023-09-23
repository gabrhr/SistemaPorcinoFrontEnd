import { DatePicker } from "@mui/lab";
import { TextField } from "@mui/material";

function DatePickerForm({inputName, touched, errors,
    label, setFieldValue, handleChange = () => {}, value,
    disableFuture = false, disabled=false
   }) {
   return(
        <DatePicker
            value={value? new Date(value): null}
            onChange={(date) => {
                setFieldValue(inputName, date.toISOString())
                handleChange()
            }}
            label={label}
            disableFuture={disableFuture}
            disabled={disabled}
            renderInput={(params) => (
            <TextField
                {...params}
                variant="outlined"
                size="small"
                fullWidth
                placeholder="dd/mm/yyyy"
                name={inputName}
                error={Boolean(
                touched[inputName] && errors[inputName]
                )}
                helperText={
                touched[inputName] && errors[inputName]
                }
            />
            )}
        />
   )
}

export default DatePickerForm