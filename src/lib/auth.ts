import type { AstroCookies } from 'astro';

// Obtiene el token de sesión esperado basado en las variables de entorno
export function getSessionToken(): string {
  const username = import.meta.env.ADMIN_USERNAME || 'admin';
  const password = import.meta.env.ADMIN_PASSWORD || 'admin';
  // btoa() es compatible con todos los entornos (Node, Edge, Browser)
  return btoa(`${username}:${password}`);
}

// Verifica si la solicitud contiene la cookie de sesión correcta
export function isAuthenticated(cookies: AstroCookies): boolean {
  const sessionCookie = cookies.get('admin_session')?.value;
  if (!sessionCookie) return false;
  return sessionCookie === getSessionToken();
}

// Inicia la sesión guardando la cookie
export function setSession(cookies: AstroCookies): void {
  cookies.set('admin_session', getSessionToken(), {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 1 semana
  });
}

// Cierra la sesión borrando la cookie
export function clearSession(cookies: AstroCookies): void {
  cookies.delete('admin_session', { path: '/' });
}
