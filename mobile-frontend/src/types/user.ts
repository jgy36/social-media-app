// src/types/user.ts
export interface User {
  id: number;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
}