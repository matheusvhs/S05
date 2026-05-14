// ========== VAGAS.JS ==========

let vagasData = [];
let candidaturasData = [];
let vagasFiltradas = [];

document.addEventListener('DOMContentLoaded', async () => {
    vagasData = await carregarJSON('../assets/data/vagas.json');
    candidaturasData = await carregarJSON('../assets/data/candidaturas.json');
    
    vagasFiltradas = [...vagasData];
    
    exibirVagas();
    atualizarEstatisticas();
    configurarFiltros();
    configurarEventListeners();
});

function exibirVagas() {
    const container = document.getElementById('vagasLista');
    
    if (!vagasFiltradas || vagasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="sem-vagas">
                <span class="material-symbols-outlined">search_off</span>
                <h3>Nenhuma vaga encontrada</h3>
                <p>Tente ajustar os filtros para ver mais oportunidades</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = vagasFiltradas.map(vaga => {
        const jaCandidatou = candidaturasData.some(c => c.vaga_id === vaga.id);
        const matchClass = vaga.match >= 85 ? 'alto' : vaga.match >= 70 ? 'medio' : 'baixo';
        
        return `
            <div class="vaga-card ${vaga.destaque ? 'destaque' : ''} ${jaCandidatou ? 'ja-candidatado' : ''} fade-in" data-vaga-id="${vaga.id}">
                <div class="vaga-header">
                    <div class="vaga-empresa-info">
                        <div class="empresa-logo">${vaga.logo}</div>
                        <div class="vaga-titulo-area">
                            <h3>${vaga.titulo}</h3>
                            <div class="vaga-empresa">${vaga.empresa}</div>
                            <div class="vaga-tags">
                                <span class="tag area">${vaga.area}</span>
                                <span class="tag modalidade">${vaga.modalidade}</span>
                                ${vaga.destaque ? '<span class="tag destaque">✨ Destaque</span>' : ''}
                            </div>
                        </div>
                    </div>
                    <div class="vaga-match">
                        <div class="match-circulo ${matchClass}">
                            ${vaga.match}%
                        </div>
                        <div class="match-label">Match</div>
                    </div>
                </div>
                
                <div class="vaga-info-grid">
                    <div class="vaga-info-item">
                        <span class="material-symbols-outlined">location_on</span>
                        <span>${vaga.localizacao}</span>
                    </div>
                    <div class="vaga-info-item">
                        <span class="material-symbols-outlined">payments</span>
                        <span>${vaga.bolsa}</span>
                    </div>
                    <div class="vaga-info-item">
                        <span class="material-symbols-outlined">schedule</span>
                        <span>${vaga.cargaHoraria}</span>
                    </div>
                    <div class="vaga-info-item">
                        <span class="material-symbols-outlined">calendar_today</span>
                        <span>${vaga.dataPublicacao}</span>
                    </div>
                </div>
                
                <div class="vaga-descricao-preview">
                    ${vaga.descricao}
                </div>
                
                <div class="vaga-footer">
                    <div class="vaga-candidatos">
                        <span class="material-symbols-outlined">group</span>
                        ${vaga.candidatos} candidatos
                    </div>
                    ${jaCandidatou 
                        ? '<div class="badge-candidatado"><span class="material-symbols-outlined">check_circle</span> Já candidatado</div>'
                        : '<button class="btn-ver-detalhes">Ver Detalhes <span class="material-symbols-outlined">arrow_forward</span></button>'
                    }
                </div>
            </div>
        `;
    }).join('');
    
    // Adicionar eventos aos cards
    document.querySelectorAll('.vaga-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-ver-detalhes') && !card.classList.contains('ja-candidatado')) {
                return;
            }
            const vagaId = parseInt(card.dataset.vagaId);
            abrirDetalhesVaga(vagaId);
        });
        
        const btnDetalhes = card.querySelector('.btn-ver-detalhes');
        if (btnDetalhes) {
            btnDetalhes.addEventListener('click', (e) => {
                e.stopPropagation();
                const vagaId = parseInt(card.dataset.vagaId);
                abrirDetalhesVaga(vagaId);
            });
        }
    });
}

function abrirDetalhesVaga(vagaId) {
    const vaga = vagasData.find(v => v.id === vagaId);
    if (!vaga) return;
    
    const jaCandidatou = candidaturasData.some(c => c.vaga_id === vaga.id);
    const matchClass = vaga.match >= 85 ? 'alto' : vaga.match >= 70 ? 'medio' : 'baixo';
    
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <div class="modal-vaga-header">
            <div class="modal-empresa-logo">${vaga.logo}</div>
            <h2>${vaga.titulo}</h2>
            <div class="empresa-nome">${vaga.empresa}</div>
            <div class="vaga-tags">
                <span class="tag area">${vaga.area}</span>
                <span class="tag modalidade">${vaga.modalidade}</span>
                ${vaga.destaque ? '<span class="tag destaque">✨ Destaque</span>' : ''}
            </div>
            <div class="vaga-match" style="margin-top: 15px;">
                <div class="match-circulo ${matchClass}" style="width: 90px; height: 90px; font-size: 1.8rem;">
                    ${vaga.match}%
                </div>
                <div class="match-label">Compatibilidade com seu perfil</div>
            </div>
        </div>
        
        <div class="modal-info-principal">
            <div class="info-item">
                <span class="material-symbols-outlined">location_on</span>
                <div class="info-label">Localização</div>
                <div class="info-valor">${vaga.localizacao}</div>
            </div>
            <div class="info-item">
                <span class="material-symbols-outlined">payments</span>
                <div class="info-label">Bolsa</div>
                <div class="info-valor">${vaga.bolsa}</div>
            </div>
            <div class="info-item">
                <span class="material-symbols-outlined">schedule</span>
                <div class="info-label">Carga Horária</div>
                <div class="info-valor">${vaga.cargaHoraria}</div>
            </div>
            <div class="info-item">
                <span class="material-symbols-outlined">group</span>
                <div class="info-label">Candidatos</div>
                <div class="info-valor">${vaga.candidatos}</div>
            </div>
        </div>
        
        <div class="secao-vaga">
            <h3><span class="material-symbols-outlined">description</span> Sobre a Vaga</h3>
            <p>${vaga.descricao}</p>
        </div>
        
        <div class="secao-vaga">
            <h3><span class="material-symbols-outlined">checklist</span> Requisitos</h3>
            <ul>
                ${vaga.requisitos.map(req => `<li>✓ ${req}</li>`).join('')}
            </ul>
        </div>
        
        <div class="secao-vaga">
            <h3><span class="material-symbols-outlined">work_outline</span> Atividades</h3>
            <ul>
                ${vaga.atividades.map(ativ => `<li>• ${ativ}</li>`).join('')}
            </ul>
        </div>
        
        <div class="secao-vaga">
            <h3><span class="material-symbols-outlined">star</span> Benefícios</h3>
            <ul>
                ${vaga.beneficios.map(ben => `<li>🎁 ${ben}</li>`).join('')}
            </ul>
        </div>
        
        <div class="candidatura-rapida">
            <div class="candidatura-info">
                <h4>Candidatura Rápida</h4>
                <p>${jaCandidatou ? 'Você já se candidatou a esta vaga!' : 'Envie seu perfil com um clique!'}</p>
            </div>
            <button class="btn-candidatar" id="btnCandidatar" ${jaCandidatou ? 'disabled' : ''} data-vaga-id="${vaga.id}">
                <span class="material-symbols-outlined">${jaCandidatou ? 'check_circle' : 'send'}</span>
                ${jaCandidatou ? 'Já Candidatado' : 'Candidatar Agora'}
            </button>
        </div>
    `;
    
    // Mostrar modal
    document.getElementById('modalVaga').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Configurar botão de candidatura
    if (!jaCandidatou) {
        document.getElementById('btnCandidatar').addEventListener('click', function() {
            candidatar(vagaId);
        });
    }
}

function candidatar(vagaId) {
    // Adicionar candidatura
    const novaCandidatura = {
        id: candidaturasData.length + 1,
        vaga_id: vagaId,
        data_candidatura: new Date().toLocaleDateString('pt-BR'),
        status: 'Em análise',
        status_codigo: 'analise'
    };
    
    candidaturasData.push(novaCandidatura);
    
    // Incrementar número de candidatos
    const vaga = vagasData.find(v => v.id === vagaId);
    if (vaga) {
        vaga.candidatos++;
    }
    
    // Fechar modal de detalhes
    document.getElementById('modalVaga').style.display = 'none';
    
    // Mostrar modal de confirmação
    document.getElementById('modalConfirmacao').style.display = 'flex';
    
    // Atualizar lista e estatísticas
    exibirVagas();
    atualizarEstatisticas();
}

function atualizarEstatisticas() {
    document.getElementById('totalVagas').textContent = vagasData.length;
    document.getElementById('totalCandidaturas').textContent = candidaturasData.length;
    document.getElementById('vagasDestaque').textContent = vagasData.filter(v => v.destaque).length;
}

function configurarFiltros() {
    const filtros = ['filtroArea', 'filtroModalidade', 'filtroBolsa', 'filtroOrdenar'];
    
    filtros.forEach(filtroId => {
        document.getElementById(filtroId).addEventListener('change', aplicarFiltros);
    });
    
    document.getElementById('limparFiltros').addEventListener('click', () => {
        filtros.forEach(filtroId => {
            document.getElementById(filtroId).value = filtroId === 'filtroOrdenar' ? 'match' : '';
        });
        aplicarFiltros();
    });
}

function aplicarFiltros() {
    const area = document.getElementById('filtroArea').value;
    const modalidade = document.getElementById('filtroModalidade').value;
    const bolsaMin = parseInt(document.getElementById('filtroBolsa').value) || 0;
    const ordenar = document.getElementById('filtroOrdenar').value;
    
    // Filtrar
    vagasFiltradas = vagasData.filter(vaga => {
        const bolsaValor = parseInt(vaga.bolsa.replace(/[^\d]/g, ''));
        
        return (
            (!area || vaga.area === area) &&
            (!modalidade || vaga.modalidade === modalidade) &&
            (bolsaValor >= bolsaMin)
        );
    });
    
    // Ordenar
    if (ordenar === 'match') {
        vagasFiltradas.sort((a, b) => b.match - a.match);
    } else if (ordenar === 'recente') {
        vagasFiltradas.sort((a, b) => {
            const dataA = a.dataPublicacao.split('/').reverse().join('');
            const dataB = b.dataPublicacao.split('/').reverse().join('');
            return dataB.localeCompare(dataA);
        });
    } else if (ordenar === 'bolsa') {
        vagasFiltradas.sort((a, b) => {
            const bolsaA = parseInt(a.bolsa.replace(/[^\d]/g, ''));
            const bolsaB = parseInt(b.bolsa.replace(/[^\d]/g, ''));
            return bolsaB - bolsaA;
        });
    }
    
    exibirVagas();
}

function configurarEventListeners() {
    // Fechar modais
    document.getElementById('fecharModal').addEventListener('click', fecharModalVaga);
    document.getElementById('voltarLista').addEventListener('click', fecharModalVaga);
    
    document.getElementById('modalVaga').addEventListener('click', (e) => {
        if (e.target.id === 'modalVaga') {
            fecharModalVaga();
        }
    });
    
    document.getElementById('btnOk').addEventListener('click', () => {
        document.getElementById('modalConfirmacao').style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    document.getElementById('modalConfirmacao').addEventListener('click', (e) => {
        if (e.target.id === 'modalConfirmacao') {
            document.getElementById('modalConfirmacao').style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

function fecharModalVaga() {
    document.getElementById('modalVaga').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Atalho de teclado para fechar modais
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        fecharModalVaga();
        document.getElementById('modalConfirmacao').style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

console.log('✅ Vagas.js carregado!');
