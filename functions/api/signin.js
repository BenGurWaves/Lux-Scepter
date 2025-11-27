export async function onRequestPost({ request, env }) {
  const { email, password } = await request.json();

  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');

  const user = await env.DB.prepare(
    `SELECT id, username, email FROM users WHERE email = ? AND password_hash = ?`
  ).bind(email, hashHex).first();

  if (!user) {
    return Response.json({ error: 'Wrong email or password' }, { status: 401 });
  }

  const token = btoa(JSON.stringify({ sub: user.id, username: user.username, exp: Date.now() + 30*24*60*60*1000 }));

  return Response.json({
    token,
    user: { id: user.id, username: user.username, email: user.email }
  });
}
