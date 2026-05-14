// ========== CALENDARIO.JS ==========

let horariosData = [];
let materiasSelecionadas = [];
let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', async () => {
    horariosData = await carregarJSON('../assets/data/horarios.json');
    materiasSelecionadas = await carregarJSON('../assets/data/materias.json');
    renderizarCalendario();
    
    // Event listeners para navegação de meses
    document.getElementById('mesPrev').addEventListener('click', () => {
        mesAtual--;
        if (mesAtual < 0) {
            mesAtual = 11;
            anoAtual--;
        }
        renderizarCalendario();
    });
    
    document.getElementById('mesNext').addEventListener('click', () => {
        mesAtual++;
        if (mesAtual > 11) {
            mesAtual = 0;
            anoAtual++;
        }
        renderizarCalendario();
    });
    
    // Fechar detalhes
    document.getElementById('fecharDetalhes').addEventListener('click', () => {
        document.getElementById('detalhesDiaContainer').style.display = 'none';
    });
    
    document.getElementById('detalhesDiaContainer').addEventListener('click', (e) => {
        if (e.target.id === 'detalhesDiaContainer') {
            document.getElementById('detalhesDiaContainer').style.display = 'none';
        }
    });
});

function renderizarCalendario() {
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    document.getElementById('mesAnoAtual').textContent = `${meses[mesAtual]} ${anoAtual}`;
    
    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();
    
    const calendarioGrid = document.getElementById('calendarioGrid');
    
    // Limpar células anteriores (manter cabeçalhos)
    while (calendarioGrid.children.length > 7) {
        calendarioGrid.removeChild(calendarioGrid.lastChild);
    }
    
    // Adicionar dias do mês anterior
    const ultimoDiaMesAnterior = new Date(anoAtual, mesAtual, 0).getDate();
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
        const diaCell = criarCelulaADia(ultimoDiaMesAnterior - i, true);
        calendarioGrid.appendChild(diaCell);
    }
    
    // Adicionar dias do mês atual
    for (let dia = 1; dia <= diasNoMes; dia++) {
        const diaCell = criarCelulaADia(dia, false);
        calendarioGrid.appendChild(diaCell);
    }
    
    // Adicionar dias do próximo mês para completar a grade
    const celulasPreenchidas = diaSemanaInicio + diasNoMes;
    const celulasFaltando = celulasPreenchidas % 7 === 0 ? 0 : 7 - (celulasPreenchidas % 7);
    for (let dia = 1; dia <= celulasFaltando; dia++) {
        const diaCell = criarCelulaADia(dia, true);
        calendarioGrid.appendChild(diaCell);
    }
}

function criarCelulaADia(dia, outroMes) {
    const diaCell = document.createElement('div');
    diaCell.className = 'dia-cell';
    
    if (outroMes) {
        diaCell.classList.add('outro-mes');
    }
    
    const hoje = new Date();
    if (!outroMes && dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear()) {
        diaCell.classList.add('hoje');
    }
    
    const diaNumero = document.createElement('div');
    diaNumero.className = 'dia-numero';
    diaNumero.textContent = dia;
    diaCell.appendChild(diaNumero);
    
    if (!outroMes) {
        const data = new Date(anoAtual, mesAtual, dia);
        const aulas = obterAulasDoDia(data);
        
        if (aulas.length > 0) {
            diaCell.classList.add('com-aula');
            const indicador = document.createElement('div');
            indicador.className = 'dia-indicador';
            indicador.textContent = `${aulas.length} aula${aulas.length > 1 ? 's' : ''}`;
            diaCell.appendChild(indicador);
        }
        
        diaCell.addEventListener('click', () => {
            mostrarDetalhesDia(data, aulas);
        });
    }
    
    return diaCell;
}

function obterAulasDoDia(data) {
    const diasSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    const diaSemana = diasSemana[data.getDay()];
    
    const diaHorario = horariosData.find(h => h.dia_cod === diaSemana);
    return diaHorario ? diaHorario.aulas : [];
}

function mostrarDetalhesDia(data, aulas) {
    const diasSemanaCompleto = [
        'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
        'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];
    
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const titulo = `${diasSemanaCompleto[data.getDay()]}, ${data.getDate()} de ${meses[data.getMonth()]} de ${data.getFullYear()}`;
    document.getElementById('detalhesDiaTitle').textContent = titulo;
    
    const content = document.getElementById('detalhesDiaContent');
    
    if (aulas.length === 0) {
        content.innerHTML = `
            <div class="sem-aulas">
                <span class="material-symbols-outlined">event_busy</span>
                <h3>Sem aulas neste dia</h3>
                <p>Aproveite para estudar ou descansar! 😊</p>
            </div>
        `;
    } else {
        content.innerHTML = aulas.map(aula => {
            const materia = materiasSelecionadas.find(m => m.id === aula.materia_id);
            const professor = materia ? materia.professor : 'N/A';
            
            return `
                <div class="aula-detalhes ${aula.tipo.toLowerCase()}">
                    <h3>${aula.materia}</h3>
                    <div class="aula-codigo">${aula.codigo}</div>
                    
                    <div class="aula-info-grid">
                        <div class="aula-info-item">
                            <span class="material-symbols-outlined">schedule</span>
                            <span>${aula.horario}</span>
                        </div>
                        <div class="aula-info-item">
                            <span class="material-symbols-outlined">meeting_room</span>
                            <span>Sala ${aula.sala}</span>
                        </div>
                        <div class="aula-info-item">
                            <span class="material-symbols-outlined">school</span>
                            <span>${aula.tipo}</span>
                        </div>
                        <div class="aula-info-item">
                            <span class="material-symbols-outlined">person</span>
                            <span>${professor}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    document.getElementById('detalhesDiaContainer').style.display = 'flex';
}

console.log('✅ Calendario.js carregado!');
