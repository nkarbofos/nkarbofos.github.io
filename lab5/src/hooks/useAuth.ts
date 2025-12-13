import { useAuthContext } from '../context/AuthContext';
import { loginUser, registerUser, logoutUser } from '../services/auth';

export const useAuth = () => {
  const { currentUser, userData, loading } = useAuthContext();

  const login = async (email: string, password: string) => {
    return await loginUser(email, password);
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    telegramUrl?: string
  ) => {
    return await registerUser(email, password, firstName, lastName, telegramUrl);
  };

  const logout = async () => {
    return await logoutUser();
  };

  return {
    currentUser,
    userData,
    loading,
    login,
    register,
    logout,
  };
};


