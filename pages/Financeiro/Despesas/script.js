document.addEventListener("DOMContentLoaded", function () {

    const botaoAdicionar =
        document.getElementById("btn-adicionar-despesa");

    const formulario =
        document.getElementById("form-despesa");


    botaoAdicionar.addEventListener("click", function () {

        formulario.hidden = !formulario.hidden;

    });


    formulario.addEventListener("submit", adicionarDespesa);

});


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


        alert("Despesa adicionada com sucesso.");


        formulario.reset();

        formulario.hidden = true;


        location.reload();

    } catch (erro) {

        console.error(
            "Erro ao adicionar despesa:",
            erro
        );

        alert("Erro ao adicionar despesa.");

    }

}