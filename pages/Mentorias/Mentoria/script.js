// Mentorias / Mentoria (apesar do nome da pasta, é a listagem de mentorias): dados
// vindos de /api/mentorias, que já devolve o nome do professor (campo "mentor").
// A API não guarda foto de cada mentoria, então usamos uma imagem local por id_mentoria.

const IMAGEM_POR_MENTORIA = {
    1: "../Assets/professional-smiling-woman 1.png",
    2: "../Assets/modern-business-woman-portrait 1.png",
    3: "../Assets/smiling-man-in-blue 1 (1).png",
    4: "../Assets/Ellipse 57.png",
    5: "../Assets/17865019337548153445729423338435 1.png",
    6: "../Assets/17865022650095737092185060252657 1.png",
};

const IMAGEM_PADRAO = "../Assets/Ellipse 57.png";


function criarCardDeMentoria(mentoria) {
    const card = document.createElement("div");
    card.className = "card";

    const imagem = document.createElement("img");
    imagem.src = IMAGEM_POR_MENTORIA[mentoria.id_mentoria] || IMAGEM_PADRAO;
    imagem.alt = mentoria.mentor;

    const info = document.createElement("div");
    info.className = "card-info";

    const titulo = document.createElement("p");
    titulo.className = "card-title";
    titulo.textContent = mentoria.titulo;

    const autor = document.createElement("p");
    autor.className = "card-author";
    autor.textContent = `Com ${mentoria.mentor}`;

    info.append(titulo, autor);

    const meta = document.createElement("div");
    meta.className = "card-meta";

    const estrela = document.createElement("span");
    estrela.className = "star";
    estrela.textContent = "★";

    const avaliacao = document.createElement("span");
    avaliacao.className = "card-rating";
    avaliacao.append(estrela, document.createTextNode(` ${String(mentoria.avaliacao).replace(".", ",")}`));

    const modalidade = document.createElement("span");
    modalidade.className = "card-mode";
    modalidade.textContent = mentoria.modalidade;

    meta.append(avaliacao, modalidade);

    card.append(imagem, info, meta);

    return card;
}


async function carregarMentorias() {
    const lista = document.getElementById("lista-mentorias");

    try {
        const resposta = await apiFetch("/api/mentorias");

        if (!resposta.ok) {
            lista.textContent = "Não foi possível carregar as mentorias agora.";
            return;
        }

        const mentorias = Object.values(await resposta.json());

        lista.textContent = "";

        if (mentorias.length === 0) {
            lista.textContent = "Nenhuma mentoria disponível no momento.";
            return;
        }

        mentorias.forEach((mentoria) => {
            lista.appendChild(criarCardDeMentoria(mentoria));
        });
    } catch (erro) {
        console.error("Erro ao carregar mentorias:", erro);
        lista.textContent = "Não foi possível carregar as mentorias agora.";
    }
}


carregarMentorias();