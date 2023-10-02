import { DatePicker, DateTimePicker } from "@mui/lab";
import { TextField } from "@mui/material";

function DatePickerForm({inputName, touched, errors,
    label, setFieldValue= () => {}, handleChange = () => {}, value,
    disableFuture = false, disabled=false, disablePast = false, handleBlur, time = false
   }) {

    if(time){
        return(
            <DateTimePicker
                value={value? new Date(value) : null}
                onChange={(date) => {
                    setFieldValue(inputName, date? date.toISOString() : null)
                    handleChange()
                }}
                label={label}
                disableFuture={disableFuture}
                disablePast={disablePast}
                disabled={disabled}
                ampm
                renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="dd/mm/yyyy hh:mm "
                    name={inputName}
                    error={Boolean(
                    touched[inputName] && errors[inputName]
                    )}
                    helperText={
                    touched[inputName] && errors[inputName]
                    }
                    onBlur={handleBlur}
                />
                )}
            />
       )
    }
   return(
        <DatePicker
            value={value? new Date(value) : null}
            onChange={(date) => {
                setFieldValue(inputName, date? date.toISOString() : null)
                handleChange()
            }}
            label={label}
            disableFuture={disableFuture}
            disablePast={disablePast}
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
                onBlur={handleBlur}
            />
            )}
        />
   )
}

export default DatePickerForm