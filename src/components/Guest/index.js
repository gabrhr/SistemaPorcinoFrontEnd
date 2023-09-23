import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from 'src/hooks/useAuth';

const Guest = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    console.log(user);
    const { role } = user.person;
    if (role === 1) return <Navigate to="/sp/porcicultor" />;
    if (role === 0) return <Navigate to="/sp/admin" />;
  }

  return <>{children}</>;
};

Guest.propTypes = {
  children: PropTypes.node
};

export default Guest;
