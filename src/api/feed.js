export const onRequestGet = async ({ env }) => {
  const { results } = await env.DB.prepare("SELECT p.url, p.type, u.username, p.ts FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.ts DESC LIMIT 50").all();
  return Response.json(results);
};
