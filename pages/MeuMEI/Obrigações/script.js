// Meu MEI / Obrigações: lista completa vinda de /api/obrigacoes, com os filtros
// "Todas / Pendentes / Concluídas" funcionando de verdade (client-side, sem recarregar).

const ICONE_POR_OBRIGACAO = {
    1: "../Assets/DasMensal.svg",
    2: "../Assets/CalendarioSimples.svg",
};

const ICONE_PADRAO = "../Assets/Documentos.svg";

// Os selos existentes no CSS desta página são só "ok" e "pendente"
const SELO_POR_STATUS = {
    "Em dia": { classe: "selo--ok", texto: "Em dia" },
    "Concluida": { classe: "selo--ok", texto: "Concluída" },
    "Pendente": { classe: "selo--pendente", texto: "Pendente" },
};

let todasAsObrigacoes = [];
let filtroAtual = "todas";


function converterDataBr(data) {
    const [dia, mes, ano] = data.split("/").map(Number);
    return new Date(ano, mes - 1, dia);
}


function obrigacoesFiltradas() {
    if (filtroAtual === "pendentes") {
        return todasAsObrigacoes.filter((o) => o.status !== "Concluida");
    }

    if (filtroAtual === "concluidas") {
        return todasAsObrigacoes.filter((o) => o.status === "Concluida");
    }

    return todasAsObrigacoes;
}


function criarCardDeObrigacao(obrigacao) {
    const article = document.createElement("article");
    article.className = "obrigacao";

    const icone = document.createElement("img");
    icone.className = "obrigacao__icone";
    icone.src = ICONE_POR_OBRIGACAO[obrigacao.id_obrigacao] || ICONE_PADRAO;

    const conteudo = document.createElement("div");
    conteudo.className = "obrigacao__conteudo";

    const titulo = document.createElement("h2");
    titulo.textContent = obrigacao.titulo;

    const rotulo = document.createElement("p");
    rotulo.className = "obrigacao__rotulo";
    rotulo.textContent = "Vencimento";

    const data = document.createElement("p");
    data.className = "obrigacao__data";
    data.textContent = obrigacao.vencimento;

    const detalhe = document.createElement("p");
    detalhe.className = "obrigacao__detalhe";
    detalhe.textContent = obrigacao.descricao;

    const acao = document.createElement("a");
    acao.className = "obrigacao__acao";
    acao.href = obrigacao.link || "#";
    acao.target = "_blank";
    acao.rel = "noopener";

    const seta = document.createElement("img");
    seta.src = "../Assets/Chevron.svg";

    acao.append(document.createTextNode("Saiba mais "), seta);

    conteudo.append(titulo, rotulo, data, detalhe, acao);

    const selo = document.createElement("span");
    const infoSelo = SELO_POR_STATUS[obrigacao.status] || { classe: "selo--pendente", texto: obrigacao.status };
    selo.className = `selo ${infoSelo.classe}`;
    selo.textContent = infoSelo.texto;

    article.append(icone, conteudo, selo);

    return article;
}


function renderizarLista() {
    const lista = document.getElementById("lista-obrigacoes");
    const obrigacoes = obrigacoesFiltradas();

    lista.textContent = "";

    if (obrigacoes.length === 0) {
        const mensagens = {
            pendentes: "Nenhuma obrigação pendente. Tudo em dia!",
            concluidas: "Nenhuma obrigação concluída ainda.",
            todas: "Nenhuma obrigação cadastrada.",
        };

        lista.textContent = mensagens[filtroAtual];
        return;
    }

    obrigacoes
        .slice()
        .sort((a, b) => converterDataBr(a.vencimento) - converterDataBr(b.vencimento))
        .forEach((obrigacao) => {
            lista.appendChild(criarCardDeObrigacao(obrigacao));
        });
}


function selecionarFiltro(botaoClicado) {
    filtroAtual = botaoClicado.dataset.filtro;

    document.querySelectorAll(".filtros__item").forEach((botao) => {
        botao.classList.toggle("filtros__item--ativo", botao === botaoClicado);
    });

    renderizarLista();
}


document.querySelectorAll(".filtros__item").forEach((botao) => {
    botao.addEventListener("click", () => selecionarFiltro(botao));
});


async function carregarObrigacoes() {
    const lista = document.getElementById("lista-obrigacoes");

    try {
        const resposta = await apiFetch("/api/obrigacoes");

        if (!resposta.ok) {
            lista.textContent = "Não foi possível carregar suas obrigações agora.";
            return;
        }

        todasAsObrigacoes = Object.values(await resposta.json());
        renderizarLista();
    } catch (erro) {
        console.error("Erro ao carregar obrigações:", erro);
        lista.textContent = "Não foi possível carregar suas obrigações agora.";
    }
}


carregarObrigacoes();