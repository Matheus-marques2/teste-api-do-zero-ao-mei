// Mentorias / Cursos: catálogo de cursos vindo da API (/api/cursos).
// A API não guarda uma foto de capa de cada curso, então usamos uma imagem
// local de acordo com o id do curso, e uma imagem genérica para cursos novos.

const IMAGEM_POR_CURSO = {
    1: "../Assets/macbook-air-on-desk 1.png",
    2: "../Assets/creative-designers-desk 1.png",
};

const IMAGEM_PADRAO = "../Assets/image 8.png";


function formatarPreco(preco) {
    if (!preco || preco.toLowerCase() === "grátis") {
        return "Grátis";
    }

    return preco;
}


function criarCardDeCurso(curso) {
    const card = document.createElement("div");
    card.className = "curso-cards";

    const imagem = document.createElement("img");
    imagem.src = IMAGEM_POR_CURSO[curso.id_curso] || IMAGEM_PADRAO;
    imagem.alt = curso.nome;

    const info = document.createElement("div");
    info.className = "curso-info";
    info.innerHTML = `
        <h3></h3>
        <p></p>
        <div class="valor-tempo">
            <span class="duracao"></span>
            <span class="valor"></span>
        </div>
    `;

    // texto sempre via textContent (não innerHTML) pra não rodar HTML vindo da API por engano
    info.querySelector("h3").textContent = curso.nome;
    info.querySelector("p").textContent = curso.descricao;
    info.querySelector(".duracao").textContent = curso.carga_horaria;
    info.querySelector(".valor").textContent = formatarPreco(curso.preco);

    card.append(imagem, info);

    return card;
}


async function carregarCursos() {
    const lista = document.getElementById("lista-cursos");

    try {
        const resposta = await apiFetch("/api/cursos");

        if (!resposta.ok) {
            lista.textContent = "Não foi possível carregar os cursos agora.";
            return;
        }

        const cursos = Object.values(await resposta.json());

        lista.textContent = "";

        if (cursos.length === 0) {
            lista.textContent = "Nenhum curso disponível no momento.";
            return;
        }

        cursos.forEach((curso) => {
            lista.appendChild(criarCardDeCurso(curso));
        });
    } catch (erro) {
        console.error("Erro ao carregar cursos:", erro);
        lista.textContent = "Não foi possível carregar os cursos agora.";
    }
}


carregarCursos();