import {
    createContext,
    useContext,
    useState,
    useEffect,
  } from "react";
  import axios from "axios";
  import type { ReactNode } from "react";
  
  const API_URL = "http://localhost:5000/api";
  
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
  }
  
  interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    register: (name: string, email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(
    undefined
  );
  
  export const AuthProvider = ({
    children
  }: {
    children: ReactNode;
  }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(
      localStorage.getItem("eventra_token")
    );
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const savedUser = localStorage.getItem("eventra_user");
  
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem("eventra_user");
          localStorage.removeItem("eventra_token");
          setToken(null);
        }
      }
  
      setLoading(false);
    }, [token]);
  
    const register = async (
      name: string,
      email: string,
      password: string
    ) => {
      const response = await axios.post(
        `${API_URL}/auth/register`,
        { name, email, password }
      );
  
      const { user, token } = response.data;
  
      localStorage.setItem("eventra_token", token);
      localStorage.setItem("eventra_user", JSON.stringify(user));
  
      setUser(user);
      setToken(token);
    };
  
    const login = async (email: string, password: string) => {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password }
      );
  
      const { user, token } = response.data;
  
      localStorage.setItem("eventra_token", token);
      localStorage.setItem("eventra_user", JSON.stringify(user));
  
      setUser(user);
      setToken(token);
    };
  
    const logout = () => {
      localStorage.removeItem("eventra_token");
      localStorage.removeItem("eventra_user");
  
      setUser(null);
      setToken(null);
    };
  
    return (
      <AuthContext.Provider
        value={{
          user,
          token,
          loading,
          register,
          login,
          logout
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = () => {
    const context = useContext(AuthContext);
  
    if (!context) {
      throw new Error("useAuth must be used inside AuthProvider");
    }
  
    return context;
  };
  