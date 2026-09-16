document.addEventListener("DOMContentLoaded", () => {
    const saldo = document.querySelector(".card-saldo-valor");
    const pagar = document.querySelector(".cards-duplos .card-mini:nth-child(1) .card-mini-valor");
    const receber = document.querySelector(".cards-duplos .card-mini:nth-child(2) .card-mini-valor");
    const despesas = document.querySelector(".cards-despesas");
    const exemplo = document.querySelector(".card-exemplo");

    const dinheiro = valor =>
        Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    async function carregarFinanceiro() {
        try {
            const agora = new Date();
            const mes = agora.getMonth() + 1;
            const ano = agora.getFullYear();

            const [resumoResponse, movimentosResponse] = await Promise.all([
                apiFetch(`/api/financeiro/resumo?mes=${mes}&ano=${ano}`),
                apiFetch(`/api/financeiro/movimentacoes?mes=${mes}&ano=${ano}`)
            ]);

            const resumo = await resumoResponse.json();
            const movimentos = await movimentosResponse.json();

            if (!resumoResponse.ok) {
                throw new Error(resumo.erro || "Não foi possível carregar o resumo financeiro.");
            }

            saldo.textContent = dinheiro(resumo.lucro);
            pagar.textContent = dinheiro(resumo.saida);
            receber.textContent = dinheiro(resumo.entrada);

            despesas.innerHTML = "";

            const saidas = movimentos.filter(m => m.tipo === "saida");

            if (!saidas.length) {
                despesas.innerHTML = '<div class="card-despesa"><p class="card-despesa-texto">Nenhuma despesa no mês</p></div>';
            } else {
                saidas.slice(0, 3).forEach(mov => {
                    const card = document.createElement("div");
                    card.className = "card-despesa";
                    card.innerHTML = `
                        <p class="card-despesa-texto"></p>
                        <small></small>
                    `;
                    card.querySelector("p").textContent = mov.descricao;
                    card.querySelector("small").textContent = `- ${dinheiro(mov.valor)}`;
                    despesas.appendChild(card);
                });
            }

            if (exemplo) {
                const maisRecente = movimentos[0];

                if (maisRecente) {
                    exemplo.querySelector(".card-exemplo-nome").textContent = maisRecente.descricao;
                    exemplo.querySelector(".card-exemplo-valor").textContent =
                        `${maisRecente.tipo === "entrada" ? "+" : "-"}${dinheiro(maisRecente.valor)}`;
                    exemplo.querySelector(".seta-cima").textContent =
                        maisRecente.tipo === "entrada" ? "↑" : "↓";
                }
            }
        } catch (erro) {
            console.error("Erro ao carregar financeiro:", erro);
        }
    }

    carregarFinanceiro();
});
