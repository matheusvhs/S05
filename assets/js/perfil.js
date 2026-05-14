// ========== PERFIL.JS ==========

let alunoData = null;

document.addEventListener('DOMContentLoaded', async () => {
    alunoData = await carregarJSON('../assets/data/aluno.json');
    exibirPerfil();
    configurarTemas();
});

function exibirPerfil() {
    if (!alunoData) return;
    
    document.getElementById('perfilFoto').src = alunoData.foto;
    document.getElementById('perfilNome').textContent = `${alunoData.nome} ${alunoData.sobrenome}`;
    document.getElementById('perfilCurso').textContent = alunoData.curso;
    document.getElementById('perfilPeriodo').textContent = alunoData.periodo;
    
    document.getElementById('infoMatricula').textContent = alunoData.matricula;
    document.getElementById('infoCurso').textContent = alunoData.curso;
    document.getElementById('infoPeriodo').textContent = alunoData.periodo;
    document.getElementById('infoEmail').textContent = alunoData.email;
    document.getElementById('infoTelefone').textContent = alunoData.telefone;
}

function configurarTemas() {
    const temaAtual = localStorage.getItem('theme') || 'inatel';
    
    document.querySelectorAll('.tema-option').forEach(option => {
        const tema = option.getAttribute('data-theme');
        if (tema === temaAtual) {
            option.classList.add('ativo');
        }
        
        option.addEventListener('click', () => {
            document.querySelectorAll('.tema-option').forEach(opt => opt.classList.remove('ativo'));
            option.classList.add('ativo');
            
            document.documentElement.setAttribute('data-theme', tema);
            localStorage.setItem('theme', tema);
            
            mostrarToast(`Tema ${tema === 'inatel' ? 'Inatel' : tema === 'limao' ? 'Limão' : 'Dark'} aplicado!`);
        });
    });
}

console.log('✅ Perfil.js carregado!');
