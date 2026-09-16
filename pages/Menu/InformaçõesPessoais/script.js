// Informações pessoais: GET /api/perfil preenche os placeholders e PUT /api/perfil salva.
// Campo deixado em branco mantém o valor atual (o que aparece no placeholder).

if (window.lucide) {
    lucide.createIcons();
}

const formPerfil = document.getElementById("form-perfil");
const mensagemPerfil = document.getElementById("perfil-mensagem");
const avatarPerfil = document.getElementById("perfil-avatar");

const CAMPOS_PERFIL = ["nome", "pronome", "numero", "email", "sobre"];

const PLACEHOLDERS_VAZIOS = {
    nome: "Seu nome",
    pronome: "Ex.: ela/dela",
    numero: "XX XXXXX-XXXX",
    email: "seuemail@gmail.com",
    sobre: "Conte um pouco sobre você e seu negócio.",
};

let perfilAtual = null;


function campoPerfil(nome) {
    return formPerfil.elements[nome];
}


function mostrarMensagemPerfil(texto, sucesso = false) {
    mensagemPerfil.textContent = texto;
    mensagemPerfil.classList.toggle("perfil-mensagem--sucesso", sucesso);
}


function preencherPerfil(perfil) {
    perfilAtual = perfil;

    CAMPOS_PERFIL.forEach((nome) => {
        const campo = campoPerfil(nome);
        const valor = (perfil[nome] || "").trim();

        campo.value = "";
        campo.placeholder = valor || PLACEHOLDERS_VAZIOS[nome];
    });

    avatarPerfil.textContent = (perfil.nome || "?").trim().charAt(0).toUpperCase();
}


async function carregarPerfil() {
    try {
        const resposta = await apiFetch("/api/perfil");

        if (!resposta.ok) {
            return;
        }

        preencherPerfil(await resposta.json());
    } catch (erro) {
        console.error("Erro ao carregar perfil:", erro);
        mostrarMensagemPerfil("Não foi possível carregar seus dados.");
    }
}


document.getElementById("perfil-editar").addEventListener("click", () => {
    campoPerfil("nome").focus();
});


formPerfil.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (!perfilAtual) {
        return;
    }

    const corpo = { cnpj: perfilAtual.cnpj || "" };

    CAMPOS_PERFIL.forEach((nome) => {
        const digitado = campoPerfil(nome).value.trim();
        corpo[nome] = digitado || perfilAtual[nome] || "";
    });

    const houveAlteracao = CAMPOS_PERFIL.some((nome) => corpo[nome] !== (perfilAtual[nome] || ""));

    if (!houveAlteracao) {
        mostrarMensagemPerfil("Nenhuma alteração para salvar.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(corpo.email)) {
        mostrarMensagemPerfil("Informe um e-mail em um formato válido.");
        campoPerfil("email").focus();
        return;
    }

    const botao = formPerfil.querySelector(".save-btn");
    botao.disabled = true;
    mostrarMensagemPerfil("");

    try {
        const resposta = await apiFetch("/api/perfil", { method: "PUT", body: corpo });
        const resultado = await resposta.json();

        if (!resultado.sucesso) {
            mostrarMensagemPerfil(resultado.erro || "Não foi possível salvar.");
            return;
        }

        preencherPerfil(resultado.perfil);
        mostrarMensagemPerfil("Alterações salvas!", true);

        // Menu lateral mostra nome/e-mail: atualiza sem recarregar a página
        const menu = document.getElementById("menu-lateral");

        if (menu) {
            menu.querySelector(".menu-lateral__avatar").textContent = avatarPerfil.textContent;
            menu.querySelector(".menu-lateral__nome").textContent = `${resultado.perfil.nome},`;
            menu.querySelector(".menu-lateral__email").textContent = resultado.perfil.email;
        }
    } catch (erro) {
        console.error("Erro ao salvar perfil:", erro);
        mostrarMensagemPerfil("Não foi possível conectar ao servidor.");
    } finally {
        botao.disabled = false;
    }
});


carregarPerfil();
