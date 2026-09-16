// Carrega a navbar de abas das Atividades e marca a aba da página atual.
// Basta a página ter <div id="navbar"></div> e importar este arquivo depois dele.

// HTML da navbar (fica aqui no script para aparecer já no primeiro frame da página, sem fetch)
const templateAtividadesNavBar = `
<nav class="abas-atividades">
  <a class="abas-atividades__item" href="../VisãoGeral/index.html"
    >Visão geral</a
  >
  <a class="abas-atividades__item" href="../Calendário/index.html"
    >Calendário</a
  >
  <a class="abas-atividades__item" href="../Lembretes/index.html">Lembretes</a>
</nav>
`;


function pastaDaUrlAtividades(endereco) {
    // Devolve o nome da pasta da página, ex: ".../pages/Atividades/VisãoGeral/index.html" -> "visãogeral"
    const partes = new URL(endereco, location.href).pathname.split("/");

    partes.pop(); // tira o arquivo (index.html)

    return decodeURIComponent(partes.pop() || "").toLowerCase();
}


function marcarAbaAtivaAtividades(elemento) {
    const pastaAtual = pastaDaUrlAtividades(location.href);

    elemento.querySelectorAll(".abas-atividades__item").forEach((link) => {

        if (pastaDaUrlAtividades(link.getAttribute("href")) === pastaAtual) {
            link.classList.add("abas-atividades__item--ativo");
        }

    });
}


function carregarAtividadesNavBar(id) {
    try {
        const elemento = document.getElementById(id);

        if (!elemento) {
            throw new Error(`Não existe um elemento com id "${id}" nesta página`);
        }

        elemento.innerHTML = templateAtividadesNavBar;

        marcarAbaAtivaAtividades(elemento);

    } catch (erro) {
        console.error("Erro ao carregar a AtividadesNavBar:", erro);
    }
}


// O script é importado depois do placeholder, então já dá para renderizar na hora
carregarAtividadesNavBar("navbar");
