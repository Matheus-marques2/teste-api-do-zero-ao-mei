document.addEventListener("DOMContentLoaded", async () => {
    const cards = [...document.querySelectorAll(".card")];
    const imagens = [
        "../Assets/professional-smiling-woman 1.png",
        "../Assets/modern-business-woman-portrait 1.png",
        "../Assets/smiling-man-in-blue 1 (1).png",
        "../Assets/Ellipse 57.png",
        "../Assets/17865019337548153445729423338435 1.png",
        "../Assets/17865022650095737092185060252657 1.png"
    ];

    try {
        const response = await apiFetch("/api/mentorias");
        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.erro || "Não foi possível carregar as mentorias.");
        }

        const mentorias = Object.values(dados);

        cards.forEach(card => {
            card.hidden = true;
        });

        mentorias.forEach((mentoria, index) => {
            let card = cards[index];

            if (!card) {
                card = cards[0].cloneNode(true);
                document.querySelector(".cards").appendChild(card);
            }

            card.hidden = false;

            const imagem = card.querySelector("img");
            imagem.src = imagens[index] || imagem.src;
            imagem.alt = mentoria.mentor || "Mentor";

            card.querySelector(".card-title").textContent = mentoria.titulo;
            card.querySelector(".card-author").textContent = `Com ${mentoria.mentor}`;
            card.querySelector(".card-rating").innerHTML =
                `<span class="star">★</span> ${mentoria.avaliacao}`;
            card.querySelector(".card-mode").textContent = mentoria.modalidade;
        });
    } catch (erro) {
        console.error("Erro ao carregar mentorias:", erro);
    }
});
