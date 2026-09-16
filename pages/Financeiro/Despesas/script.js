document.addEventListener("DOMContentLoaded", function () {

    const botao =
        document.getElementById("btn-adicionar-despesa");

    const formulario =
        document.getElementById("form-despesa");


    botao.addEventListener("click", function () {

        formulario.hidden = !formulario.hidden;

    });


    formulario.addEventListener("submit", async function (event) {

        event.preventDefault();


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


            formulario.reset();

            formulario.hidden = true;


            await carregarDespesas();


        } catch (erro) {

            console.error(
                "Erro ao adicionar despesa:",
                erro
            );

            alert(
                "Erro ao adicionar despesa."
            );

        }

    });


    carregarDespesas();

});


async function carregarDespesas() {

    const lista =
        document.getElementById("lista-despesas");


    try {

        const resposta = await apiFetch(
            "/api/financeiro/movimentacoes?tipo=saida"
        );


        const despesas =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                despesas.erro ||
                "Erro ao buscar despesas."
            );

        }


        lista.innerHTML = "";


        despesas.forEach(function (despesa) {

            const item =
                document.createElement("article");


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
                        alt="Excluir lançamento"
                    >
                </button>
            `;


            const botaoExcluir =
                item.querySelector(
                    ".lancamento__excluir"
                );


            botaoExcluir.addEventListener(
                "click",
                async function () {

                    const confirmar =
                        confirm(
                            "Deseja excluir esta despesa?"
                        );


                    if (!confirmar) {
                        return;
                    }


                    const resposta =
                        await apiFetch(
                            `/api/financeiro/movimentacoes/${despesa.id}`,
                            {
                                method: "DELETE"
                            }
                        );


                    if (!resposta.ok) {

                        const erro =
                            await resposta.json();

                        alert(
                            erro.erro ||
                            "Não foi possível excluir a despesa."
                        );

                        return;
                    }


                    await carregarDespesas();

                }
            );


            lista.appendChild(item);

        });


    } catch (erro) {

        console.error(
            "Erro ao carregar despesas:",
            erro
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