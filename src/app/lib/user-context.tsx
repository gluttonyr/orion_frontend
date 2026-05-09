import { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import { userService } from "../service/utilisateur.service";
import type { Utilisateur } from "../model/model";

interface UserContextType {
  user: Utilisateur | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      userService
        .getCurrent(token)
        .then((currentUser) => setUser(currentUser))
        .catch((error) => {
          console.error('Erreur de récupération de l’utilisateur courant :', error);
          localStorage.removeItem('token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await userService.login(email, password);
      if (response.user && response.access_token) {
        setUser(response.user);
        localStorage.setItem('token', response.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// find the logged user role
export const getUserRole = async (): Promise<string | null> => {
  try {
    const user = await userService.getCurrent();
    console.log(user)

    if (user?.role) {
      console.log("Role: ", user.role);
      return user.role;
    }

    return null;
  } catch (error) {
    console.error("Erreur de récupération du rôle de l’utilisateur :", error);

    return null;
  }
};