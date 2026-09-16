// Tela Inicial (index.html da raiz): nome do usuário e resumo financeiro do mês vindos da API

function formatarDinheiro(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}


function formatarVariacao(valor) {
    if (valor === null || valor === undefined) {
        return "Sem dados do mês anterior";
    }

    const numero = Number(valor);

    if (numero > 0) {
        return `↑ ${numero}% vs o mês anterior`;
    }

    if (numero < 0) {
        return `↓ ${Math.abs(numero)}% vs o mês anterior`;
    }

    return "0% vs o mês anterior";
}


async function carregarUsuarioHome() {
    const usuario = await carregarUsuarioLogado();

    if (!usuario) {
        return;
    }

    const primeiroNome = usuario.nome.trim().split(" ")[0];

    document.getElementById("nome-usuario").textContent = `, ${primeiroNome}`;
}


async function carregarResumoFinanceiro() {
    try {
        const resposta = await apiFetch("/api/financeiro/resumo");

        if (!resposta.ok) {
            return;
        }

        const dados = await resposta.json();

        document.getElementById("home-receita").textContent = formatarDinheiro(dados.entrada);
        document.getElementById("home-despesas").textContent = formatarDinheiro(dados.saida);

        document.getElementById("home-variacao-receita").textContent =
            formatarVariacao(dados.comparacao_mes_anterior.entrada);

        document.getElementById("home-variacao-despesas").textContent =
            formatarVariacao(dados.comparacao_mes_anterior.saida);

    } catch (erro) {
        console.error("Erro ao carregar resumo financeiro:", erro);
    }
}


if (estaLogado()) {
    carregarUsuarioHome();
    carregarResumoFinanceiro();
} else {
    document.getElementById("home-variacao-receita").textContent = "Entre para ver seus dados";
    document.getElementById("home-variacao-despesas").textContent = "Entre para ver seus dados";
}
