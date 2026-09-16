// Carrega a navbar de abas do Financeiro e marca a aba da página atual.
// Basta a página ter <div id="navbar"></div> e importar este arquivo depois dele.

// HTML da navbar (fica aqui no script para aparecer já no primeiro frame da página, sem fetch)
const templateFinanceiroNavBar = `
<nav class="abas-financeiro">
    <a class="abas-financeiro__item" href="../VisãoGeral/index.html">Visão geral</a>
    <a class="abas-financeiro__item" href="../Receitas/index.html">Receitas</a>
    <a class="abas-financeiro__item" href="../Despesas/index.html">Despesas</a>
</nav>
`;


function pastaDaUrlFinanceiro(endereco) {
    // Devolve o nome da pasta da página, ex: ".../pages/Financeiro/Receitas/index.html" -> "receitas"
    const partes = new URL(endereco, location.href).pathname.split("/");

    partes.pop(); // tira o arquivo (index.html)

    return decodeURIComponent(partes.pop() || "").toLowerCase();
}


function marcarAbaAtivaFinanceiro(elemento) {
    const pastaAtual = pastaDaUrlFinanceiro(location.href);

    elemento.querySelectorAll(".abas-financeiro__item").forEach((link) => {

        if (pastaDaUrlFinanceiro(link.getAttribute("href")) === pastaAtual) {
            link.classList.add("abas-financeiro__item--ativo");
        }

    });
}


function carregarFinanceiroNavBar(id) {
    try {
        const elemento = document.getElementById(id);

        if (!elemento) {
            throw new Error(`Não existe um elemento com id "${id}" nesta página`);
        }

        elemento.innerHTML = templateFinanceiroNavBar;

        marcarAbaAtivaFinanceiro(elemento);

    } catch (erro) {
        console.error("Erro ao carregar a FinanceiroNavBar:", erro);
    }
}


// O script é importado depois do placeholder, então já dá para renderizar na hora
carregarFinanceiroNavBar("navbar");
