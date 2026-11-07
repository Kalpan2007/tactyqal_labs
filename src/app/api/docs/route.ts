export const dynamic = "force-dynamic";

/**
 * GET /api/docs — interactive API reference.
 *
 * Served as a route handler rather than a page so the docs ship with the API
 * and need no React on the client. Scalar is pinned to an exact version.
 */
const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Tactyqal Labs Blog API</title>
    <style>body{margin:0}</style>
  </head>
  <body>
    <script id="api-reference" data-url="/api/openapi.json"></script>
    <script>
      var configuration = { theme: "kepler", hideDownloadButton: false };
      document.getElementById("api-reference").dataset.configuration = JSON.stringify(configuration);
    </script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.76.4/dist/browser/standalone.min.js"></script>
  </body>
</html>`;

export async function GET() {
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" },
  });
}
