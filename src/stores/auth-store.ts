import { INITIAL_STATE_PROFILE } from "@/constants/auth-constant";
import { Profile } from "@/types/auth";
import { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type AuthState = {
  user: User | null;
  profile: Profile;
  isHydrated: boolean;
  isLoading: boolean;
};

type AuthActions = {
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile) => void;
  setHydrated: (hydrated: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
};

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  profile: INITIAL_STATE_PROFILE,
  isHydrated: false,
  isLoading: false,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }, false, "setUser"),

      setProfile: (profile) =>
        set(
          {
            profile,
            isHydrated: true,
          },
          false,
          "setProfile"
        ),

      setHydrated: (hydrated) =>
        set({ isHydrated: hydrated }, false, "setHydrated"),

      setLoading: (loading) => set({ isLoading: loading }, false, "setLoading"),

      reset: () => set(initialState, false, "reset"),
    }),
    {
      name: "auth-store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

// Selectors for better performance
export const selectUser = (state: AuthStore) => state.user;
export const selectProfile = (state: AuthStore) => state.profile;
export const selectIsHydrated = (state: AuthStore) => state.isHydrated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
