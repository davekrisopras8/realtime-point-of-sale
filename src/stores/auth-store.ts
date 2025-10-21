import { INITIAL_STATE_PROFILE } from "@/constants/auth-constant";
import { Profile } from "@/types/auth";
import { User } from "@supabase/supabase-js";
import { create } from "zustand";

type AuthState = {
  user: User | null;
  profile: Profile;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile) => void;
  setHydrated: (hydrated: boolean) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: INITIAL_STATE_PROFILE,
  isHydrated: false,

  setUser: (user) => set({ user }),

  setProfile: (profile) => set({
    profile,
    isHydrated: true
  }),

  setHydrated: (hydrated) => set({ isHydrated: hydrated }),

  reset: () => set({
    user: null,
    profile: INITIAL_STATE_PROFILE,
    isHydrated: false
  }),
}));
