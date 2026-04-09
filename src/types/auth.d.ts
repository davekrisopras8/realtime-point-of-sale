export type AuthFormState = {
  status?: string;
  errors?: {
    email?: string[];
    password?: string[];
    name?: string[];
    role?: string[];
    avatar_url?: string[];
    _form?: string[];
  }
  data?: {
    emailChanged?: boolean;
    newEmail?: string; 
  };
}

export type Profile = {
  id?: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  email?: string;
}

