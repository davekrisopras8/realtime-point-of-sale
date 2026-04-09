"use server";
import { deleteFile, uploadFile } from "@/actions/storage-actions";
import { createClient } from "@/lib/supabase/server";
import { AuthFormState } from "@/types/auth";
import {
  createUserSchema,
  updateUserSchema,
} from "@/validations/auth-validation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createUser(prevState: AuthFormState, formData: FormData) {
  let validatedFields = createUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    role: formData.get("role"),
    avatar_url: formData.get("avatar_url"),
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        _form: [],
      },
    };
  }

  if (validatedFields.data.avatar_url instanceof File) {
    const { errors, data } = await uploadFile(
      "images",
      "users",
      validatedFields.data.avatar_url
    );

    if (errors) {
      return {
        status: "error",
        errors: {
          ...prevState.errors,
          _form: [...errors._form],
        },
      };
    }

    validatedFields = {
      ...validatedFields,
      data: {
        ...validatedFields.data,
        avatar_url: data.url,
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
    options: {
      data: {
        name: validatedFields.data.name,
        role: validatedFields.data.role,
        avatar_url: validatedFields.data.avatar_url,
      },
    },
  });

  if (error) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  return {
    status: "success",
  };
}

export async function updateUser(prevState: AuthFormState, formData: FormData) {
  let validatedFields = updateUserSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    email: formData.get("email"),
    avatar_url: formData.get("avatar_url"),
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        _form: [],
      },
    };
  }

  if (validatedFields.data.avatar_url instanceof File) {
    const oldAvatarUrl = formData.get("old_avatar_url") as string;
    const { errors, data } = await uploadFile(
      "images",
      "users",
      validatedFields.data.avatar_url,
      oldAvatarUrl.split("/images/")[1]
    );

    if (errors) {
      return {
        status: "error",
        errors: {
          ...prevState.errors,
          _form: [...errors._form],
        },
      };
    }

    validatedFields = {
      ...validatedFields,
      data: {
        ...validatedFields.data,
        avatar_url: data.url,
      },
    };
  }

  const supabase = await createClient({ isManager: true });
  const userId = formData.get("id") as string;
  const oldEmail = formData.get("old_email") as string;
  const newEmail = validatedFields.data.email;

  const emailChanged = oldEmail !== newEmail;

  if (emailChanged) {
    const { error: emailError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        email: newEmail,
        email_confirm: false, // Force email verification
      }
    );

    if (emailError) {
      return {
        status: "error",
        errors: {
          ...prevState.errors,
          _form: [
            `Failed to update email: ${emailError.message}. The email might already be in use.`,
          ],
        },
      };
    }
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name: validatedFields.data.name,
      role: validatedFields.data.role,
      avatar_url: validatedFields.data.avatar_url,
      email: validatedFields.data.email, 
    })
    .eq("id", userId);

  if (profileError) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [profileError.message],
      },
    };
  }

  // ✅ Update cookie if current user is being updated
  const cookiesStore = await cookies();
  const currentProfile = JSON.parse(
    cookiesStore.get("user_profile")?.value ?? "{}"
  );

  if (currentProfile.id === userId) {
    const updatedProfile = {
      ...currentProfile,
      name: validatedFields.data.name,
      role: validatedFields.data.role,
      avatar_url: validatedFields.data.avatar_url,
      email: validatedFields.data.email,
    };

    cookiesStore.set("user_profile", JSON.stringify(updatedProfile), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  revalidatePath("/manager/user");

  // ✅ Return success with email change info
  return {
    status: "success",
    data: {
      emailChanged,
      newEmail: emailChanged ? newEmail : undefined,
    },
  };
}

export async function deleteUser(prevState: AuthFormState, formData: FormData) {
  const supabase = await createClient({ isManager: true });
  const image = formData.get("avatar_url") as string;
  const { status, errors } = await deleteFile(
    "images",
    image.split("/images/")[1]
  );

  if (status === "error") {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [errors?._form?.[0] ?? "Unknown error"],
      },
    };
  }

  const { error } = await supabase.auth.admin.deleteUser(
    formData.get("id") as string
  );

  if (error) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  return {
    status: "success",
  };
}
