// Carrega a navbar superior do Meu MEI e marca a aba da página atual.
// Basta a página ter <div id="navbar"></div> e importar este arquivo depois dele.

// HTML da navbar (fica aqui no script para aparecer já no primeiro frame da página, sem fetch)
const templateMeuMeiNavBar = `
<header class="topo-mei">
    <div class="topo-mei__marca">
        <img class="topo-mei__logo" src="../Assets/Logo.svg" alt="Do Zero ao MEI">

        <h1>Meu Mei</h1>
    </div>

    <button class="topo-mei__filtro" type="button" data-abrir-menu aria-label="Abrir menu">
        <img src="../Assets/Filter.svg" alt="Filtrar">
    </button>
</header>

<nav class="abas-mei">
    <a class="abas-mei__item" href="../MeuMei/index.html">Meu Mei</a>
    <a class="abas-mei__item" href="../Obrigações/index.html">Obrigações</a>
    <a class="abas-mei__item" href="../Guias/index.html">Guias</a>
</nav>
`;


function pastaDaUrlMeuMei(endereco) {
    // Devolve o nome da pasta da página, ex: ".../pages/MeuMEI/Guias/index.html" -> "guias"
    const partes = new URL(endereco, location.href).pathname.split("/");

    partes.pop(); // tira o arquivo (index.html)

    return decodeURIComponent(partes.pop() || "").toLowerCase();
}


function marcarAbaAtivaMeuMei(elemento) {
    const pastaAtual = pastaDaUrlMeuMei(location.href);

    elemento.querySelectorAll(".abas-mei__item").forEach((link) => {

        if (pastaDaUrlMeuMei(link.getAttribute("href")) === pastaAtual) {
            link.classList.add("abas-mei__item--ativo");
        }

    });
}


function carregarMeuMeiNavBar(id) {
    try {
        const elemento = document.getElementById(id);

        if (!elemento) {
            throw new Error(`Não existe um elemento com id "${id}" nesta página`);
        }

        elemento.innerHTML = templateMeuMeiNavBar;

        marcarAbaAtivaMeuMei(elemento);

    } catch (erro) {
        console.error("Erro ao carregar a MeuMeiNavBar:", erro);
    }
}


// O script é importado depois do placeholder, então já dá para renderizar na hora
carregarMeuMeiNavBar("navbar");
