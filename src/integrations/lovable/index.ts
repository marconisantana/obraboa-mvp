// Compatibility stub — replaces @lovable.dev/cloud-auth-js with standard Supabase OAuth.
// The original auto-generated file used a Lovable-specific package no longer required.
import { supabase } from '../supabase/client';

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: 'google' | 'apple', opts?: SignInOptions) => {
      return supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: opts?.redirect_uri ?? window.location.origin,
          queryParams: opts?.extraParams,
        },
      });
    },
  },
};
