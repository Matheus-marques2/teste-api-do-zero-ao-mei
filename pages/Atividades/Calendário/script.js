document.addEventListener("DOMContentLoaded", () => {
    const nomeMes = document.querySelector(".mes__nome");
    const tabela = document.querySelector(".mes__dias");
    const botaoProximo = document.querySelector(".mes__seguinte");

    let dataAtual = new Date();
    let eventos = [];

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    function dataISO(ano, mes, dia) {
        return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    }

    function renderizarCalendario() {
        const ano = dataAtual.getFullYear();
        const mes = dataAtual.getMonth();
        const primeiroDia = new Date(ano, mes, 1).getDay();
        const totalDias = new Date(ano, mes + 1, 0).getDate();

        nomeMes.textContent = `${meses[mes]} ${ano}`;

        const tbody = document.createElement("tbody");
        let linha = document.createElement("tr");

        for (let i = 0; i < primeiroDia; i++) {
            linha.appendChild(document.createElement("td"));
        }

        for (let dia = 1; dia <= totalDias; dia++) {
            const celula = document.createElement("td");
            const span = document.createElement("span");
            span.textContent = dia;

            const iso = dataISO(ano, mes, dia);
            const temEvento = eventos.some(evento => evento.data === iso);
            const hoje = new Date();

            if (temEvento) celula.classList.add("mes__dia--marcado");
            if (
                hoje.getFullYear() === ano &&
                hoje.getMonth() === mes &&
                hoje.getDate() === dia
            ) {
                celula.classList.add("mes__dia--hoje");
            }

            celula.appendChild(span);

            celula.addEventListener("click", () => {
                const doDia = eventos.filter(evento => evento.data === iso);

                if (doDia.length) {
                    alert(doDia.map(evento =>
                        `${evento.titulo}${evento.descricao ? `\n${evento.descricao}` : ""}`
                    ).join("\n\n"));
                }
            });

            linha.appendChild(celula);

            if (linha.children.length === 7) {
                tbody.appendChild(linha);
                linha = document.createElement("tr");
            }
        }

        while (linha.children.length && linha.children.length < 7) {
            linha.appendChild(document.createElement("td"));
        }

        if (linha.children.length) tbody.appendChild(linha);

        tabela.querySelector("tbody")?.remove();
        tabela.appendChild(tbody);

        document.querySelector(".atividades__datas")?.querySelectorAll(".data").forEach(el => el.remove());

        const secao = document.querySelector(".atividades__datas");
        const eventosDoMes = eventos.filter(evento => {
            const [a, m] = evento.data.split("-").map(Number);
            return a === ano && m === mes + 1;
        });

        eventosDoMes.forEach(evento => {
            const artigo = document.createElement("article");
            artigo.className = "data";
            artigo.innerHTML = `
                <div class="data__texto">
                    <h3></h3>
                    <p></p>
                </div>
                <button class="data__acao" type="button">Editar</button>
            `;

            const [a, m, d] = evento.data.split("-");
            artigo.querySelector("h3").textContent = `${d}/${m}/${a} — ${evento.titulo}`;
            artigo.querySelector("p").textContent = evento.descricao || "Sem descrição.";

            artigo.querySelector(".data__acao").addEventListener("click", async () => {
                const novoTitulo = prompt("Novo título:", evento.titulo);
                if (novoTitulo === null) return;

                const response = await apiFetch(`/eventos/${evento.id}`, {
                    method: "PUT",
                    body: { titulo: novoTitulo }
                });

                const resultado = await response.json();

                if (!response.ok) {
                    alert(resultado.erro || "Não foi possível editar o evento.");
                    return;
                }

                evento.titulo = resultado.evento.titulo;
                renderizarCalendario();
            });

            secao.appendChild(artigo);
        });
    }

    async function carregarEventos() {
        try {
            const response = await apiFetch("/api/eventos");
            const dados = await response.json();

            if (!response.ok) {
                throw new Error(dados.erro || "Não foi possível carregar os eventos.");
            }

            eventos = Array.isArray(dados) ? dados : Object.values(dados);
            renderizarCalendario();
        } catch (erro) {
            console.error("Erro ao carregar eventos:", erro);
            renderizarCalendario();
        }
    }

    botaoProximo.addEventListener("click", () => {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        renderizarCalendario();
    });

    renderizarCalendario();
    carregarEventos();
});
