export async function onRequestPost({ request, env }) {
  const { username, email, password } = await request.json();

  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');

  const userId = crypto.randomUUID();

  try {
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)`
    ).bind(userId, username, email, hashHex).run();
  } catch (e) {
    return Response.json({ error: 'Username or email already taken' }, { status: 400 });
  }

  const token = btoa(JSON.stringify({ sub: userId, username, exp: Date.now() + 30*24*60*60*1000 }));

  return Response.json({
    token,
    user: { id: userId, username, email }
  });
}
