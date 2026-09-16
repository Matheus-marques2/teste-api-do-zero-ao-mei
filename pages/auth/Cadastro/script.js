document.getElementById("cadastroForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const mensagem = document.getElementById("cadastroMensagem");
  const botao = event.target.querySelector("button[type='submit']");

  const senha = document.getElementById("senha").value;
  const confirmacao = document.getElementById("confirmar-senha").value;

  mensagem.classList.remove("mensagem-form--sucesso");

  if (senha !== confirmacao) {
    mensagem.textContent = "As senhas não conferem.";
    return;
  }

  mensagem.textContent = "";
  botao.disabled = true;

  const avisoServidor = setTimeout(() => {
    mensagem.textContent = "Conectando ao servidor, isso pode levar até 1 minuto...";
  }, 4000);

  try {
    const resposta = await apiFetch("/cadastro", {
      method: "POST",
      body: {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        senha: senha,
      },
    });

    const resultado = await resposta.json();

    clearTimeout(avisoServidor);

    if (!resultado.sucesso) {
      mensagem.textContent = resultado.erro || "Não foi possível criar a conta.";
      return;
    }

    mensagem.textContent = "Conta criada! Redirecionando para o login...";
    mensagem.classList.add("mensagem-form--sucesso");

    setTimeout(() => {
      location.replace(caminhoDaRaiz("pages/auth/Login/index.html") + location.search);
    }, 1200);
  } catch (erro) {
    console.error("Erro no cadastro:", erro);
    mensagem.textContent = "Não foi possível conectar ao servidor.";
  } finally {
    clearTimeout(avisoServidor);
    botao.disabled = false;
  }
});
