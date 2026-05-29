"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const email = ((formData.get("email") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";

  if (!email || !password) {
    redirect("/login?error=Completá+email+y+contraseña");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg =
      error.message === "Invalid login credentials"
        ? "Email o contraseña incorrectos"
        : error.message === "Invalid input"
        ? "Datos inválidos — revisá el email y la contraseña"
        : error.message;
    redirect(`/login?error=${encodeURIComponent(msg)}`);
  }

  redirect("/");
}

export async function magicLinkAction(formData: FormData) {
  const email = ((formData.get("email") as string) ?? "").trim();

  if (!email || !email.includes("@")) {
    redirect("/login?error=Ingresá+un+email+válido");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?magic=1");
}
