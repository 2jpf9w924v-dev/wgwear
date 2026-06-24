const whatsappNumber = '5511997831644';

const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzBn-ncub2tdi7eZwfFffy3SKRf445Ez0H1K2abmTo6EsVwxY27BYqWqHMFCzhNt6qj2w/exec';

let products = [];

function valorCampo(item, nomes, padrao = '') {
  for (const nome of nomes) {
    if (item && item[nome] !== undefined && item[nome] !== null && String(item[nome]).trim() !== '') {
      return item[nome];
    }
  }
  return padrao;
}

function normalizarPreco(valor) {
  if (typeof valor === 'number') return valor;

  let texto = String(valor || '0')
    .replace('R$', '')
    .replace(/\s/g, '')
    .trim();

  if (texto.includes(',')) {
    texto = texto.replace(/\./g, '').replace(',', '.');
  }

  const numero = Number(texto);
  return Number.isNaN(numero) ? 0 : numero;
}

function normalizarLista(valor) {
  return String(valor || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

async function carregarProdutos() {
  try {
    const response = await fetch(GOOGLE_SHEETS_URL);
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('A resposta do Google Sheets não retornou uma lista de produtos.');
    }

    products = data
      .filter(item => {
        const ativo = String(valorCampo(item, ['active', 'Active', 'ativo', 'Ativo', 'ativar', 'Ativar'], 'SIM'))
          .trim()
          .toUpperCase();

        return ativo === 'SIM' || ativo === 'ATIVO' || ativo === 'TRUE' || ativo === '1';
      })
      .map((item, index) => {
        const colorImages = Object.keys(item)
          .filter(key => key.toLowerCase().startsWith('image_'))
          .reduce((obj, key) => {
            const cor = key
              .replace(/^image_/i, '')
              .replace(/_/g, ' ')
              .trim()
              .toLowerCase();

            if (item[key]) {
              obj[cor] = item[key];
            }

            return obj;
          }, {});

        return {
          id: Number(valorCampo(item, ['id', 'ID'], index + 1)),
          name: valorCampo(item, ['name', 'Name', 'nome', 'Nome'], 'Produto sem nome'),
          price: normalizarPreco(valorCampo(item, ['price', 'Price', 'preco', 'Preço', 'valor', 'Valor'], 0)),
          image: valorCampo(item, ['image', 'Image', 'imagem', 'Imagem'], 'assets/logo-bg.png'),
          category: valorCampo(item, ['category', 'Category', 'categoria', 'Categoria'], 'Produto'),
          description: valorCampo(item, ['description', 'Description', 'descricao', 'Descrição'], ''),
          sizes: normalizarLista(valorCampo(item, ['sizes', 'Sizes', 'tamanhos', 'Tamanhos'], 'Único')),
          colors: normalizarLista(valorCampo(item, ['colors', 'Colors', 'cores', 'Cores'], 'Única')),
          details: normalizarLista(valorCampo(item, ['details', 'Details', 'detalhes', 'Detalhes'], '')),
          colorImages
        };
      })
      .filter(item => item.id && item.name && !Number.isNaN(item.price));

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

let cart = [];
let pagamentoEmProcessamento = false;

const money = value => Number(value || 0).toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function renderProducts() {
  const area = document.getElementById('products');

  if (!area) return;

  if (products.length === 0) {
    area.innerHTML = '<p style="text-align:center;">Nenhum produto ativo encontrado.</p>';
    return;
  }

  area.innerHTML = products.map(p => `
    <article class="product">
      <button class="product-click" onclick="openProductModal(${p.id})" aria-label="Ver detalhes de ${p.name}">
        <div class="product-img">
          <img src="${p.image}" alt="${p.name}">
        </div>
      </button>

      <div class="product-body">
        <span class="product-category">${p.category}</span>
        <h3>${p.name}</h3>
        <p>${p.description}</p>

        <div class="product-meta">
          <span>Tamanhos: ${p.sizes.join(', ')}</span>
          <span>Cores: ${p.colors.slice(0, 3).join(', ')}</span>
        </div>

        <div class="price">${money(p.price)}</div>

        <div class="product-actions">
          <button class="btn secondary full" onclick="openProductModal(${p.id})">Ver detalhes</button>
          <button class="btn primary full" onclick="addToCart(${p.id})">Adicionar</button>
        </div>
      </div>
    </article>
  `).join('');
}

function openProductModal(id) {
  const p = products.find(product => product.id === id);
  if (!p) return;

  const modal = document.getElementById('productModal');
  const modalBody = document.getElementById('modalBody');

  modalBody.innerHTML = `
    <div class="modal-grid">
      <div class="modal-img">
        <img id="modalProductImage" src="${p.image}" alt="${p.name}">
      </div>

      <div class="modal-info">
        <span class="product-category">${p.category}</span>
        <h2>${p.name}</h2>
        <p>${p.description}</p>
        <div class="price">${money(p.price)}</div>

        <div class="option-block">
          <strong>Tamanho</strong>
          <div class="option-list" id="modalSizes">
            ${p.sizes.map((size, index) => `
              <button class="option-btn ${index === 0 ? 'selected' : ''}" onclick="selectOption(this)">
                ${size}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="option-block">
          <strong>Cor</strong>
          <div class="option-list" id="modalColors">
            ${p.colors.map((color, index) => `
              <button
                class="option-btn ${index === 0 ? 'selected' : ''}"
                onclick="selectColor(this, '${color}', ${p.id})">
                ${color}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="option-block">
          <strong>Forma de pagamento</strong>
          <div class="option-list" id="modalPayments">
            ${['PIX', 'Cartão de crédito', 'Cartão de débito'].map((payment, index) => `
              <button class="option-btn ${index === 0 ? 'selected' : ''}" onclick="selectOption(this)">
                ${payment}
              </button>
            `).join('')}
          </div>
        </div>

        <ul class="details-list">
          ${p.details.map(detail => `<li>${detail}</li>`).join('')}
        </ul>

        <button class="btn primary full" onclick="addModalProductToCart(${p.id})">
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function selectOption(button) {
  const parent = button.parentElement;
  parent.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');
}

function selectColor(button, color, productId) {
  selectOption(button);

  const produto = products.find(p => p.id === productId);
  if (!produto) return;

  const corNormalizada = color
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase();

  const imagem =
    produto.colorImages?.[corNormalizada] ||
    produto.colorImages?.[corNormalizada.replace(/\s+/g, ' ')] ||
    produto.image;

  const img = document.getElementById('modalProductImage');

  if (img) {
    img.src = imagem;
  }
}

function getModalSelection() {
  const size = document.querySelector('#modalSizes .selected')?.textContent.trim() || '';
  const color = document.querySelector('#modalColors .selected')?.textContent.trim() || '';
  const payment = document.querySelector('#modalPayments .selected')?.textContent.trim() || 'PIX';

  return { size, color, payment };
}

function addModalProductToCart(id) {
  const selection = getModalSelection();

  addToCart(id, selection.size, selection.color);

  const paymentMethod = document.getElementById('paymentMethod');
  const pagamentoCliente = document.getElementById('pagamentoCliente');

  if (paymentMethod) paymentMethod.value = selection.payment;
  if (pagamentoCliente) pagamentoCliente.value = selection.payment;

  closeProductModal();
}

function addToCart(id, size = '', color = '') {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const chosenSize = size || product.sizes[0] || 'Único';
  const chosenColor = color || product.colors[0] || 'Única';

  const itemKey = `${id}-${chosenSize}-${chosenColor}`;
  const item = cart.find(i => i.key === itemKey);

  if (item) {
    item.qty += 1;
  } else {
    cart.push({
      ...product,
      key: itemKey,
      qty: 1,
      size: chosenSize,
      color: chosenColor
    });
  }

  renderCart();
  document.getElementById('cart')?.classList.add('open');
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  renderCart();
}

function changeQty(key, action) {
  const item = cart.find(i => i.key === key);
  if (!item) return;

  item.qty += action;

  if (item.qty <= 0) {
    removeFromCart(key);
  } else {
    renderCart();
  }
}

function renderCart() {
  const cartCount = document.getElementById('cartCount');
  const items = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');

  if (cartCount) cartCount.textContent = cart.reduce((a, i) => a + i.qty, 0);
  if (!items) return;

  if (cart.length === 0) {
    items.innerHTML = '<p>Seu carrinho está vazio.</p>';
  } else {
    items.innerHTML = cart.map(i => `
      <div class="cart-item">
        <div>
          <strong>${i.name}</strong><br>
          <small>${i.qty}x ${money(i.price)}</small><br>
          <small>Tamanho: ${i.size} | Cor: ${i.color}</small>
        </div>

        <div class="cart-actions">
          <button onclick="changeQty('${i.key}', -1)">−</button>
          <span>${i.qty}</span>
          <button onclick="changeQty('${i.key}', 1)">+</button>
          <button onclick="removeFromCart('${i.key}')">Remover</button>
        </div>
      </div>
    `).join('');
  }

  const total = cart.reduce((a, i) => a + (i.price * i.qty), 0);
  if (cartTotal) cartTotal.textContent = money(total);
}

function abrirCheckout() {
  const pagamentoCarrinho = document.getElementById('paymentMethod')?.value;
  const pagamentoCheckout = document.getElementById('pagamentoCliente');

  if (pagamentoCarrinho && pagamentoCheckout && !pagamentoCheckout.value) {
    pagamentoCheckout.value = pagamentoCarrinho;
  }

  if (cart.length === 0) {
    alert("Adicione produtos ao carrinho.");
    return;
  }

  document.getElementById("checkoutModal")?.classList.add("active");
}

function fecharCheckout() {
  document.getElementById("checkoutModal")?.classList.remove("active");
}

function toggleCart() {
  document.getElementById('cart')?.classList.toggle('open');
}

function toggleMenu() {
  document.getElementById('menu')?.classList.toggle('open');
}

function validarCamposCheckout() {
  const camposObrigatorios = [
    "nomeCliente",
    "telefoneCliente",
    "cpfCliente",
    "cepCliente",
    "enderecoCliente",
    "numeroCliente",
    "bairroCliente",
    "cidadeCliente"
  ];

  for (const campo of camposObrigatorios) {
    const elemento = document.getElementById(campo);

    if (!elemento || !elemento.value.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      if (elemento) elemento.focus();
      return false;
    }
  }

  const pagamento = document.getElementById("pagamentoCliente") || document.getElementById("paymentMethod");

  if (!pagamento || !pagamento.value.trim()) {
    alert("Por favor, selecione a forma de pagamento.");
    if (pagamento) pagamento.focus();
    return false;
  }

  return true;
}

function obterDadosCliente() {
  return {
    nome: document.getElementById("nomeCliente").value.trim(),
    telefone: document.getElementById("telefoneCliente").value.trim(),
    cpf: document.getElementById("cpfCliente").value.trim(),
    cep: document.getElementById("cepCliente").value.trim(),
    endereco: document.getElementById("enderecoCliente").value.trim(),
    numero: document.getElementById("numeroCliente").value.trim(),
    complemento: document.getElementById("complementoCliente")?.value.trim() || "Não informado",
    bairro: document.getElementById("bairroCliente").value.trim(),
    cidade: document.getElementById("cidadeCliente").value.trim(),
    pagamento: (document.getElementById("pagamentoCliente") || document.getElementById("paymentMethod")).value.trim()
  };
}

function salvarPedidoLocal(cliente, pagamentoId = "") {
  const total = cart.reduce((a, i) => a + (i.price * i.qty), 0);

  localStorage.setItem("ultimoPedidoWGWear", JSON.stringify({
    cliente,
    carrinho: cart,
    total,
    pagamentoId,
    status: "Pagamento aprovado via Mercado Pago"
  }));
}

async function finalizarPedidoMercadoPago() {
  if (pagamentoEmProcessamento) return;

  if (cart.length === 0) {
    alert("Adicione produtos ao carrinho.");
    return;
  }

  if (!validarCamposCheckout()) return;

  const cliente = obterDadosCliente();

  pagamentoEmProcessamento = true;

  const botao = document.getElementById("btnFinalizarPagamento");

  if (botao) {
    botao.disabled = true;
    botao.textContent = "Gerando pagamento...";
  }

  try {
    salvarPedidoLocal(cliente);

    const resposta = await fetch("/api/criar-pagamento", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cliente,
        carrinho: cart
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      console.error(dados);
      alert("Erro ao gerar pagamento. Verifique a configuração do Mercado Pago.");

      pagamentoEmProcessamento = false;

      if (botao) {
        botao.disabled = false;
        botao.textContent = "Finalizar Pedido";
      }

      return;
    }

    salvarPedidoLocal(cliente, dados.id || "");

    window.location.href = dados.linkPagamento;

  } catch (erro) {
    console.error(erro);
    alert("Erro ao conectar com o Mercado Pago.");

    pagamentoEmProcessamento = false;

    if (botao) {
      botao.disabled = false;
      botao.textContent = "Finalizar Pedido";
    }
  }
}

function checkoutWhatsApp() {
  if (cart.length === 0) {
    alert('Adicione pelo menos um produto ao carrinho.');
    return;
  }

  const payment = document.getElementById('paymentMethod')?.value || 'PIX';
  const lines = cart.map(i => `- ${i.qty}x ${i.name} | Tam: ${i.size} | Cor: ${i.color} | ${money(i.price)}`).join('%0A');
  const total = money(cart.reduce((a, i) => a + (i.price * i.qty), 0));

  const text = `Olá, quero finalizar meu pedido na W.G Wear:%0A%0A${lines}%0A%0AForma de pagamento: ${payment}%0ATotal: ${total}%0A%0APode confirmar disponibilidade, frete e prazo?`;

  window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
}

function enviarPedidoWhatsapp() {
  if (cart.length === 0) {
    alert("Adicione produtos ao carrinho.");
    return;
  }

  if (!validarCamposCheckout()) return;

  const cliente = obterDadosCliente();

  const itens = cart.map(i =>
    `• ${i.qty}x ${i.name}
  Cor: ${i.color}
  Tamanho: ${i.size}
  Valor: ${money(i.price)}`
  ).join("\n\n");

  const total = money(cart.reduce((a, i) => a + (i.price * i.qty), 0));

  const mensagem =
`🔥 NOVO PEDIDO - W.G WEAR

━━━━━━━━━━━━━━━

👤 DADOS DO CLIENTE

Nome: ${cliente.nome}
Telefone: ${cliente.telefone}
CPF: ${cliente.cpf}

━━━━━━━━━━━━━━━

📦 ENTREGA

${cliente.endereco}, ${cliente.numero}

Complemento: ${cliente.complemento}

Bairro: ${cliente.bairro}
Cidade: ${cliente.cidade}

CEP: ${cliente.cep}

━━━━━━━━━━━━━━━

🛍 PRODUTOS

${itens}

━━━━━━━━━━━━━━━

💳 PAGAMENTO

${cliente.pagamento}

━━━━━━━━━━━━━━━

💰 TOTAL DO PEDIDO

${total}

━━━━━━━━━━━━━━━

Pedido realizado através do site W.G Wear.

Aguardando pagamento.`;

  window.open(
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensagem)}`,
    "_blank"
  );
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeProductModal();
});

document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();
  renderCart();
});