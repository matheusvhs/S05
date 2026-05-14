class AulasComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.loadData();
    }

    async loadData() {
        try {
            const hoje = getDiaSemana();

            const [horarios, notas, frequencia] = await Promise.all([
                fetch('assets/data/horarios.json').then(r => r.json()),
                fetch('assets/data/notas.json').then(r => r.json()),
                fetch('assets/data/frequencia.json').then(r => r.json()),
            ]);

            const diaHoje = horarios.find(h => h.dia_cod === hoje);
            this.render(diaHoje?.aulas || [], notas, frequencia);
        } catch (error) {
            console.error('Erro ao carregar os dados das aulas:', error);
        }
    }

    corNota(cr) {
        if (cr < 60) return 'background-color: red;';
        if (cr < 80) return 'background-color: orange;';
        return 'background-color: green;';
    }

    verificarProvaHoje(nota) {
        if (!nota?.avaliacoes) return false;
        const hoje = new Date();
        const hojeStr = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
        return nota.avaliacoes.some(av => av.data === hojeStr);
    }

    render(aulas, notas, frequencia) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'assets/css/style_componente.css';
        this.shadowRoot.appendChild(link);

        if (aulas.length === 0) {
            this.shadowRoot.innerHTML += '<p style="text-align:center;padding:20px;color:gray;">Não há aulas hoje! 😊</p>';
            return;
        }

        const content = `
            <div>
                ${aulas.map(a => {
                    const nota = notas?.find(n => n.materia_id === a.materia_id);
                    const freq = frequencia?.find(f => f.materia_id === a.materia_id);
                    const cr = nota?.cr ?? 0;
                    const temProvaHoje = this.verificarProvaHoje(nota);
                    const provaDisplay = temProvaHoje ? '' : 'display: none;';

                    return `
                        <div class="comp-aula">
                            <div class="lable-prova p_lable" style="${provaDisplay}">⚠️ PROVA HOJE</div>
                            <div class="titulo_aula">${a.materia}</div>
                            <p class="p">Local e Horário: <b>${a.sala} - ${a.horario}</b></p>
                            <div class="lables">
                                <div class="lable-frequencia p_lable">FALTAS: <b>${freq ? freq.faltas + '/' + freq.total_aulas : '-'}</b></div>
                                <div class="lable-nota p_lable" style="${this.corNota(cr)}">CR: <b>${cr}</b></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        this.shadowRoot.innerHTML += content;
    }
}

customElements.define('aulas-component', AulasComponent);
