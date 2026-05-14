// ========== DASHBOARD.JS ==========

let eventosData = [];
let currentEventIndex = 0;
let carouselTimer;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', async () => {
    // Exibir data atual
    exibirDataAtual();
    
    // Carregar dados do aluno
    await carregarDadosAluno();
    
    // Carregar notificações
    await carregarNotificacoes();
    
    // Carregar eventos
    await carregarEventos();
    
    // Carregar estatísticas
    await carregarEstatisticas();
});

// ========== DATA ATUAL ==========
function exibirDataAtual() {
    const dataAtualElement = document.getElementById('dataAtual');
    if (dataAtualElement) {
        const hoje = new Date();
        dataAtualElement.textContent = formatarData(hoje);
    }
}

// ========== DADOS DO ALUNO ==========
async function carregarDadosAluno() {
    const aluno = await carregarJSON('assets/data/aluno.json');
    if (aluno) {
        const nomeElement = document.getElementById('nomeAluno');
        if (nomeElement) {
            nomeElement.textContent = aluno.nome;
        }
    }
}

// ========== NOTIFICAÇÕES ==========
async function carregarNotificacoes() {
    const container = document.getElementById('notificacoesContainer');
    if (!container) return;
    
    mostrarLoading(container);
    
    const notificacoes = await carregarJSON('assets/data/notificacoes.json');
    
    if (!notificacoes || notificacoes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--cor-texto-secundario); padding: 20px;">Nenhuma notificação no momento.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    // Mostrar apenas notificações não lidas primeiro, depois as lidas (max 5 no total)
    const naoLidas = notificacoes.filter(n => !n.lida);
    const lidas = notificacoes.filter(n => n.lida);
    const todasNotificacoes = [...naoLidas, ...lidas].slice(0, 5);
    
    todasNotificacoes.forEach(notif => {
        const notifElement = document.createElement('div');
        notifElement.className = `notificacao-item ${notif.tipo} ${notif.lida ? 'lida' : ''}`;
        
        notifElement.innerHTML = `
            <div class="notificacao-icon">
                <span class="material-symbols-outlined">${notif.icone}</span>
            </div>
            <div class="notificacao-content">
                <div class="notificacao-mensagem">${notif.mensagem}</div>
                <div class="notificacao-data">${notif.data}</div>
            </div>
        `;
        
        // Adicionar link se houver
        if (notif.link) {
            notifElement.style.cursor = 'pointer';
            notifElement.addEventListener('click', () => {
                window.location.href = notif.link;
            });
        }
        
        container.appendChild(notifElement);
    });
}

// ========== CARROSSEL DE EVENTOS ==========
async function carregarEventos() {
    const carousel = document.getElementById('carousel');
    const indicators = document.getElementById('carouselIndicators');
    
    if (!carousel || !indicators) return;
    
    mostrarLoading(carousel);
    
    eventosData = await carregarJSON('assets/data/eventos.json');
    
    if (!eventosData || eventosData.length === 0) {
        carousel.innerHTML = '<p style="text-align: center; color: var(--cor-texto-secundario); padding: 40px;">Nenhum evento disponível.</p>';
        return;
    }
    
    carousel.innerHTML = '';
    indicators.innerHTML = '';
    
    eventosData.forEach((evento, index) => {
        // Criar card do evento
        const card = document.createElement('div');
        card.className = 'carousel-card';
        card.innerHTML = `
            <img src="${evento.imagem}" alt="${evento.titulo}" onerror="this.src='https://via.placeholder.com/800x400?text=Evento'">
            <div class="carousel-info">
                <h3>${evento.titulo}</h3>
                <p>${evento.descricao}</p>
                <div class="carousel-detalhes">
                    <div>
                        <span class="material-symbols-outlined icon-small">event</span>
                        ${evento.data} às ${evento.horario}
                    </div>
                    <div>
                        <span class="material-symbols-outlined icon-small">location_on</span>
                        ${evento.local}
                    </div>
                </div>
            </div>
        `;
        carousel.appendChild(card);
        
        // Criar indicador
        const indicator = document.createElement('div');
        indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
        indicator.addEventListener('click', () => irParaEvento(index));
        indicators.appendChild(indicator);
    });
    
    // Configurar controles do carrossel
    document.getElementById('prevBtn')?.addEventListener('click', eventoAnterior);
    document.getElementById('nextBtn')?.addEventListener('click', proximoEvento);
    
    // Auto-play
    iniciarAutoPlay();
    
    // Pausar auto-play ao passar o mouse
    carousel.addEventListener('mouseenter', pararAutoPlay);
    carousel.addEventListener('mouseleave', iniciarAutoPlay);
}

function proximoEvento() {
    currentEventIndex = (currentEventIndex + 1) % eventosData.length;
    atualizarCarrossel();
}

function eventoAnterior() {
    currentEventIndex = (currentEventIndex - 1 + eventosData.length) % eventosData.length;
    atualizarCarrossel();
}

function irParaEvento(index) {
    currentEventIndex = index;
    atualizarCarrossel();
}

function atualizarCarrossel() {
    const carousel = document.getElementById('carousel');
    const indicators = document.querySelectorAll('.indicator');
    
    if (carousel) {
        carousel.style.transform = `translateX(-${currentEventIndex * 100}%)`;
    }
    
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentEventIndex);
    });
}

function iniciarAutoPlay() {
    pararAutoPlay();
    carouselTimer = setInterval(proximoEvento, 5000);
}

function pararAutoPlay() {
    if (carouselTimer) {
        clearInterval(carouselTimer);
    }
}

// Touch events para mobile
let touchStartX = 0;
let touchEndX = 0;

document.getElementById('carousel')?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.getElementById('carousel')?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        proximoEvento();
    }
    if (touchEndX > touchStartX + 50) {
        eventoAnterior();
    }
}

// ========== ESTATÍSTICAS ==========
async function carregarEstatisticas() {
    const materias = await carregarJSON('assets/data/materias.json');
    const notas = await carregarJSON('assets/data/notas.json');
    const frequencia = await carregarJSON('assets/data/frequencia.json');
    
    // Número de matrícula
    const statMatriculas = document.getElementById('statMatriculas');
    if (statMatriculas && materias) {
        statMatriculas.textContent = materias.length;
    }
    
    // CR Médio
    const statMedia = document.getElementById('statMedia');
    if (statMedia && notas) {
        const crs = notas.map(n => n.cr).filter(cr => cr > 0);
        const media = crs.length > 0 ? (crs.reduce((a, b) => a + b, 0) / crs.length).toFixed(1) : '0.0';
        statMedia.textContent = media;
    }
    
    // Frequência Média
    const statFrequencia = document.getElementById('statFrequencia');
    if (statFrequencia && frequencia) {
        const frequencias = frequencia.map(f => f.percentual_presenca);
        const mediaFreq = frequencias.length > 0 ? (frequencias.reduce((a, b) => a + b, 0) / frequencias.length).toFixed(0) : '0';
        statFrequencia.textContent = `${mediaFreq}%`;
    }
}

console.log('✅ Dashboard.js carregado com sucesso!');
