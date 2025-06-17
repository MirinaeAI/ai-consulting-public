/*
  # Remove duplicate users table

  1. Changes
    - Drop public.users table as it's redundant with auth.users
    - Update foreign key constraints to reference auth.users directly
*/

-- Drop the public.users table and its dependencies
DROP TABLE IF EXISTS public.users CASCADE;

-- Update foreign key constraints to reference auth.users
ALTER TABLE public.favorites
  DROP CONSTRAINT IF EXISTS favorites_user_id_fkey,
  ADD CONSTRAINT favorites_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.consultations
  DROP CONSTRAINT IF EXISTS consultations_user_id_fkey,
  ADD CONSTRAINT consultations_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;

ALTER TABLE public.feedback
  DROP CONSTRAINT IF EXISTS feedback_user_id_fkey,
  ADD CONSTRAINT feedback_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;