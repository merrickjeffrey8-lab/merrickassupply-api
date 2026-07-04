export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const printifyHeaders = {
      Authorization: `Bearer ${env.PRINTIFY_TOKEN}`,
    };

    if (url.pathname === "/") {
      return Response.json(
        {
          ok: true,
          name: "Merrickas Supply API",
          endpoints: ["/shops", "/products"],
        },
        { headers: corsHeaders }
      );
    }

    if (url.pathname === "/shops") {
      const res = await fetch("https://api.printify.com/v1/shops.json", {
        headers: printifyHeaders,
      });

      return new Response(await res.text(), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/products") {
      const shopsRes = await fetch("https://api.printify.com/v1/shops.json", {
        headers: printifyHeaders,
      });

      const shops = await shopsRes.json();
      const shop = Array.isArray(shops) ? shops[0] : shops?.data?.[0];

      if (!shop?.id) {
        return Response.json(
          { error: "No Printify shop found", products: [] },
          { headers: corsHeaders }
        );
      }

      const productsRes = await fetch(
        `https://api.printify.com/v1/shops/${shop.id}/products.json`,
        { headers: printifyHeaders }
      );

      return new Response(await productsRes.text(), {
        status: productsRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return Response.json(
      { error: "Not found", endpoints: ["/shops", "/products"] },
      { status: 404, headers: corsHeaders }
    );
  },
};
