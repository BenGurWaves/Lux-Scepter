export const onRequestPost = async ({ request, env }) => {
  const { username, email, password } = await request.json();
  const hashed = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  const userId = crypto.randomUUID();

  await env.DB.prepare("INSERT INTO users (id, username, email, password_hash, email) VALUES (?, ?, ?, ?)")
    .bind(userId, username, Array.from(new Uint8Array(hashed)).map(b => b.toString(16).padStart(2,'0')).join(''), email)
    .run();

  const token = await new SignJWT({ sub: userId, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(crypto.subtle.importKey('raw', new TextEncoder().encode(env.JWT_SECRET), {name:'HMAC', hash:'SHA-256'}, false, ['sign']));

  return Response.json({ token });
};
