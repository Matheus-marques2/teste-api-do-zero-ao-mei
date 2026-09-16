async function carregarComponente(id, caminho) {
    try {
        const elemento = document.getElementById(id);

        const resposta = await fetch(caminho);

        if (!resposta.ok) {
            throw new Error(
                `Erro ao carregar ${caminho}: ${resposta.status}`
            );
        }

        const conteudo = await resposta.text();

        elemento.innerHTML = conteudo;

    } catch (erro) {
        console.error("Erro ao carregar componente:", erro);
    }
}


document.addEventListener("DOMContentLoaded", () => {

    // Navbar e menu lateral vêm de shared/components/NavBarGlobal e shared/components/Menu

    // Footer
    carregarComponente(
        "footer",
        "../../../shared/components/Footer/footer.html"
    );

});

