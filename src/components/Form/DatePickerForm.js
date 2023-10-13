import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

function DatePickerForm({inputName, touched, errors,
    label, setFieldValue= () => {}, handleChange = () => {}, value,
    disableFuture = false, disabled=false, disablePast = false, handleBlur, time = false
   }) {

    if(time){
        return(
            <DateTimePicker
                value={value && dayjs(value) || null}
                onChange={(date) => {
                    setFieldValue(inputName, date)
                    handleChange()
                }}
                label={label}
                disableFuture={disableFuture}
                disablePast={disablePast}
                disabled={disabled}
                format="DD/MM/YYYY hh:mm a"
                slotProps={{
                    textField: {
                      helperText: touched[inputName] && errors[inputName],
                      error: Boolean(touched[inputName] && errors[inputName]),
                      fullWidth: true,
                      variant: "outlined",
                      size: "small",
                      name: inputName,
                      onBlur: (e) => {handleBlur(e)}
                    }
                }}
            />
       )
    }
   return(
        <DatePicker
            value={value && dayjs(value) || null}
            onChange={(date) => {
                setFieldValue(inputName, date)
                handleChange()
            }}
            label={label}
            disableFuture={disableFuture}
            disablePast={disablePast}
            disabled={disabled}
            format="DD/MM/YYYY"
            slotProps={{
                textField: {
                  helperText: touched[inputName] && errors[inputName],
                  error: Boolean(touched[inputName] && errors[inputName]),
                  fullWidth: true,
                  variant: "outlined",
                  size: "small",
                  name: inputName,
                  onBlur: (e) => {handleBlur(e)}
                }
            }}
        />
   )
}

export default DatePickerForm