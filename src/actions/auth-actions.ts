"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();
  const cookiesStore = await cookies();

  try {
    await supabase.auth.signOut();
    cookiesStore.delete("user_profile");
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Error signing out: ", error);
  }
  redirect("/login");
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const cookiesStore = await cookies();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      cookiesStore.set("user_profile", JSON.stringify(profile), {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
    }

    return profile;
  } catch (error) {
    console.error("Error getting current profile:", error);
    return null;
  }
}
