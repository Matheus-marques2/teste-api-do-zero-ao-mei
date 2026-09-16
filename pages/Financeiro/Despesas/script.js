document.addEventListener("DOMContentLoaded", function () {

    const botaoAdicionar =
        document.getElementById("btn-adicionar-despesa");

    const formulario =
        document.getElementById("form-despesa");


    // Abre e fecha o formulário pelo botão "+"
    botaoAdicionar.addEventListener("click", function () {

        formulario.hidden = !formulario.hidden;

    });


    // Envia a nova despesa
    formulario.addEventListener("submit", adicionarDespesa);


    // Carrega as despesas já cadastradas
    carregarDespesas();

});


async function carregarDespesas() {

    const detalhes =
        document.querySelector(".financeiro__detalhes");


    try {

        const resposta = await apiFetch(
            "/api/financeiro/movimentacoes?tipo=saida"
        );


        const despesas =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                despesas.erro ||
                "Não foi possível carregar as despesas."
            );

        }


        // Remove somente os lançamentos antigos
        // Mantém o título "Detalhes" e o botão "+"
        detalhes
            .querySelectorAll(".lancamento")
            .forEach(function (lancamento) {
                lancamento.remove();
            });


        despesas.forEach(function (despesa) {

            const lancamento =
                document.createElement("article");


            lancamento.className = "lancamento";


            lancamento.innerHTML = `
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
                    aria-label="Excluir despesa"
                >
                    <img
                        src="../Assets/Trash.svg"
                        alt="Excluir lançamento"
                    >
                </button>
            `;


            lancamento
                .querySelector(".lancamento__excluir")
                .addEventListener("click", function () {

                    excluirDespesa(despesa.id);

                });


            detalhes.appendChild(lancamento);

        });


    } catch (erro) {

        console.error(
            "Erro ao carregar despesas:",
            erro
        );

    }

}


async function adicionarDespesa(evento) {

    evento.preventDefault();


    const descricao =
        document
            .getElementById("descricao-despesa")
            .value
            .trim();


    const valor =
        Number(
            document
                .getElementById("valor-despesa")
                .value
        );


    const data =
        document
            .getElementById("data-despesa")
            .value;


    try {

        const resposta = await apiFetch(
            "/api/financeiro/movimentacoes",
            {
                method: "POST",

                body: {
                    descricao: descricao,
                    valor: valor,
                    tipo: "saida",
                    data: data
                }
            }
        );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            alert(
                resultado.erro ||
                "Não foi possível adicionar a despesa."
            );

            return;

        }


        // Limpa o formulário
        formulario.reset();


        // Fecha o formulário
        formulario.hidden = true;


        // Atualiza a lista sem recarregar a página
        await carregarDespesas();


    } catch (erro) {

        console.error(
            "Erro ao adicionar despesa:",
            erro
        );

        alert(
            "Não foi possível adicionar a despesa."
        );

    }

}


async function excluirDespesa(id) {

    try {

        const resposta = await apiFetch(
            `/api/financeiro/movimentacoes/${id}`,
            {
                method: "DELETE"
            }
        );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            alert(
                resultado.erro ||
                "Não foi possível excluir a despesa."
            );

            return;

        }


        await carregarDespesas();


    } catch (erro) {

        console.error(
            "Erro ao excluir despesa:",
            erro
        );

        alert(
            "Não foi possível excluir a despesa."
        );

    }

}


function formatarDinheiro(valor) {

    return Number(valor).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}