// Carrega a navbar global (rodapé fixo do app) e marca a seção da página atual.
// Basta a página ter <div id="navbar-global"></div> e importar este arquivo depois dele.

// Guarda o endereço desta pasta para os links funcionarem de qualquer página.
const pastaNavBarGlobal = new URL(".", document.currentScript.src);

// Raiz do projeto (shared/components/NavBarGlobal/ -> ../../../)
const raizProjetoGlobal = new URL("../../../", pastaNavBarGlobal);

// HTML da navbar (fica aqui no script para aparecer já no primeiro frame da página, sem fetch)
const templateNavBarGlobal = `
<nav class="navbar-global" aria-label="Navegação principal">
    <a class="navbar-global__item" data-secao="home" data-destino="index.html">
        <svg class="navbar-global__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3.5 10.2 12 3.5l8.5 6.7v9.3a1.5 1.5 0 0 1-1.5 1.5h-4v-6.5h-6V21H5a1.5 1.5 0 0 1-1.5-1.5z" />
        </svg>
        <span class="navbar-global__rotulo">Home</span>
    </a>

    <a class="navbar-global__item" data-secao="financeiro" data-destino="pages/Financeiro/VisãoGeral/index.html">
        <svg class="navbar-global__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="2.5" y="7" width="19" height="13.5" rx="3" />
            <path d="M5.5 7 16 3.6a1.5 1.5 0 0 1 2 1.4V7" />
            <path d="M21.5 11.5h-3.8a2 2 0 0 0 0 4h3.8" />
        </svg>
        <span class="navbar-global__rotulo">Financeiro</span>
    </a>

    <a class="navbar-global__item navbar-global__item--centro" data-secao="meumei" data-destino="pages/MeuMEI/MeuMei/index.html">
        <span class="navbar-global__logo-fundo">
            <img class="navbar-global__logo" data-logo="pages/MeuMEI/Assets/Logo.svg" alt="">
        </span>
        <span class="navbar-global__rotulo">Meu MEI</span>
    </a>

    <a class="navbar-global__item" data-secao="mentorias" data-destino="pages/Mentorias/VisãoGeral/index.html">
        <svg class="navbar-global__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 6.5C10.2 5 7.5 4.5 2.5 4.5v14.5c5 0 7.7.5 9.5 2 1.8-1.5 4.5-2 9.5-2V4.5c-5 0-7.7.5-9.5 2z" />
            <path d="M12 6.5V21" />
        </svg>
        <span class="navbar-global__rotulo">Mentorias</span>
    </a>

    <a class="navbar-global__item" data-secao="atividades" data-destino="pages/Atividades/VisãoGeral/index.html">
        <svg class="navbar-global__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="7.5" r="3" />
            <circle cx="5.5" cy="9.5" r="2" />
            <circle cx="18.5" cy="9.5" r="2" />
            <path d="M7 19.5v-.5a5 5 0 0 1 10 0v.5z" />
            <path d="M4.5 18H2v-.5a3.5 3.5 0 0 1 4.6-3.3" />
            <path d="M19.5 18H22v-.5a3.5 3.5 0 0 0-4.6-3.3" />
        </svg>
        <span class="navbar-global__rotulo">Atividades</span>
    </a>
</nav>
`;

// Pasta da seção em pages/<Seção>/ -> item da navbar
const secoesNavBarGlobal = {
    telainicial: "home",
    financeiro: "financeiro",
    meumei: "meumei",
    mentorias: "mentorias",
    atividades: "atividades",
};


function secaoDaUrlGlobal(endereco) {
    // Devolve o item da seção, ex: ".../pages/Financeiro/Receitas/index.html" -> "financeiro"
    const partes = new URL(endereco, location.href).pathname
        .split("/")
        .map((parte) => decodeURIComponent(parte).toLowerCase());

    const indicePages = partes.lastIndexOf("pages");

    // Fora de pages/ só existe o index.html da raiz, que é a Tela Inicial
    if (indicePages === -1) {
        return "home";
    }

    return secoesNavBarGlobal[partes[indicePages + 1]] || null;
}


function montarLinksGlobal(elemento) {
    // Os caminhos do template são relativos à raiz do projeto
    elemento.querySelectorAll("[data-destino]").forEach((link) => {
        link.href = new URL(link.dataset.destino, raizProjetoGlobal).href;
    });

    elemento.querySelectorAll("[data-logo]").forEach((imagem) => {
        imagem.src = new URL(imagem.dataset.logo, raizProjetoGlobal).href;
    });
}


function marcarItemAtivoGlobal(elemento) {
    const secaoAtual = secaoDaUrlGlobal(location.href);

    elemento.querySelectorAll(".navbar-global__item").forEach((link) => {

        if (link.dataset.secao === secaoAtual) {
            link.classList.add("navbar-global__item--ativo");
            link.setAttribute("aria-current", "page");
        }

    });
}


function carregarNavBarGlobal(id) {
    try {
        const elemento = document.getElementById(id);

        if (!elemento) {
            throw new Error(`Não existe um elemento com id "${id}" nesta página`);
        }

        elemento.innerHTML = templateNavBarGlobal;

        montarLinksGlobal(elemento);
        marcarItemAtivoGlobal(elemento);

        document.body.classList.add("navbar-global-ativa");

    } catch (erro) {
        console.error("Erro ao carregar a NavBarGlobal:", erro);
    }
}


// O script é importado depois do placeholder, então já dá para renderizar na hora
carregarNavBarGlobal("navbar-global");
