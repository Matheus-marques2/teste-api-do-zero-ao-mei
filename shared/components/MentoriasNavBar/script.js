// Carrega a navbar de abas das Mentorias e marca a aba da página atual.
// Basta a página ter <div id="navbar"></div> e importar este arquivo depois dele.

// HTML da navbar (fica aqui no script para aparecer já no primeiro frame da página, sem fetch)
const templateMentoriasNavBar = `
<nav class="abas-mentorias">
    <a class="abas-mentorias__item" href="../VisãoGeral/index.html">Visão geral</a>
    <a class="abas-mentorias__item" href="../Mentoria/index.html">Mentorias</a>
    <a class="abas-mentorias__item" href="../Cursos/index.html">Cursos</a>
    <a class="abas-mentorias__item" href="../MeusCursos/index.html">Meus Cursos</a>
</nav>
`;


function pastaDaUrlMentorias(endereco) {
    // Devolve o nome da pasta da página, ex: ".../pages/Mentorias/Cursos/index.html" -> "cursos"
    const partes = new URL(endereco, location.href).pathname.split("/");

    partes.pop(); // tira o arquivo (index.html)

    return decodeURIComponent(partes.pop() || "").toLowerCase();
}


function marcarAbaAtivaMentorias(elemento) {
    const pastaAtual = pastaDaUrlMentorias(location.href);

    elemento.querySelectorAll(".abas-mentorias__item").forEach((link) => {

        if (pastaDaUrlMentorias(link.getAttribute("href")) === pastaAtual) {
            link.classList.add("abas-mentorias__item--ativo");
        }

    });
}


function carregarMentoriasNavBar(id) {
    try {
        const elemento = document.getElementById(id);

        if (!elemento) {
            throw new Error(`Não existe um elemento com id "${id}" nesta página`);
        }

        elemento.innerHTML = templateMentoriasNavBar;

        marcarAbaAtivaMentorias(elemento);

    } catch (erro) {
        console.error("Erro ao carregar a MentoriasNavBar:", erro);
    }
}


// O script é importado depois do placeholder, então já dá para renderizar na hora
carregarMentoriasNavBar("navbar");
