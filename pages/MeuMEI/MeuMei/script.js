// Meu MEI (tela principal): dados do negócio (/api/negocio) e um resumo das
// obrigações mais próximas do vencimento (/api/obrigacoes).

const ICONE_POR_OBRIGACAO = {
    1: "../Assets/DasMensal.svg",
    2: "../Assets/CalendarioSimples.svg",
};

const ICONE_PADRAO = "../Assets/Documentos.svg";

// Só existem esses dois selos no CSS hoje: "ok" (verde) e "atenção" (amarelo)
const SELO_POR_STATUS = {
    "Em dia": { classe: "selo--ok", texto: "Em dia" },
    "Concluida": { classe: "selo--ok", texto: "Concluída" },
    "Pendente": { classe: "selo--atencao", texto: "Pendente" },
};


function converterDataBr(data) {
    const [dia, mes, ano] = data.split("/").map(Number);
    return new Date(ano, mes - 1, dia);
}


async function carregarNegocio() {
    try {
        const resposta = await apiFetch("/api/negocio");

        if (!resposta.ok) {
            return;
        }

        const negocio = await resposta.json();

        document.getElementById("negocio-dono").textContent = negocio.nome_usuario;

        document.getElementById("negocio-cnpj").textContent = negocio.cnpj
            ? `CNPJ: ${negocio.cnpj}`
            : "CNPJ ainda não cadastrado";

        document.getElementById("negocio-situacao").textContent = negocio.situacao || "Não informada";
    } catch (erro) {
        console.error("Erro ao carregar negócio:", erro);
    }
}


function criarCardDeObrigacao(obrigacao) {
    const article = document.createElement("article");
    article.className = "resumo";

    const topo = document.createElement("div");
    topo.className = "resumo__topo";

    const icone = document.createElement("img");
    icone.className = "resumo__icone";
    icone.src = ICONE_POR_OBRIGACAO[obrigacao.id_obrigacao] || ICONE_PADRAO;

    const selo = document.createElement("span");
    const infoSelo = SELO_POR_STATUS[obrigacao.status] || { classe: "selo--atencao", texto: obrigacao.status };
    selo.className = `selo ${infoSelo.classe}`;
    selo.textContent = infoSelo.texto;

    topo.append(icone, selo);

    const titulo = document.createElement("h3");
    titulo.textContent = obrigacao.titulo;

    const rotulo = document.createElement("p");
    rotulo.className = "resumo__rotulo";
    rotulo.textContent = "Vencimento";

    const dataVencimento = document.createElement("p");
    dataVencimento.className = "resumo__data";
    dataVencimento.textContent = obrigacao.vencimento;

    const acao = document.createElement("a");
    acao.className = "resumo__acao";
    acao.href = obrigacao.link || "../Obrigações/index.html";
    acao.target = "_blank";
    acao.rel = "noopener";

    const seta = document.createElement("img");
    seta.src = "../Assets/Chevron.svg";

    acao.append(document.createTextNode("Saiba mais "), seta);

    article.append(topo, titulo, rotulo, dataVencimento, acao);

    return article;
}


async function carregarObrigacoes() {
    const lista = document.getElementById("lista-obrigacoes");

    try {
        const resposta = await apiFetch("/api/obrigacoes");

        if (!resposta.ok) {
            lista.textContent = "Não foi possível carregar suas obrigações agora.";
            return;
        }

        const obrigacoes = Object.values(await resposta.json())
            .filter((o) => o.status !== "Concluida")
            .sort((a, b) => converterDataBr(a.vencimento) - converterDataBr(b.vencimento))
            .slice(0, 2);

        lista.textContent = "";

        if (obrigacoes.length === 0) {
            lista.textContent = "Nenhuma obrigação pendente. Tudo em dia!";
            return;
        }

        obrigacoes.forEach((obrigacao) => {
            lista.appendChild(criarCardDeObrigacao(obrigacao));
        });
    } catch (erro) {
        console.error("Erro ao carregar obrigações:", erro);
        lista.textContent = "Não foi possível carregar suas obrigações agora.";
    }
}


carregarNegocio();
carregarObrigacoes();