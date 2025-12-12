import { useState, useEffect } from "react";

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subscription: "standard" | "professional";
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("clinq_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string) => {
    const storedUser = localStorage.getItem("clinq_user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.email === email) {
        setUser(userData);
        return userData;
      }
    }
    return null;
  };

  const signup = (userData: Omit<User, "subscription">) => {
    const newUser = { ...userData, subscription: "standard" as const };
    setUser(newUser);
    return newUser;
  };

  const setSubscription = (subscription: "standard" | "professional") => {
    if (user) {
      const updatedUser = { ...user, subscription };
      setUser(updatedUser);
      localStorage.setItem("clinq_user", JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    // Keep user data in localStorage for re-login
  };

  return {
    user,
    isLoading,
    login,
    signup,
    setSubscription,
    logout,
  };
}
