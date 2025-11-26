export const onRequestPost = async ({ request, env }) => {
  const { email, password } = await request.json();
  const hashed = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  const hashHex = Array.from(new Uint8Array(hashed)).map(b=>b.toString(16).padStart(2,'0')).join('');

  const { results } = await env.DB.prepare("SELECT id, username FROM users WHERE email = ? AND password_hash = ?")
    .bind(email, hashHex).all();

  if (!results[0]) return new Response('Invalid credentials', {status:401});

  const token = await new SignJWT({ sub: results[0].id, username: results[0].username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(crypto.subtle.importKey('raw', new TextEncoder().encode(env.JWT_SECRET), {name:'HMAC', hash:'SHA-256'}, false, ['sign']));

  return Response.json({ token });
};
