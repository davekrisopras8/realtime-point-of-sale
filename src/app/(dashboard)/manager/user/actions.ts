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

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      name: validatedFields.data.name,
      role: validatedFields.data.role,
      avatar_url: validatedFields.data.avatar_url,
    })
    .eq("id", formData.get("id"));

  if (error) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  const cookiesStore = await cookies();
  const currentProfile = JSON.parse(
    cookiesStore.get("user_profile")?.value ?? "{}"
  );

  if (currentProfile.id === formData.get("id")) {
    const updatedProfile = {
      ...currentProfile,
      name: validatedFields.data.name,
      role: validatedFields.data.role,
      avatar_url: validatedFields.data.avatar_url,
    };

    cookiesStore.set("user_profile", JSON.stringify(updatedProfile), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  revalidatePath("/manager/user");

  return {
    status: "success",
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
