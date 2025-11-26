export async function onRequestPost({ request, env }) {
  const { username, email, password } = await request.json();

  // Simple hash (good enough for V0)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');

  const userId = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)`
  ).bind(userId, username, email, hashHex).run();

  const token = btoa(JSON.stringify({ sub: userId, username, exp: Date.now() + 30*24*60*60*1000 }));

  return Response.json({ token });
}
