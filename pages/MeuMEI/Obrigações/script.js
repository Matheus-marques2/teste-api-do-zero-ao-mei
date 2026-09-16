document.addEventListener("DOMContentLoaded", async () => {
    const lista = document.querySelector(".obrigacoes__lista");
    const filtros = document.querySelectorAll(".filtros__item");

    let obrigacoes = [];
    let filtroAtual = "todas";

    function renderizar() {
        lista.innerHTML = "";

        const filtradas = obrigacoes.filter(obrigacao => {
            const status = String(obrigacao.status || "").toLowerCase();

            if (filtroAtual === "pendentes") {
                return status !== "concluida";
            }

            if (filtroAtual === "concluidas") {
                return status === "concluida";
            }

            return true;
        });

        if (!filtradas.length) {
            lista.innerHTML = "<p>Nenhuma obrigação encontrada.</p>";
            return;
        }

        filtradas.forEach(obrigacao => {
            const artigo = document.createElement("article");
            artigo.className = "obrigacao";

            const concluida = String(obrigacao.status || "").toLowerCase() === "concluida";
            artigo.innerHTML = `
                <div class="obrigacao__conteudo">
                    <h2></h2>
                    <p class="obrigacao__rotulo">Próximo vencimento</p>
                    <p class="obrigacao__data"></p>
                    <p class="obrigacao__detalhe"></p>
                    <a class="obrigacao__acao" target="_blank" rel="noopener">
                        ${concluida ? "Ver detalhes" : "Ver como emitir"} <span>›</span>
                    </a>
                </div>
                <span class="selo ${concluida ? "selo--ok" : "selo--pendente"}"></span>
            `;

            artigo.querySelector("h2").textContent = obrigacao.titulo;
            artigo.querySelector(".obrigacao__data").textContent = obrigacao.vencimento;
            artigo.querySelector(".obrigacao__detalhe").textContent = obrigacao.descricao;
            artigo.querySelector(".selo").textContent = obrigacao.status;

            const link = artigo.querySelector("a");
            link.href = obrigacao.link || "#";

            lista.appendChild(artigo);
        });
    }

    filtros.forEach(filtro => {
        filtro.addEventListener("click", event => {
            event.preventDefault();
            filtroAtual = filtro.textContent.trim().toLowerCase();

            filtros.forEach(item => item.classList.remove("filtros__item--ativo"));
            filtro.classList.add("filtros__item--ativo");

            renderizar();
        });
    });

    try {
        const response = await apiFetch("/api/obrigacoes");
        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.erro || "Não foi possível carregar as obrigações.");
        }

        obrigacoes = Object.values(dados);
        renderizar();
    } catch (erro) {
        console.error("Erro ao carregar obrigações:", erro);
        lista.innerHTML = "<p>Não foi possível carregar suas obrigações.</p>";
    }
});
