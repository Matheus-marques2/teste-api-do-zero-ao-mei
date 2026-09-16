document.addEventListener("DOMContentLoaded", async () => {
    const lista = document.querySelector(".lembretes");

    try {
        const response = await apiFetch("/api/tarefas");
        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.erro || "Não foi possível carregar as atividades.");
        }

        const tarefas = Array.isArray(dados) ? dados : Object.values(dados);
        lista.innerHTML = "";

        if (!tarefas.length) {
            lista.innerHTML = "<p>Nenhuma atividade cadastrada.</p>";
            return;
        }

        tarefas.forEach(tarefa => {
            const artigo = document.createElement("article");
            artigo.className = "lembrete";

            const concluida = String(tarefa.status || "").toLowerCase() === "concluida";

            artigo.innerHTML = `
                <h4 class="lembrete__nome"></h4>
                <p class="lembrete__detalhe"></p>
                <span class="lembrete__estado">${concluida ? "Concluída" : "Ativa"}</span>
            `;

            artigo.querySelector(".lembrete__nome").textContent = tarefa.titulo;
            artigo.querySelector(".lembrete__detalhe").textContent =
                tarefa.descricao || "Sem descrição.";

            lista.appendChild(artigo);
        });
    } catch (erro) {
        console.error("Erro ao carregar lembretes:", erro);
        lista.innerHTML = "<p>Não foi possível carregar suas atividades.</p>";
    }
});
