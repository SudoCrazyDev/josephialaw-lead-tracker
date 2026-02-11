"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { LeadInsert } from "@/types/database";

export async function getLeads() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("leads")
    .select("id, first_name, last_name, email, phone, webhook_path, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createLead(formData: FormData) {
  const supabase = getSupabaseServer();

  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || "";

  if (!first_name?.trim() || !last_name?.trim() || !email?.trim()) {
    return { error: "First name, last name, and email are required." };
  }

  const insert: LeadInsert = {
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    webhook_path: "manual",
  };

  const { error } = await supabase.from("leads").insert(insert);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/leads");
  return { success: true };
}
