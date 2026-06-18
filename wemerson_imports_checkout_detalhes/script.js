const whatsappNumber = '5511997831644';

const products = [
  {
    id: 1,
    name: 'Camiseta Premium Oversized',
    price: 79.90,
    image: 'assets/Camiseta Primium Oversized Preta.png',
    category: 'Camiseta',
    description: 'Camiseta oversized com caimento moderno, tecido confortável e visual streetwear premium.',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Preta', 'Branca', 'Bege'],
    details: ['Algodão premium', 'Modelagem oversized', 'Gola reforçada', 'Ideal para looks casuais']
  },
  {
    id: 2,
    name: 'Camiseta Básica Algodão',
    price: 59.90,
    image: 'assets/camiseta-algodão.png',
    category: 'Camiseta',
    description: 'Camiseta básica versátil para o dia a dia, com toque macio e ótimo acabamento.',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Preta', 'Branca', 'Cinza'],
    details: ['Algodão confortável', 'Corte tradicional', 'Fácil de combinar', 'Peça essencial']
  },
  {
    id: 3,
    name: 'Moletom Premium',
    price: 149.90,
    image: 'assets/moletom-premium.png',
    category: 'Moletom',
    description: 'Moletom premium para dias frios, com visual elegante e acabamento reforçado.',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Cinza', 'Marrom'],
    details: ['Tecido encorpado', 'Capuz confortável', 'Punhos reforçados', 'Estilo urbano']
  },
  {
    id: 4,
    name: 'Bermuda Casual',
    price: 89.90,
    image: 'assets/bermuda-casual.png',
    category: 'Bermuda',
    description: 'Bermuda casual confortável, ideal para lazer, passeio e combinações modernas.',
    sizes: ['38', '40', '42', '44', '46'],
    colors: ['Preta', 'Bege', 'Cinza'],
    details: ['Confortável', 'Bolsos funcionais', 'Caimento casual', 'Boa durabilidade']
  },
  {
    id: 5,
    name: 'Calça Cargo Street',
    price: 129.90,
    image: 'assets/calca-cargo.png',
    category: 'Calça',
    description: 'Calça cargo com pegada street, bolsos laterais e presença visual marcante.',
    sizes: ['38', '40', '42', '44', '46'],
    colors: ['Preta', 'Verde militar', 'Caqui'],
    details: ['Bolsos cargo', 'Modelagem street', 'Tecido resistente', 'Visual moderno']
  },
  {
    id: 6,
    name: 'Boné',
    price: 49.90,
    image: 'assets/bone-basico.png',
    category: 'Acessório',
    description: 'Boné streetwear ajustável para completar o look com estilo.',
    sizes: ['Único ajustável'],
    colors: ['Preto', 'Branco', 'Azul marinho'],
    details: ['Ajustável', 'Aba curva', 'Visual urbano', 'Acabamento premium']
  }
  
  
];

let cart = [];
const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function renderProducts(){
  const area = document.getElementById('products');
  area.innerHTML = products.map(p => `
    <article class="product">
      <button class="product-click" onclick="openProductModal(${p.id})" aria-label="Ver detalhes de ${p.name}">
        <div class="product-img"><img src="${p.image}" alt="${p.name}"></div>
      </button>
      <div class="product-body">
        <span class="product-category">${p.category}</span>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="product-meta">
          <span>Tamanhos: ${p.sizes.join(', ')}</span>
          <span>Cores: ${p.colors.slice(0,3).join(', ')}</span>
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

function openProductModal(id){
  const p = products.find(product => product.id === id);
  if(!p) return;
  const modal = document.getElementById('productModal');
  const modalBody = document.getElementById('modalBody');

  modalBody.innerHTML = `
    <div class="modal-grid">
      <div class="modal-img"><img src="${p.image}" alt="${p.name}"></div>
      <div class="modal-info">
        <span class="product-category">${p.category}</span>
        <h2>${p.name}</h2>
        <p>${p.description}</p>
        <div class="price">${money(p.price)}</div>

        <div class="option-block">
          <strong>Tamanho</strong>
          <div class="option-list" id="modalSizes">
            ${p.sizes.map((size, index) => `<button class="option-btn ${index === 0 ? 'selected' : ''}" onclick="selectOption(this, 'size')">${size}</button>`).join('')}
          </div>
        </div>

        <div class="option-block">
          <strong>Cor</strong>
          <div class="option-list" id="modalColors">
            ${p.colors.map((color, index) => `<button class="option-btn ${index === 0 ? 'selected' : ''}" onclick="selectOption(this, 'color')">${color}</button>`).join('')}
          </div>
        </div>

        <div class="option-block">
          <strong>Forma de pagamento</strong>
          <div class="option-list" id="modalPayments">
            ${['PIX', 'Cartão de crédito', 'Cartão de débito'].map((payment, index) => `<button class="option-btn ${index === 0 ? 'selected' : ''}" onclick="selectOption(this, 'payment')">${payment}</button>`).join('')}
          </div>
        </div>

        <ul class="details-list">
          ${p.details.map(detail => `<li>${detail}</li>`).join('')}
        </ul>

        <button class="btn primary full" onclick="addModalProductToCart(${p.id})">Adicionar ao carrinho</button>
        <button class="btn secondary full" onclick="buyProductNow(${p.id})">Comprar agora pelo WhatsApp</button>
      </div>
    </div>
  `;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeProductModal(){
  const modal = document.getElementById('productModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function selectOption(button){
  const parent = button.parentElement;
  parent.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');
}

function getModalSelection(){
  const size = document.querySelector('#modalSizes .selected')?.textContent || '';
  const color = document.querySelector('#modalColors .selected')?.textContent || '';
  const payment = document.querySelector('#modalPayments .selected')?.textContent || 'PIX';
  return { size, color, payment };
}

function addModalProductToCart(id){
  const selection = getModalSelection();
  addToCart(id, selection.size, selection.color);
  document.getElementById('paymentMethod').value = selection.payment;
  closeProductModal();
}

function addToCart(id, size = '', color = ''){
  const product = products.find(p => p.id === id);
  if(!product) return;

  const chosenSize = size || product.sizes[0];
  const chosenColor = color || product.colors[0];
  const itemKey = `${id}-${chosenSize}-${chosenColor}`;
  const item = cart.find(i => i.key === itemKey);

  if(item) item.qty += 1;
  else cart.push({...product, key: itemKey, qty: 1, size: chosenSize, color: chosenColor});

  renderCart();
  document.getElementById('cart').classList.add('open');
}

function removeFromCart(key){
  cart = cart.filter(i => i.key !== key);
  renderCart();
}

function changeQty(key, action){
  const item = cart.find(i => i.key === key);
  if(!item) return;
  item.qty += action;
  if(item.qty <= 0) removeFromCart(key);
  renderCart();
}

function renderCart(){
  document.getElementById('cartCount').textContent = cart.reduce((a,i)=>a+i.qty,0);
  const items = document.getElementById('cartItems');

  if(cart.length === 0){
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

  const total = cart.reduce((a,i)=>a+(i.price*i.qty),0);
  document.getElementById('cartTotal').textContent = money(total);
}

function checkoutWhatsApp(){
  if(cart.length === 0){
    alert('Adicione pelo menos um produto ao carrinho.');
    return;
  }

  const payment = document.getElementById('paymentMethod').value;
  const lines = cart.map(i => `- ${i.qty}x ${i.name} | Tam: ${i.size} | Cor: ${i.color} | ${money(i.price)}`).join('%0A');
  const total = money(cart.reduce((a,i)=>a+(i.price*i.qty),0));
  const text = `Olá, quero finalizar meu pedido na W.G Wear:%0A%0A${lines}%0A%0AForma de pagamento: ${payment}%0ATotal: ${total}%0A%0APode confirmar disponibilidade, frete e prazo?`;
  window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
}

function enviarPedidoWhatsapp() {
  if (cart.length === 0) {
    alert("Adicione produtos ao carrinho.");
    return;
  }

  const camposObrigatorios = [
    "nomeCliente",
    "telefoneCliente",
    "cpfCliente",
    "cepCliente",
    "enderecoCliente",
    "numeroCliente",
    "complementoCliente",
    "bairroCliente",
    "cidadeCliente",
    "pagamentoCliente"
  ];

  for (const campo of camposObrigatorios) {
    const elemento = document.getElementById(campo);

    if (!elemento || !elemento.value.trim()) {
      alert("Por favor, preencha todos os campos antes de finalizar o pedido.");
      elemento.focus();
      return;
    }
  }

  const nome = document.getElementById("nomeCliente").value.trim();
  const telefone = document.getElementById("telefoneCliente").value.trim();
  const cpf = document.getElementById("cpfCliente").value.trim();
  const cep = document.getElementById("cepCliente").value.trim();
  const endereco = document.getElementById("enderecoCliente").value.trim();
  const numero = document.getElementById("numeroCliente").value.trim();
  const complemento = document.getElementById("complementoCliente").value.trim();
  const bairro = document.getElementById("bairroCliente").value.trim();
  const cidade = document.getElementById("cidadeCliente").value.trim();
  const pagamento = document.getElementById("pagamentoCliente").value.trim();

  const itens = cart.map(i =>
    `• ${i.qty}x ${i.name}
  Cor: ${i.color}
  Tamanho: ${i.size}
  Valor: ${money(i.price)}`
  ).join("\n\n");

  const total = money(
    cart.reduce((a, i) => a + (i.price * i.qty), 0)
  );

  const mensagem =
`🔥 NOVO PEDIDO - W.G WEAR

━━━━━━━━━━━━━━━

👤 DADOS DO CLIENTE

Nome: ${nome}
Telefone: ${telefone}
CPF: ${cpf}

━━━━━━━━━━━━━━━

📦 ENTREGA

${endereco}, ${numero}

Complemento: ${complemento}

Bairro: ${bairro}
Cidade: ${cidade}

CEP: ${cep}

━━━━━━━━━━━━━━━

🛍 PRODUTOS

${itens}

━━━━━━━━━━━━━━━

💳 PAGAMENTO

${pagamento}

━━━━━━━━━━━━━━━

💰 TOTAL DO PEDIDO

${total}

━━━━━━━━━━━━━━━

Pedido realizado através do site W.G Wear.

Aguardando envio do link de pagamento.`;

  window.open(
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensagem)}`,
    "_blank"
  );
}

function toggleCart(){ document.getElementById('cart').classList.toggle('open'); }
function toggleMenu(){ document.getElementById('menu').classList.toggle('open'); }

document.addEventListener('keydown', event => {
  if(event.key === 'Escape') closeProductModal();
});

renderProducts();
renderCart();
function abrirCheckout(){

    if(cart.length === 0){
        alert(
            "Adicione produtos ao carrinho."
        );
        return;
    }

    document
        .getElementById(
            "checkoutModal"
        )
        .classList
        .add(
            "active"
        );
}

function fecharCheckout(){

    document
        .getElementById(
            "checkoutModal"
        )
        .classList
        .remove(
            "active"
        );
}
async function finalizarPedidoMercadoPago() {
  if (cart.length === 0) {
    alert("Adicione produtos ao carrinho.");
    return;
  }

  const cliente = {
    nome: document.getElementById("nomeCliente")?.value || "",
    telefone: document.getElementById("telefoneCliente")?.value || "",
    cpf: document.getElementById("cpfCliente")?.value || "",
    cep: document.getElementById("cepCliente")?.value || "",
    endereco: document.getElementById("enderecoCliente")?.value || "",
    numero: document.getElementById("numeroCliente")?.value || "",
    complemento: document.getElementById("complementoCliente")?.value || "",
    bairro: document.getElementById("bairroCliente")?.value || "",
    cidade: document.getElementById("cidadeCliente")?.value || ""
  };

  try {
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
      return;
    }

    window.location.href = dados.sandbox || dados.linkPagamento;

  } catch (erro) {
    console.error(erro);
    alert("Erro ao conectar com o pagamento.");
  }
}