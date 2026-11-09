import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/account'];
const AUTH_ONLY_PREFIXES = ['/auth/login', '/auth/signup'];

function isUnder(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase not configured yet — don't block the app.
  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: do not add logic between createServerClient and getUser —
  // otherwise session refresh cookies can be lost.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Gate /dashboard, /admin, /account behind auth.
  if (isUnder(pathname, PROTECTED_PREFIXES) && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = '/auth/login';
    redirect.searchParams.set('next', pathname);
    return NextResponse.redirect(redirect);
  }

  // If signed in, bounce away from login/signup pages.
  if (isUnder(pathname, AUTH_ONLY_PREFIXES) && user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = '/dashboard';
    redirect.search = '';
    return NextResponse.redirect(redirect);
  }

  return supabaseResponse;
}
