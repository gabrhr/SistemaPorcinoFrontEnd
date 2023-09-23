import { createContext, useEffect, useReducer } from 'react';
import axios from 'src/utils/spAxios';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { keyCodeBack } from 'src/config';

const initialAuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null
};

const setSession = (accessToken, user) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common.Authorization = `${accessToken}`;
  } else {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common.Authorization;
  }
};

const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user
    };
  },
  LOGIN: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user
    };
  },
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null
  }),
  REGISTER: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user
    };
  }
};

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

const AuthContext = createContext({
  ...initialAuthState,
  method: 'JWT',
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve()
});

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialAuthState);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem('accessToken');
        if (accessToken) {
          const user = JSON.parse(window.localStorage.getItem('user'));
          setSession(accessToken, user);
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: true,
              user
            }
          });
        } else {
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: false,
              user: null
            }
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null
          }
        });
      }
    };
    initialize();
  }, []);

  const login = async (email, password) => {
    
    try {
      const response = await axios.post(
        '/auth/login',
        {
          correo: email,
          contrasena: password
        },
        {
          headers: {
            Authorization: `${keyCodeBack}`
          }
        }
      );
  
      
      if (response.status === 200 && response.data) {
  
        const { token, user } = {
          token: response.data.token, 
          user: {
            granjaId: response.data.granjaId,
            granjaNombre: response.data.granjaNombre,
            person:{
              role: response.data.rol,
              correo: response.data.correo
            }
          }
        };
        setSession(token, user);
        dispatch({
          type: 'LOGIN',
          payload: {
            user
          }
        });
        
      } else {
        enqueueSnackbar("Credenciales invalidas")
  
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null
          }
        });
      }
    } catch (error) {
      enqueueSnackbar("Se ha encotrado un error en el sistema")
    }
  };

  const logout = async () => {
    setSession(null);
    dispatch({ type: 'LOGOUT' });
  };

  const register = async (email, name, password) => {
    const response = await axios.post('/api/account/register', {
      email,
      name,
      password
    });
    const { accessToken, user } = response.data;

    window.localStorage.setItem('accessToken', accessToken);
    dispatch({
      type: 'REGISTER',
      payload: {
        user
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'JWT',
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext;
