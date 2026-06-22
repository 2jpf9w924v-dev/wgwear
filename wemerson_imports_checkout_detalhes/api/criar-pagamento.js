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
        success: "https://wgwear.com.br/sucesso.html",
        failure: "https://wgwear.com.br/falha.html",
        pending: "https://wgwear.com.br/pendente.html"
      },
      auto_return: "approved",
      statement_descriptor: "WG WEAR",
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
        default_installments: 1
      }
    };

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(preference)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        erro: "Erro ao criar pagamento",
        detalhe: data
      });
    }

    return res.status(200).json({
      linkPagamento: data.init_point,
      id: data.id
    });

  } catch (error) {
    return res.status(500).json({
      erro: "Erro interno",
      detalhe: error.message
    });
  }
}











const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzBn-ncub2tdi7eZwfFffy3SKRf445Ez0H1K2abmTo6EsVwxY27BYqWqHMFCzhNt6qj2w/exec';

let products = [];

async function carregarProdutos() {
  try {
    const response = await fetch(GOOGLE_SHEETS_URL);
    const data = await response.json();

    products = data
      .filter(item =>
        String(item.active || '').trim().toUpperCase() === 'SIM'
      )
      .map(item => ({
        id: Number(item.id),
        name: item.name,
        price: Number(item.price),
        image: item.image,
        category: item.category,
        description: item.description,
        sizes: String(item.sizes || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        colors: String(item.colors || '')
          .split(',')
          .map(c => c.trim())
          .filter(Boolean),
        details: String(item.details || '')
          .split(',')
          .map(d => d.trim())
          .filter(Boolean)
      }));

    renderProducts();

  } catch (error) {
    console.error('Erro ao carregar produtos:', error);

    document.getElementById('products').innerHTML = `
      <p style="color:red;text-align:center;">
        Erro ao carregar produtos.
      </p>
    `;
  }
}