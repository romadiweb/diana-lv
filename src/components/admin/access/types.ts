export type UA = {
  user_id: string;
  email?: string | null;
  active: boolean;
  never_expires: boolean;
  expires_at: string | null;
  note: string | null;
  is_admin: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CreatedAuthUser = {
  id: string;
  email: string;
  existed?: boolean;
};
