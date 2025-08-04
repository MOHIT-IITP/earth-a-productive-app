import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const getUser = async () => {
  const supabase = createClient();
  const userObject = await supabase.auth.getUser();
  if (userObject.error) {
    console.log("ERROR GETTING USER", userObject.error);
    return null;
  }
  const user = userObject.data.user;
  console.log(user);
  return user;
} 