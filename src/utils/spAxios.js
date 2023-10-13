import axios from 'axios';
import { backendURL as baseUrl } from 'src/config';
import { resultCodeDuplicatedError, resultCodeUserError } from './defaultValues';
import { errorMessage } from './notifications';


const certifyAxios = axios.create({
  baseURL: baseUrl
})

certifyAxios.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || 'There is an error!'
    )
);

export default certifyAxios;

export function showUserErrors(error, defaultMessage= null){
  let message = "No se ha podido realizar la operación. Inténtelo de nuevo"

  if(error.resultCode  && (error.resultCode === resultCodeDuplicatedError ||
    error.resultCode === resultCodeUserError)){
      message = error.message
  }else if(defaultMessage){
    message = defaultMessage
  }

  errorMessage(message)
}
