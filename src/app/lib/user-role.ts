import { UserRole } from "../model/model.ts";
import { getUserRole } from "./user-context.tsx";

const role = await getUserRole()

export const isAdmin = role === UserRole.ADMIN;
export const isUser = role === UserRole.UTILISATEUR;
export const isCommercant = role === UserRole.COMMERCANT;

