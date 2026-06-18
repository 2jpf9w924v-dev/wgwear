export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { cliente, carrinho } = req.body;

    if (!carrinho || carrinho.length === 0) {
      return res.status(400).json({ erro: "Carrinho vazio" });
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        erro: "Token do Mercado Pago não configurado na Vercel"
      });
    }

    const items = carrinho.map((item) => ({
      title: `${item.name} - ${item.size || ""} - ${item.color || ""}`,
      quantity: Number(item.qty),
      unit_price: Number(item.price),
      currency_id: "BRL"
    }));

    const preference = {
      items,
      payer: {
        name: cliente?.nome || "",
        email: cliente?.email || "",
        phone: {
          number: cliente?.telefone || ""
        }
      },
      back_urls: {
        success: "https://wgwear.vercel.app/sucesso.html",
        failure: "https://wgwear.vercel.app/falha.html",
        pending: "https://wgwear.vercel.app/pendente.html"
      },
      auto_return: "approved",
      statement_descriptor: "WG WEAR"
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(preference)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        erro: "Erro ao criar pagamento",
        detalhe: data
      });
    }

    return res.status(200).json({
      linkPagamento: data.init_point,
      sandbox: data.sandbox_init_point,
      id: data.id
    });

  } catch (error) {
    return res.status(500).json({
      erro: "Erro interno",
      detalhe: error.message
    });
  }
}