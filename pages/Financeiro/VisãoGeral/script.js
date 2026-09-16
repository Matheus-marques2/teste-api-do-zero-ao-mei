// Financeiro / Visão Geral: resumo do mês (saldo, despesas, receitas) e a lista de
// movimentações, tudo vindo da API (/api/financeiro/resumo e /api/financeiro/movimentacoes).

function formatarMoeda(valor) {
    return Math.abs(Number(valor)).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}


// Cards do topo usam o formato "R$: 1.234,56" (com dois pontos), como já estava no layout
function formatarComoNoCard(valor) {
    return `R$: ${formatarMoeda(valor)}`;
}


// Card de despesa/última movimentação usa "-R$ 120,00" / "+R$ 50,00"
function formatarComSinal(valor, tipo) {
    const sinal = tipo === "saida" ? "-" : "+";

    return `${sinal}R$ ${formatarMoeda(valor)}`;
}


function mostrarEstadoSemDados() {
    document.getElementById("fin-saldo").textContent = "Entre para ver seus dados";
    document.getElementById("fin-despesas-mes").textContent = "R$: 0,00";
    document.getElementById("fin-receitas-mes").textContent = "R$: 0,00";

    ["fin-despesa-1", "fin-despesa-2", "fin-despesa-3"].forEach((id) => {
        document.getElementById(id).textContent = "Entre para ver seus dados";
    });

    document.getElementById("fin-ultima-movimentacao").style.display = "none";
}


async function carregarResumoDoMes() {
    try {
        const resposta = await apiFetch("/api/financeiro/resumo");

        if (!resposta.ok) {
            console.error("Erro ao carregar resumo financeiro:", await resposta.json());
            return;
        }

        const dados = await resposta.json();

        document.getElementById("fin-saldo").textContent = formatarComoNoCard(dados.lucro);
        document.getElementById("fin-despesas-mes").textContent = formatarComoNoCard(dados.saida);
        document.getElementById("fin-receitas-mes").textContent = formatarComoNoCard(dados.entrada);
    } catch (erro) {
        console.error("Erro ao carregar resumo financeiro:", erro);
    }
}


function renderizarListaDeDespesas(movimentacoes) {
    const despesas = movimentacoes.filter((m) => m.tipo === "saida").slice(0, 3);
    const idsDosCards = ["fin-despesa-1", "fin-despesa-2", "fin-despesa-3"];

    idsDosCards.forEach((id, indice) => {
        const elemento = document.getElementById(id);
        const despesa = despesas[indice];

        elemento.textContent = despesa
            ? `${despesa.descricao} · ${formatarComSinal(despesa.valor, "saida")}`
            : "Nenhuma despesa neste mês";
    });
}


function renderizarUltimaMovimentacao(movimentacoes, recarregar) {
    const container = document.getElementById("fin-ultima-movimentacao");
    const ultima = movimentacoes[0];

    if (!ultima) {
        container.style.display = "none";
        return;
    }

    container.style.display = "";

    const ehEntrada = ultima.tipo === "entrada";

    document.getElementById("fin-ultima-nome").textContent = ultima.descricao;
    document.getElementById("fin-ultima-valor").textContent = formatarComSinal(ultima.valor, ultima.tipo);

    const seta = document.getElementById("fin-ultima-seta");
    seta.textContent = ehEntrada ? "↑" : "↓";
    seta.classList.toggle("verde", ehEntrada);
    seta.classList.toggle("vermelho", !ehEntrada);

    const botaoExcluir = document.getElementById("fin-ultima-excluir");

    // onclick (em vez de addEventListener) evita empilhar um novo handler a cada recarregamento
    botaoExcluir.onclick = async () => {
        if (!confirm(`Excluir "${ultima.descricao}"?`)) {
            return;
        }

        try {
            const resposta = await apiFetch(`/api/financeiro/movimentacoes/${ultima.id}`, {
                method: "DELETE",
            });

            if (!resposta.ok) {
                alert("Não foi possível excluir essa movimentação.");
                return;
            }

            recarregar();
        } catch (erro) {
            console.error("Erro ao excluir movimentação:", erro);
            alert("Não foi possível excluir essa movimentação. Verifique sua internet.");
        }
    };
}


async function carregarMovimentacoes() {
    try {
        const resposta = await apiFetch("/api/financeiro/movimentacoes");

        if (!resposta.ok) {
            console.error("Erro ao carregar movimentações:", await resposta.json());
            return;
        }

        // A API já devolve mais recentes primeiro
        const movimentacoes = await resposta.json();

        renderizarListaDeDespesas(movimentacoes);
        renderizarUltimaMovimentacao(movimentacoes, carregarMovimentacoes);
    } catch (erro) {
        console.error("Erro ao carregar movimentações:", erro);
    }
}


if (estaLogado()) {
    carregarResumoDoMes();
    carregarMovimentacoes();
} else {
    mostrarEstadoSemDados();
}