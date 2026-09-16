document.addEventListener("DOMContentLoaded", async () => {
    const cards = [...document.querySelectorAll(".curso-cards")];
    const imagens = [
        "../Assets/macbook-air-on-desk 1.png",
        "../Assets/creative-designers-desk 1.png"
    ];

    try {
        const response = await apiFetch("/api/cursos");
        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.erro || "Não foi possível carregar os cursos.");
        }

        const cursos = Object.values(dados);

        cards.forEach(card => {
            card.hidden = true;
        });

        cursos.forEach((curso, index) => {
            let card = cards[index];

            if (!card) {
                card = cards[0].cloneNode(true);
                document.querySelector(".secao").appendChild(card);
            }

            card.hidden = false;

            const imagem = card.querySelector("img");
            const titulo = card.querySelector("h3");
            const descricao = card.querySelector("p");
            const duracao = card.querySelector(".duracao");
            const valor = card.querySelector(".valor, .valor-curso");

            imagem.src = imagens[index] || imagem.src;
            imagem.alt = curso.nome;
            titulo.textContent = curso.nome;
            descricao.textContent = curso.descricao || "";
            duracao.textContent = curso.carga_horaria || "";
            valor.textContent = curso.preco || "Grátis";
        });
    } catch (erro) {
        console.error("Erro ao carregar cursos:", erro);
    }
});
