// ========== MATÉRIAS.JS ==========

let materiasData = [];
let notasData = [];
let frequenciaData = [];

document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    exibirResumo();
    exibirMaterias();
});

async function carregarDados() {
    materiasData = await carregarJSON('../assets/data/materias.json');
    notasData = await carregarJSON('../assets/data/notas.json');
    frequenciaData = await carregarJSON('../assets/data/frequencia.json');
}

function exibirResumo() {
    if (!materiasData) return;
    
    const totalMaterias = materiasData.length;
    const totalCreditos = materiasData.reduce((acc, m) => acc + m.creditos, 0);
    const cargaHoraria = materiasData.reduce((acc, m) => acc + m.carga_horaria, 0);
    
    document.getElementById('totalMaterias').textContent = totalMaterias;
    document.getElementById('totalCreditos').textContent = totalCreditos;
    document.getElementById('cargaHoraria').textContent = `${cargaHoraria}h`;
}

function exibirMaterias() {
    const container = document.getElementById('materiasContainer');
    if (!container || !materiasData) return;
    
    mostrarLoading(container);
    
    container.innerHTML = '';
    
    materiasData.forEach(materia => {
        const nota = notasData?.find(n => n.materia_id === materia.id);
        const freq = frequenciaData?.find(f => f.materia_id === materia.id);
        
        const card = document.createElement('div');
        card.className = 'materia-card fade-in';
        
        card.innerHTML = `
            <div class="materia-header">
                <div class="materia-codigo">${materia.codigo}</div>
            </div>
            <div class="materia-nome">${materia.nome}</div>
            <div class="materia-professor">
                <span class="material-symbols-outlined icon-small">person</span>
                ${materia.professor}
            </div>
            
            <div class="materia-info">
                <div class="materia-info-item">
                    <span class="material-symbols-outlined icon-small">school</span>
                    ${materia.creditos} créditos
                </div>
                <div class="materia-info-item">
                    <span class="material-symbols-outlined icon-small">schedule</span>
                    ${materia.carga_horaria}h
                </div>
            </div>
            
            ${nota || freq ? `
            <div class="materia-stats">
                ${nota ? `
                <div class="materia-stat">
                    <div class="materia-stat-valor" style="color: ${getCorNota(nota.cr)};">${nota.cr}</div>
                    <div class="materia-stat-label">CR</div>
                </div>
                ` : ''}
                ${freq ? `
                <div class="materia-stat">
                    <div class="materia-stat-valor" style="color: ${getCorFrequencia(freq.status)};">
                        ${freq.percentual_presenca.toFixed(0)}%
                    </div>
                    <div class="materia-stat-label">Frequência</div>
                </div>
                <div class="materia-stat">
                    <div class="materia-stat-valor" style="color: ${getCorFrequencia(freq.status)};">
                        ${freq.faltas}/${freq.limite_faltas}
                    </div>
                    <div class="materia-stat-label">Faltas</div>
                </div>
                ` : ''}
            </div>
            ` : ''}
            
            <div class="materia-ementa">
                <strong>Ementa:</strong> ${materia.ementa}
            </div>
            
            <button class="expandir-btn">
                <span>Ver mais</span>
                <span class="material-symbols-outlined">expand_more</span>
            </button>
        `;
        
        const btnExpandir = card.querySelector('.expandir-btn');
        btnExpandir.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.toggle('expandido');
            const texto = card.classList.contains('expandido') ? 'Ver menos' : 'Ver mais';
            btnExpandir.querySelector('span:first-child').textContent = texto;
        });
        
        container.appendChild(card);
    });
}

console.log('✅ Materias.js carregado!');
