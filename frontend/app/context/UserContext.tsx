"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { UserDataDTO } from "../types/auth.types";

interface UserContextType {
  user: UserDataDTO | null;
  setUser: React.Dispatch<React.SetStateAction<UserDataDTO | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
  initialUser: UserDataDTO | null;
}

export function UserProvider({ children, initialUser }: UserProviderProps) {
  const [user, setUser] = useState<UserDataDTO | null>(initialUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
}
