document.addEventListener("DOMContentLoaded", function () {
    const detalhes = document.querySelector(".financeiro__detalhes");

    detalhes.innerHTML = `
        <div class="detalhes__topo">
            <h2>Adicionar despesa</h2>
        </div>

        <form id="form-despesa" class="form-financeiro">
            <input
                id="descricao-despesa"
                type="text"
                placeholder="Descrição"
                required
            >

            <input
                id="valor-despesa"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Valor"
                required
            >

            <input
                id="data-despesa"
                type="date"
                required
            >

            <button type="submit">Adicionar despesa</button>

            <p id="mensagem-despesa"></p>
        </form>

        <h2 class="titulo-lista-despesas">
            Despesas cadastradas
        </h2>

        <div id="lista-despesas"></div>
    `;

    const hoje = new Date();

    document.getElementById("data-despesa").value =
        hoje.toISOString().slice(0, 10);

    document
        .getElementById("form-despesa")
        .addEventListener("submit", adicionarDespesa);

    carregarDespesas();
});


async function carregarDespesas() {
    const lista = document.getElementById("lista-despesas");

    const hoje = new Date();
    const mes = hoje.getMonth() + 1;
    const ano = hoje.getFullYear();

    try {
        const resposta = await apiFetch(
            `/api/financeiro/movimentacoes?tipo=saida&mes=${mes}&ano=${ano}`
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.erro || "Erro ao carregar despesas."
            );
        }

        lista.innerHTML = "";

        if (dados.length === 0) {
            lista.innerHTML =
                "<p>Nenhuma despesa cadastrada neste mês.</p>";
            return;
        }

        dados.forEach(function (despesa) {
            const item = document.createElement("article");

            item.className = "lancamento";

            item.innerHTML = `
                <img
                    class="lancamento__seta"
                    src="../Assets/SetaSaida.svg"
                    alt="Saída"
                >

                <h3 class="lancamento__nome">
                    ${despesa.descricao}
                </h3>

                <p class="lancamento__valor lancamento__valor--saida">
                    -${formatarDinheiro(despesa.valor)}
                </p>

                <button
                    class="lancamento__excluir"
                    type="button"
                >
                    <img
                        src="../Assets/Trash.svg"
                        alt="Excluir despesa"
                    >
                </button>
            `;

            item
                .querySelector(".lancamento__excluir")
                .addEventListener("click", function () {
                    excluirDespesa(despesa.id);
                });

            lista.appendChild(item);
        });

    } catch (erro) {
        console.error("Erro ao carregar despesas:", erro);
        lista.innerHTML =
            "<p>Não foi possível carregar as despesas.</p>";
    }
}


async function adicionarDespesa(evento) {
    evento.preventDefault();

    const descricao = document
        .getElementById("descricao-despesa")
        .value
        .trim();

    const valor = Number(
        document.getElementById("valor-despesa").value
    );

    const data = document.getElementById("data-despesa").value;

    const mensagem = document.getElementById("mensagem-despesa");

    try {
        const resposta = await apiFetch(
            "/api/financeiro/movimentacoes",
            {
                method: "POST",
                body: {
                    descricao,
                    valor,
                    tipo: "saida",
                    data
                }
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            mensagem.textContent =
                resultado.erro ||
                "Não foi possível adicionar a despesa.";
            return;
        }

        mensagem.textContent =
            "Despesa adicionada com sucesso.";

        document.getElementById("form-despesa").reset();

        const hoje = new Date();

        document.getElementById("data-despesa").value =
            hoje.toISOString().slice(0, 10);

        await carregarDespesas();

    } catch (erro) {
        console.error("Erro ao adicionar despesa:", erro);
        mensagem.textContent = "Erro ao adicionar despesa.";
    }
}


async function excluirDespesa(id) {
    const confirmar = confirm(
        "Deseja realmente excluir esta despesa?"
    );

    if (!confirmar) {
        return;
    }

    try {
        const resposta = await apiFetch(
            `/api/financeiro/movimentacoes/${id}`,
            {
                method: "DELETE"
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(
                resultado.erro ||
                "Não foi possível excluir a despesa."
            );
            return;
        }

        await carregarDespesas();

    } catch (erro) {
        console.error("Erro ao excluir despesa:", erro);
        alert("Erro ao excluir despesa.");
    }
}


function formatarDinheiro(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}