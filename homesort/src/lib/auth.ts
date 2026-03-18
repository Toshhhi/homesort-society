"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export type AuthUser = {
  role: "admin" | "resident";
  email: string;
};

const AUTH_KEY = "homesort_user";

export async function saveUser(user: AuthUser) {
  const cookieStore = await cookies();

  cookieStore.set("role", user.role, { httpOnly: true, secure: true });
  cookieStore.set("email", user.email, { httpOnly: true, secure: true });
}

export async function getUser() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const email = cookieStore.get("email")?.value;

  if (!role || !email) return null;

  return { role,email };
}

export async function clearUser() {
  const cookieStore = await cookies();
  cookieStore.delete("role")
  cookieStore.delete("email")
}

export async function logout() {
  await clearUser();
  redirect("/login");
}