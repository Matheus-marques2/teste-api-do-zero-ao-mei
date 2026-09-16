// Menu lateral do app (Meu perfil / Assinaturas / Central de ajuda / Configurações).
// Abre ao clicar em qualquer elemento com o atributo data-abrir-menu (o ícone de filtro do topo das telas).
// Basta a página importar este arquivo no fim do body.

// Guarda o endereço desta pasta para os links funcionarem de qualquer página.
const pastaMenuLateral = new URL(".", document.currentScript.src);

// Raiz do projeto (shared/components/Menu/ -> ../../../)
const raizProjetoMenuLateral = new URL("../../../", pastaMenuLateral);

// HTML do menu (fica aqui no script para não depender de fetch)
const templateMenuLateral = `
<aside class="menu-lateral" id="menu-lateral" aria-label="Menu" aria-hidden="true" inert>
    <header class="menu-lateral__topo">
        <button class="menu-lateral__botao" type="button" data-fechar-menu aria-label="Fechar menu">
            <svg class="menu-lateral__voltar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12.5 5.5 6 12l6.5 6.5" />
                <path d="M18.5 5.5 12 12l6.5 6.5" />
            </svg>
        </button>

        <button class="menu-lateral__botao" type="button" data-fechar-menu aria-label="Fechar menu">
            <img class="menu-lateral__filtro" data-caminho="pages/MeuMEI/Assets/Filter.svg" alt="">
        </button>
    </header>

    <div class="menu-lateral__perfil">
        <span class="menu-lateral__avatar" aria-hidden="true">U</span>

        <div class="menu-lateral__dados">
            <p class="menu-lateral__nome">Nome do usuário,</p>
            <p class="menu-lateral__email">email@exemplo.com</p>
        </div>
    </div>

    <nav class="menu-lateral__opcoes">
        <a class="menu-lateral__item" data-destino="pages/Menu/InformaçõesPessoais/index.html">
            <svg class="menu-lateral__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="7.5" r="3.5" />
                <path d="M5 20.5v-1a7 7 0 0 1 14 0v1z" />
            </svg>
            <span class="menu-lateral__texto">Meu Perfil</span>
            <img class="menu-lateral__seta" data-caminho="pages/MeuMEI/Assets/Chevron.svg" alt="">
        </a>

        <a class="menu-lateral__item" data-destino="pages/Menu/Assinatura/index.html">
            <svg class="menu-lateral__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4.5 8.5h15l-1.2 11a1.5 1.5 0 0 1-1.5 1.3H7.2a1.5 1.5 0 0 1-1.5-1.3z" />
                <path d="M8.5 8.5V7a3.5 3.5 0 0 1 7 0v1.5" />
                <path d="m9.5 14.5 1.8 1.8 3.2-3.3" />
            </svg>
            <span class="menu-lateral__texto">Assinaturas</span>
            <img class="menu-lateral__seta" data-caminho="pages/MeuMEI/Assets/Chevron.svg" alt="">
        </a>

        <a class="menu-lateral__item" data-destino="pages/Menu/CentralDeAjuda/index.html">
            <svg class="menu-lateral__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="7.5" r="3" />
                <circle cx="5.5" cy="9.5" r="2" />
                <circle cx="18.5" cy="9.5" r="2" />
                <path d="M7 19.5v-.5a5 5 0 0 1 10 0v.5z" />
                <path d="M4.5 18H2v-.5a3.5 3.5 0 0 1 4.6-3.3" />
                <path d="M19.5 18H22v-.5a3.5 3.5 0 0 0-4.6-3.3" />
            </svg>
            <span class="menu-lateral__texto">Central de ajuda</span>
            <img class="menu-lateral__seta" data-caminho="pages/MeuMEI/Assets/Chevron.svg" alt="">
        </a>

        <a class="menu-lateral__item" data-destino="pages/Menu/Configurações/index.html">
            <svg class="menu-lateral__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
            </svg>
            <span class="menu-lateral__texto">Configurações</span>
            <img class="menu-lateral__seta" data-caminho="pages/MeuMEI/Assets/Chevron.svg" alt="">
        </a>
    </nav>

    <a class="menu-lateral__sair" data-destino="pages/auth/Login/index.html">
        <svg class="menu-lateral__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 4.5h7.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9" />
            <path d="M3 12h10" />
            <path d="m10 8.5 3.5 3.5-3.5 3.5" />
        </svg>
        Sair da conta
    </a>
</aside>
`;


function montarCaminhosMenuLateral(elemento) {
    // Os caminhos do template são relativos à raiz do projeto
    elemento.querySelectorAll("[data-destino]").forEach((link) => {
        link.href = new URL(link.dataset.destino, raizProjetoMenuLateral).href;
    });

    elemento.querySelectorAll("[data-caminho]").forEach((imagem) => {
        imagem.src = new URL(imagem.dataset.caminho, raizProjetoMenuLateral).href;
    });
}


function abrirMenuLateral() {
    const menu = document.getElementById("menu-lateral");

    menu.classList.add("menu-lateral--aberto");
    menu.removeAttribute("inert");
    menu.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-lateral-travado");

    menu.querySelector("[data-fechar-menu]").focus();
}


function fecharMenuLateral() {
    const menu = document.getElementById("menu-lateral");

    if (!menu.classList.contains("menu-lateral--aberto")) {
        return;
    }

    menu.classList.remove("menu-lateral--aberto");
    menu.setAttribute("inert", "");
    menu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-lateral-travado");
}


async function preencherUsuarioMenuLateral(menu) {
    // carregarUsuarioLogado vem de shared/scripts/api.js (páginas sem ele mantêm o texto padrão)
    if (typeof carregarUsuarioLogado !== "function") {
        return;
    }

    if (!estaLogado()) {
        const sair = menu.querySelector(".menu-lateral__sair");

        menu.querySelector(".menu-lateral__avatar").textContent = "V";
        menu.querySelector(".menu-lateral__nome").textContent = "Visitante,";
        menu.querySelector(".menu-lateral__email").textContent = "entre para salvar seus dados";
        sair.lastChild.textContent = " Entrar na conta ";
        sair.href = new URL(`pages/auth/Login/index.html?voltar=${encodeURIComponent(location.href)}`, raizProjetoMenuLateral).href;
        return;
    }

    const usuario = await carregarUsuarioLogado();

    if (!usuario) {
        return;
    }

    menu.querySelector(".menu-lateral__avatar").textContent = usuario.nome.trim().charAt(0).toUpperCase();
    menu.querySelector(".menu-lateral__nome").textContent = `${usuario.nome},`;
    menu.querySelector(".menu-lateral__email").textContent = usuario.email;
}


function carregarMenuLateral() {
    document.body.insertAdjacentHTML("beforeend", templateMenuLateral);

    const menu = document.getElementById("menu-lateral");

    montarCaminhosMenuLateral(menu);
    preencherUsuarioMenuLateral(menu);

    menu.querySelector(".menu-lateral__sair").addEventListener("click", (evento) => {
        if (typeof sair === "function" && estaLogado()) {
            evento.preventDefault();
            sair();
        }
    });

    // Delegação: funciona também para botões que aparecem depois (ex.: topo da MeuMeiNavBar)
    document.addEventListener("click", (evento) => {
        if (evento.target.closest("[data-abrir-menu]")) {
            abrirMenuLateral();
        } else if (evento.target.closest("[data-fechar-menu]")) {
            fecharMenuLateral();
        }
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            fecharMenuLateral();
            return;
        }

        // Gatilhos que não são <button> (span/div/i com role="button") também abrem pelo teclado
        const gatilho = evento.target.closest("[data-abrir-menu]");

        if (gatilho && gatilho.tagName !== "BUTTON" && (evento.key === "Enter" || evento.key === " ")) {
            evento.preventDefault();
            abrirMenuLateral();
        }
    });
}


carregarMenuLateral();
