document.addEventListener("DOMContentLoaded", async () => {
    const negocio = document.querySelector(".negocio");
    const obrigacoesLista = document.querySelector(".obrigacoes__lista");

    try {
        const [negocioResponse, obrigacoesResponse] = await Promise.all([
            apiFetch("/api/negocio"),
            apiFetch("/api/obrigacoes")
        ]);

        const dadosNegocio = await negocioResponse.json();
        const dadosObrigacoes = await obrigacoesResponse.json();

        if (negocioResponse.ok) {
            const textos = negocio.querySelectorAll(".negocio__dados p");
            textos[0].textContent = dadosNegocio.nome_negocio || dadosNegocio.nome_usuario || "Não informado";
            textos[1].textContent = `CNPJ: ${dadosNegocio.cnpj || "Não informado"}`;
            textos[2].innerHTML = `Situação: <span>${dadosNegocio.situacao || "Não informado"}</span>`;
        }

        if (obrigacoesResponse.ok) {
            const obrigacoes = Object.values(dadosObrigacoes);
            const cards = [...obrigacoesLista.querySelectorAll(".resumo")];

            cards.forEach(card => card.remove());

            obrigacoes.slice(0, 2).forEach(obrigacao => {
                const card = document.createElement("article");
                card.className = "resumo";

                const ok = String(obrigacao.status).toLowerCase() === "concluida" ||
                           String(obrigacao.status).toLowerCase() === "em dia";

                card.innerHTML = `
                    <div class="resumo__topo">
                        <span class="selo ${ok ? "selo--ok" : "selo--atencao"}"></span>
                    </div>
                    <h3></h3>
                    <p class="resumo__rotulo">Vencimento</p>
                    <p class="resumo__data"></p>
                    <a class="resumo__acao" target="_blank" rel="noopener">
                        Ver detalhes
                        <span>›</span>
                    </a>
                `;

                card.querySelector("h3").textContent = obrigacao.titulo;
                card.querySelector(".selo").textContent = obrigacao.status;
                card.querySelector(".resumo__data").textContent = obrigacao.vencimento;

                const link = card.querySelector("a");
                link.href = obrigacao.link || "#";

                obrigacoesLista.appendChild(card);
            });
        }
    } catch (erro) {
        console.error("Erro ao carregar Meu MEI:", erro);
    }
});
