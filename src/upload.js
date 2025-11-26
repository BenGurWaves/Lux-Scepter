export const onRequestPost = async ({ request, env }) => {
  const { filename, type } = await request.json();
  const key = `${crypto.randomUUID()}-${filename}`;
  const signedUrl = await env.R2.getSignedUrl(key, {
    action: 'write',
    expiry: 600 // 10 min
  });
  await env.DB.prepare("INSERT INTO posts (id, url, type) VALUES (?, ?, ?)")
    .bind(key, `https://${env.R2_BUCKET}.r2.dev/${key}`, type).run();
  return Response.json({ url: signedUrl });
};
