// Já logado: pula direto pro destino (Tela Inicial ou a página que pediu login)
if (estaLogado()) {
  location.replace(destinoAposLogin());
}

// Leva o ?voltar= junto pro cadastro, pra depois de criar a conta voltar ao mesmo lugar
document.querySelectorAll("a[href='../Cadastro/index.html']").forEach((link) => {
  link.search = location.search;
});

document.getElementById("continuarSemLogin").addEventListener("click", (event) => {
  event.preventDefault();
  entrarComoVisitante();
  location.assign(destinoAposLogin());
});

document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const mensagem = document.getElementById("loginMensagem");
  const botao = event.target.querySelector("button[type='submit']");

  mensagem.textContent = "";
  botao.disabled = true;

  // Servidor gratuito "dorme" sem uso e leva um tempo pra responder na primeira requisição
  const avisoServidor = setTimeout(() => {
    mensagem.textContent = "Conectando ao servidor, isso pode levar até 1 minuto...";
  }, 4000);

  try {
    const resposta = await apiFetch("/login", {
      method: "POST",
      body: {
        emailDigitado: document.getElementById("email").value,
        senhaDigitada: document.getElementById("password").value,
      },
    });

    const resultado = await resposta.json();

    clearTimeout(avisoServidor);
    mensagem.textContent = "";

    if (!resultado.sucesso) {
      mensagem.textContent = resultado.erro || "Não foi possível entrar.";
      return;
    }

    salvarToken(resultado.token);
    sairDoModoVisitante();
    location.replace(destinoAposLogin());
  } catch (erro) {
    console.error("Erro no login:", erro);
    mensagem.textContent = "Não foi possível conectar ao servidor.";
  } finally {
    clearTimeout(avisoServidor);
    botao.disabled = false;
  }
});
