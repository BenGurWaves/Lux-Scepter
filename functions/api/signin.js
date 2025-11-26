export async function onRequestPost({ request, env }) {
  const { email, password } = await request.json();

  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');

  const result = await env.DB.prepare(
    `SELECT id, username FROM users WHERE email = ? AND password_hash = ?`
  ).bind(email, hashHex).first();

  if (!result) return new Response('Invalid', { status: 401 });

  const token = btoa(JSON.stringify({ sub: result.id, username: result.username, exp: Date.now() + 30*24*60*60*1000 }));

  return Response.json({ token });
}
