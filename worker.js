export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (url.pathname === "/") {
      return Response.json({
        ok: true,
        name: "Merrickas Supply API",
        endpoints: ["/shops", "/products"]
      }, { headers });
    }

    if (url.pathname === "/shops") {
      const res = await fetch("https://api.printify.com/v1/shops.json", {
        headers: { Authorization: `Bearer ${env.PRINTIFY_TOKEN}` }
      });

      const text = await res.text();

      return new Response(text, {
        status: res.status,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    if (url.pathname === "/products") {
      const shopsRes = await fetch("https://api.printify.com/v1/shops.json", {
        headers: { Authorization: `Bearer ${env.PRINTIFY_TOKEN}` }
      });

      const shops = await shopsRes.json();
      const shop = Array.isArray(shops) ? shops[0] : shops?.data?.[0];

      if (!shop?.id) {
        return Response.json({ error: "No Printify shop found", products: [] }, { headers });
      }

      const productsRes = await fetch(`https://api.printify.com/v1/shops/${shop.id}/products.json`, {
        headers: { Authorization: `Bearer ${env.PRINTIFY_TOKEN}` }
      });

      const text = await productsRes.text();

      return new Response(text, {
        status: productsRes.status,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    return Response.json({ error: "Not found" }, { status: 404, headers });
  }
};
