import { SignJWT, jwtVerify } from 'jose';

export const onRequest = async ({ request, env, next }) => {
  if (!request.url.includes('/home.html')) return next();

  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return Response.redirect('/', 302);

  try {
    const { payload } = await jwtVerify(auth.split(' ')[1],
      crypto.subtle.importKey('raw', new TextEncoder().encode(env.JWT_SECRET), {name:'HMAC', hash:'SHA-256'}, false, ['verify']));
    request.user = payload;
    return next();
  } catch {
    return Response.redirect('/', 302);
  }
};
