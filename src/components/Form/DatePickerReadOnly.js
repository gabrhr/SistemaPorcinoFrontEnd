import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

function DatePickerReadOnly({inputName="", label, value}) {
    return (
        <DatePicker
            value={value && dayjs(value) || null}
            onChange={() => {}}
            label={label}
            disabled
            format="DD/MM/YYYY"
            slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                  size: "small",
                  name: inputName
                }
            }}
        />
    )
}

export default DatePickerReadOnly