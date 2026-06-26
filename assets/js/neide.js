// ========== NEIDE.JS — Cardápio da Neide ==========

let cardapioData = [];
let avaliacoesData = [];
let diaAtivo = '';
let categoriaAtiva = 'Todos';
let notaSelecionada = 0;
let pratoAtualModal = null;

const DIAS = {
  seg: 'Segunda',
  ter: 'Terça',
  qua: 'Quarta',
  qui: 'Quinta',
  sex: 'Sexta'
};

document.addEventListener('DOMContentLoaded', async () => {
    cardapioData = await carregarJSON('../assets/data/cardapio.json') || [];
    avaliacoesData = await carregarJSON('../assets/data/avaliacoes_cardapio.json') || [];

    const diaSemana = getDiaSemana();
    diaAtivo = ['seg', 'ter', 'qua', 'qui', 'sex'].includes(diaSemana) ? diaSemana : 'seg';

    renderTabs();
    renderCategorias();
    renderPratos();
    renderTop3();
    atualizarEstatisticas();
    configurarModal();
});

// ---------- Tabs de dia ----------
function renderTabs() {
    const container = document.getElementById('diasScroll');
    container.innerHTML = Object.entries(DIAS).map(([cod, nome]) => `
        <button class="tab-dia ${cod === diaAtivo ? 'ativo' : ''}" data-dia="${cod}">
            ${nome}
        </button>
    `).join('');

    container.querySelectorAll('.tab-dia').forEach(btn => {
        btn.addEventListener('click', () => {
            diaAtivo = btn.getAttribute('data-dia');
            container.querySelectorAll('.tab-dia').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            categoriaAtiva = 'Todos';
            renderCategorias();
            renderPratos();
            atualizarEstatisticas();
        });
    });
}

// ---------- Chips de categoria ----------
function renderCategorias() {
    const categorias = ['Todos', 'Lanches', 'Refeições', 'Bebidas', 'Sobremesas'];
    const container = document.getElementById('categoriasScroll');
    container.innerHTML = categorias.map(cat => `
        <button class="categoria-chip ${cat === categoriaAtiva ? 'ativo' : ''}" data-cat="${cat}">
            ${cat === 'Todos' ? '🍽️' : ''} ${cat}
        </button>
    `).join('');

    container.querySelectorAll('.categoria-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            categoriaAtiva = btn.getAttribute('data-cat');
            container.querySelectorAll('.categoria-chip').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            renderPratos();
        });
    });
}

// ---------- Grade de pratos ----------
function filtrarPratos() {
    return cardapioData.filter(p => {
        const nodia = p.prato_do_dia.includes(diaAtivo);
        const nacategoria = categoriaAtiva === 'Todos' || p.categoria === categoriaAtiva;
        return nodia && nacategoria;
    });
}

function calcularMedia(prato) {
    if (!prato.total_avaliacoes) return null;
    return (prato.soma_avaliacoes / prato.total_avaliacoes);
}

function renderEstrelas(media, tamanho = 'pequeno') {
    if (media === null) return '<span style="font-size:0.72rem;color:var(--cor-texto-secundario)">Sem avaliação</span>';
    const cheias = Math.floor(media);
    const meia = (media - cheias) >= 0.5;
    const vazias = 5 - cheias - (meia ? 1 : 0);
    const f = tamanho === 'grande' ? '1.3rem' : '0.75rem';
    return `
        <span style="color:#f4a62a;font-size:${f}">
            ${'★'.repeat(cheias)}${meia ? '½' : ''}${'☆'.repeat(vazias)}
        </span>
    `;
}

function idMaisPedido() {
    if (!cardapioData.length) return null;
    return cardapioData.reduce((acc, p) => p.total_avaliacoes > acc.total_avaliacoes ? p : acc).id;
}

function renderPratos() {
    const grid = document.getElementById('pratosGrid');
    const titulo = document.getElementById('pratosSecaoTitulo');
    const lista = filtrarPratos();
    const maisPedidoId = idMaisPedido();

    titulo.textContent = `${DIAS[diaAtivo]} — ${lista.length} ${lista.length === 1 ? 'prato disponível' : 'pratos disponíveis'}`;

    if (!lista.length) {
        grid.innerHTML = `
            <div class="sem-pratos">
                <span class="material-symbols-outlined">restaurant_menu</span>
                <h3>Nenhum prato disponível</h3>
                <p>Tente outro dia ou outra categoria.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = lista.map(prato => {
        const media = calcularMedia(prato);
        const jaAvaliou = avaliacoesData.some(a => a.prato_id === prato.id);
        const ehMaisPedido = prato.id === maisPedidoId;

        return `
            <div class="prato-card fade-in" data-prato-id="${prato.id}">
                <div class="prato-badges">
                    ${prato.prato_do_dia.includes(diaAtivo) ? '<span class="badge-prato-dia">🌟 Prato do Dia</span>' : ''}
                    ${ehMaisPedido ? '<span class="badge-mais-pedido">🏆 Mais Pedido</span>' : ''}
                </div>
                <div class="prato-emoji">${prato.emoji}</div>
                <div class="prato-nome">${prato.nome}</div>
                <div class="prato-preco">R$ ${prato.preco.toFixed(2).replace('.', ',')}</div>
                <div class="prato-estrelas-row">
                    <div class="estrelas-texto">${renderEstrelas(media)}</div>
                    <span class="avaliacao-count">(${prato.total_avaliacoes})</span>
                </div>
                ${jaAvaliou ? '<div style="font-size:0.65rem;color:var(--cor-sucesso);text-align:center;font-weight:600">✓ Avaliado</div>' : ''}
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.prato-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.getAttribute('data-prato-id'));
            abrirModal(id);
        });
    });
}

// ---------- Top 3 ----------
function renderTop3() {
    const lista = document.getElementById('top3Lista');
    const top3 = [...cardapioData]
        .filter(p => p.total_avaliacoes > 0)
        .sort((a, b) => calcularMedia(b) - calcularMedia(a))
        .slice(0, 3);

    const medalhas = [
        { cls: 'ouro', emoji: '🥇' },
        { cls: 'prata', emoji: '🥈' },
        { cls: 'bronze', emoji: '🥉' }
    ];

    lista.innerHTML = top3.map((prato, i) => {
        const media = calcularMedia(prato);
        return `
            <div class="top3-item" data-prato-id="${prato.id}">
                <div class="top3-posicao ${medalhas[i].cls}">${medalhas[i].emoji}</div>
                <div class="top3-emoji">${prato.emoji}</div>
                <div class="top3-info">
                    <div class="top3-nome">${prato.nome}</div>
                    <div class="top3-categoria">${prato.categoria}</div>
                </div>
                <div class="top3-media">
                    <span class="material-symbols-outlined" style="font-size:16px;color:#f4a62a">star</span>
                    ${media.toFixed(1)}
                </div>
            </div>
        `;
    }).join('');

    lista.querySelectorAll('.top3-item').forEach(item => {
        item.addEventListener('click', () => {
            abrirModal(parseInt(item.getAttribute('data-prato-id')));
        });
    });
}

// ---------- Estatísticas ----------
function atualizarEstatisticas() {
    const totalPratos = cardapioData.length;
    const pratosHoje = cardapioData.filter(p => p.prato_do_dia.includes(diaAtivo)).length;
    const melhorAvaliado = cardapioData
        .filter(p => p.total_avaliacoes > 0)
        .reduce((acc, p) => {
            const m = calcularMedia(p);
            return m > calcularMedia(acc) ? p : acc;
        }, cardapioData.find(p => p.total_avaliacoes > 0) || cardapioData[0]);

    document.getElementById('statTotalPratos').textContent = totalPratos;
    document.getElementById('statPratosHoje').textContent = pratosHoje;
    const mediaTop = melhorAvaliado ? calcularMedia(melhorAvaliado) : null;
    document.getElementById('statMelhorAvaliado').textContent = mediaTop ? `★ ${mediaTop.toFixed(1)}` : '—';
}

// ---------- Modal ----------
function configurarModal() {
    document.getElementById('modalFechar').addEventListener('click', fecharModal);
    document.getElementById('modalNeideOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'modalNeideOverlay') fecharModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharModal();
    });
}

function abrirModal(pratoId) {
    const prato = cardapioData.find(p => p.id === pratoId);
    if (!prato) return;
    pratoAtualModal = prato;
    notaSelecionada = 0;

    const jaAvaliou = avaliacoesData.some(a => a.prato_id === pratoId);
    const media = calcularMedia(prato);

    document.getElementById('modalEmoji').textContent = prato.emoji;
    document.getElementById('modalNome').textContent = prato.nome;
    document.getElementById('modalPreco').textContent = `R$ ${prato.preco.toFixed(2).replace('.', ',')}`;
    document.getElementById('modalDescricao').textContent = prato.descricao;

    // Badges
    const badgesEl = document.getElementById('modalBadges');
    const ehPratoDia = prato.prato_do_dia.includes(diaAtivo);
    badgesEl.innerHTML = `
        <span class="modal-categoria-tag">${prato.categoria}</span>
        ${ehPratoDia ? '<span class="badge-prato-dia">🌟 Prato do Dia</span>' : ''}
    `;

    // Ingredientes
    document.getElementById('modalIngredientes').innerHTML = prato.ingredientes.map(
        i => `<span class="modal-tag">${i}</span>`
    ).join('');

    // Alérgicos
    const alergicosEl = document.getElementById('modalAlergicos');
    if (prato.alergicos.length) {
        alergicosEl.innerHTML = prato.alergicos.map(
            a => `<span class="modal-tag modal-tag-alergico">⚠️ ${a}</span>`
        ).join('');
        document.getElementById('modalAlergicosSection').style.display = '';
    } else {
        document.getElementById('modalAlergicosSection').style.display = 'none';
    }

    // Avaliação atual
    document.getElementById('modalMediaNumero').textContent = media !== null ? media.toFixed(1) : '—';
    document.getElementById('modalEstrelasVisuais').innerHTML = renderEstrelas(media, 'grande');
    document.getElementById('modalTotalAvaliacoes').textContent = `${prato.total_avaliacoes} avaliações`;

    // Seção de avaliar
    renderSecaoAvaliar(jaAvaliou);

    // Abre overlay
    const overlay = document.getElementById('modalNeideOverlay');
    overlay.classList.add('aberto');
    document.body.style.overflow = 'hidden';
}

function renderSecaoAvaliar(jaAvaliou) {
    const secao = document.getElementById('avaliarSection');
    if (jaAvaliou) {
        secao.classList.add('ja-avaliado');
        secao.innerHTML = `
            <div class="avaliado-msg">
                <span class="material-symbols-outlined">check_circle</span>
                Você já avaliou este prato. Obrigado!
            </div>
        `;
        return;
    }

    secao.classList.remove('ja-avaliado');
    secao.innerHTML = `
        <div class="avaliar-titulo">Como foi este prato?</div>
        <div class="estrelas-interativas" id="estrelasInterativas">
            ${[1, 2, 3, 4, 5].map(n => `
                <button class="estrela-btn" data-nota="${n}" aria-label="${n} estrela${n > 1 ? 's' : ''}">★</button>
            `).join('')}
        </div>
        <button class="btn-avaliar" id="btnAvaliar" disabled>
            <span class="material-symbols-outlined">star</span>
            Avaliar
        </button>
    `;

    const estrelas = secao.querySelectorAll('.estrela-btn');

    estrelas.forEach(estrela => {
        const nota = parseInt(estrela.getAttribute('data-nota'));

        estrela.addEventListener('mouseenter', () => {
            estrelas.forEach((e, i) => {
                e.style.color = i < nota ? '#f4a62a' : 'var(--cor-borda)';
                e.style.transform = i < nota ? 'scale(1.15)' : '';
            });
        });

        estrela.addEventListener('mouseleave', () => {
            atualizarEstrelasVisuais(notaSelecionada, estrelas);
        });

        estrela.addEventListener('click', () => {
            notaSelecionada = nota;
            atualizarEstrelasVisuais(nota, estrelas);
            document.getElementById('btnAvaliar').disabled = false;
        });
    });

    document.getElementById('btnAvaliar').addEventListener('click', () => {
        if (notaSelecionada > 0 && pratoAtualModal) {
            avaliarPrato(pratoAtualModal.id, notaSelecionada);
        }
    });
}

function atualizarEstrelasVisuais(nota, estrelas) {
    estrelas.forEach((e, i) => {
        e.style.color = i < nota ? '#f4a62a' : 'var(--cor-borda)';
        e.style.transform = i < nota ? 'scale(1.1)' : '';
    });
}

function avaliarPrato(pratoId, nota) {
    if (avaliacoesData.some(a => a.prato_id === pratoId)) {
        mostrarToast('Você já avaliou este prato!', 'alerta');
        return;
    }

    const prato = cardapioData.find(p => p.id === pratoId);
    prato.soma_avaliacoes += nota;
    prato.total_avaliacoes += 1;
    avaliacoesData.push({ prato_id: pratoId, nota });

    // Atualiza avaliação no modal
    const novaMedia = calcularMedia(prato);
    document.getElementById('modalMediaNumero').textContent = novaMedia.toFixed(1);
    document.getElementById('modalEstrelasVisuais').innerHTML = renderEstrelas(novaMedia, 'grande');
    document.getElementById('modalTotalAvaliacoes').textContent = `${prato.total_avaliacoes} avaliações`;
    renderSecaoAvaliar(true);

    // Atualiza card na lista
    const card = document.querySelector(`.prato-card[data-prato-id="${pratoId}"]`);
    if (card) {
        const estrelasEl = card.querySelector('.estrelas-texto');
        const countEl = card.querySelector('.avaliacao-count');
        if (estrelasEl) estrelasEl.innerHTML = renderEstrelas(novaMedia);
        if (countEl) countEl.textContent = `(${prato.total_avaliacoes})`;
    }

    renderTop3();
    atualizarEstatisticas();
    mostrarToast(`Avaliação de ${nota} estrela${nota > 1 ? 's' : ''} registrada! Obrigado 😊`, 'sucesso');
}

function fecharModal() {
    document.getElementById('modalNeideOverlay').classList.remove('aberto');
    document.body.style.overflow = 'auto';
    pratoAtualModal = null;
    notaSelecionada = 0;
}

console.log('✅ Neide.js carregado!');
