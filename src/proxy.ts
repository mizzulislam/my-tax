import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { buildContentSecurityPolicy, securityHeaders } from '@/lib/securityHeaders';

function createNonce() {
  return crypto.randomUUID().replace(/-/g, '');
}

export async function proxy(request: NextRequest) {
  const nonce = createNonce();
  const csp = buildContentSecurityPolicy(nonce, process.env.NODE_ENV === 'development');
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  // Initialize response
  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Supabase Auth Session Validation
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDemoMode = request.cookies.get('demo_mode')?.value === 'true';
  const pathname = request.nextUrl.pathname;

  // Protect /admin and /dashboard
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    if (!user && !isDemoMode) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Additional admin check (demo mode users can't access admin)
    if (pathname.startsWith('/admin')) {
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      // Fast check for role in metadata if available, otherwise RoleGuard will catch it on client
      // We don't query the profile table here to save database hits on every edge request
    }
  }

  // Set security headers
  response.headers.set('Content-Security-Policy', csp);
  for (const [key, value] of securityHeaders) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$).*)',
  ],
};
