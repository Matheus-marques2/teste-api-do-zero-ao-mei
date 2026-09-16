document.addEventListener("DOMContentLoaded", function () {
    const envio = document.querySelector(".financeiro__envio");
    const instrucoes = document.querySelector(".financeiro__instrucoes");

    envio.innerHTML = `
        <form id="form-receita" class="form-financeiro">
            <h2>Adicionar receita</h2>

            <input
                id="descricao-receita"
                type="text"
                placeholder="Descrição"
                required
            >

            <input
                id="valor-receita"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Valor"
                required
            >

            <input
                id="data-receita"
                type="date"
                required
            >

            <button type="submit">Adicionar receita</button>

            <p id="mensagem-receita"></p>
        </form>
    `;

    instrucoes.innerHTML = `
        <h2>Receitas cadastradas</h2>
        <div id="lista-receitas"></div>
    `;

    const dataHoje = new Date();
    document.getElementById("data-receita").value =
        dataHoje.toISOString().slice(0, 10);

    document
        .getElementById("form-receita")
        .addEventListener("submit", adicionarReceita);

    carregarReceitas();
});


async function carregarReceitas() {
    const lista = document.getElementById("lista-receitas");

    const hoje = new Date();
    const mes = hoje.getMonth() + 1;
    const ano = hoje.getFullYear();

    try {
        const resposta = await apiFetch(
            `/api/financeiro/movimentacoes?tipo=entrada&mes=${mes}&ano=${ano}`
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao carregar receitas.");
        }

        lista.innerHTML = "";

        if (dados.length === 0) {
            lista.innerHTML = "<p>Nenhuma receita cadastrada neste mês.</p>";
            return;
        }

        dados.forEach(function (receita) {
            const item = document.createElement("article");

            item.className = "lancamento";

            item.innerHTML = `
                <img
                    class="lancamento__seta"
                    src="../Assets/SetaEntrada.svg"
                    alt="Entrada"
                >

                <h3 class="lancamento__nome">
                    ${receita.descricao}
                </h3>

                <p class="lancamento__valor lancamento__valor--entrada">
                    +${formatarDinheiro(receita.valor)}
                </p>

                <button
                    class="lancamento__excluir"
                    type="button"
                    data-id="${receita.id}"
                >
                    <img
                        src="../Assets/Trash.svg"
                        alt="Excluir receita"
                    >
                </button>
            `;

            item
                .querySelector(".lancamento__excluir")
                .addEventListener("click", function () {
                    excluirReceita(receita.id);
                });

            lista.appendChild(item);
        });

    } catch (erro) {
        console.error("Erro ao carregar receitas:", erro);
        lista.innerHTML = "<p>Não foi possível carregar as receitas.</p>";
    }
}


async function adicionarReceita(evento) {
    evento.preventDefault();

    const descricao = document
        .getElementById("descricao-receita")
        .value
        .trim();

    const valor = Number(
        document.getElementById("valor-receita").value
    );

    const data = document.getElementById("data-receita").value;

    const mensagem = document.getElementById("mensagem-receita");

    try {
        const resposta = await apiFetch(
            "/api/financeiro/movimentacoes",
            {
                method: "POST",
                body: {
                    descricao,
                    valor,
                    tipo: "entrada",
                    data
                }
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            mensagem.textContent =
                resultado.erro || "Não foi possível adicionar a receita.";
            return;
        }

        mensagem.textContent = "Receita adicionada com sucesso.";

        document.getElementById("form-receita").reset();

        const hoje = new Date();

        document.getElementById("data-receita").value =
            hoje.toISOString().slice(0, 10);

        await carregarReceitas();

    } catch (erro) {
        console.error("Erro ao adicionar receita:", erro);
        mensagem.textContent = "Erro ao adicionar receita.";
    }
}


async function excluirReceita(id) {
    const confirmar = confirm(
        "Deseja realmente excluir esta receita?"
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
                "Não foi possível excluir a receita."
            );
            return;
        }

        await carregarReceitas();

    } catch (erro) {
        console.error("Erro ao excluir receita:", erro);
        alert("Erro ao excluir receita.");
    }
}


function formatarDinheiro(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}