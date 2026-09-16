// Cliente da API usado por todas as páginas.
// Páginas do app (tudo fora de auth/) importam com o atributo data-protegida:
// <script src=".../shared/scripts/api.js" data-protegida></script>  (no <head>, antes do CSS pesar)
//
// data-protegida = quem não está logado vai pro login, a não ser que tenha escolhido
// "Continuar sem login" (modo visitante). O visitante navega por tudo, mas botões, campos
// e formulários o levam pro login. Pra liberar algo pro visitante: data-livre-visitante.
// Pra bloquear algo que não é botão/campo (ex.: um ícone clicável): data-requer-login.
//
// Se a API Node (api/server.js) não estiver no ar, as rotas são atendidas pelo "modo local":
// os dados vêm de api/db.json e as alterações ficam salvas no localStorage deste navegador.

// Preencha com a URL da API publicada (ex.: Render/Railway) para usar a API real no GitHub Pages.
const API_URL_PRODUCAO = "";

const emDesenvolvimento = ["localhost", "127.0.0.1"].includes(location.hostname);

function resolverApiUrl() {
    if (location.port === "3000") {
        return location.origin;
    }

    if (emDesenvolvimento) {
        return `${location.protocol}//${location.hostname}:3000`;
    }

    return API_URL_PRODUCAO;
}

const API_URL = resolverApiUrl();

// Raiz do projeto (shared/scripts/ -> ../../), funciona tanto no Pages quanto no Express
const raizProjetoApi = new URL("../../", document.currentScript.src);

const paginaProtegida = document.currentScript.hasAttribute("data-protegida");

const CHAVE_TOKEN = "zerotomei:token";
const CHAVE_VISITANTE = "zerotomei:visitante";
const PREFIXO_TOKEN_LOCAL = "local:";


function caminhoDaRaiz(caminho) {
    return new URL(caminho, raizProjetoApi).href;
}


function lerToken() {
    try {
        return localStorage.getItem(CHAVE_TOKEN);
    } catch {
        return null;
    }
}


function salvarToken(token) {
    try {
        localStorage.setItem(CHAVE_TOKEN, token);
    } catch (erro) {
        console.error("Não foi possível salvar a sessão:", erro);
    }
}


function apagarToken() {
    try {
        localStorage.removeItem(CHAVE_TOKEN);
    } catch {
        // sem storage não há o que apagar
    }
}


function estaLogado() {
    return Boolean(lerToken());
}


// Visitante vale só nesta aba/sessão: ao reabrir o navegador o app começa no login de novo
function eVisitante() {
    try {
        return sessionStorage.getItem(CHAVE_VISITANTE) === "1";
    } catch {
        return false;
    }
}


function entrarComoVisitante() {
    try {
        sessionStorage.setItem(CHAVE_VISITANTE, "1");
    } catch {
        // sem storage o visitante só não é lembrado entre páginas
    }
}


function sairDoModoVisitante() {
    try {
        sessionStorage.removeItem(CHAVE_VISITANTE);
    } catch {
        // nada a limpar
    }
}


// voltar = true guarda a página atual pra retornar a ela depois do login
function irParaLogin({ voltar = false, substituir = true } = {}) {
    const url = new URL(caminhoDaRaiz("pages/auth/Login/index.html"));

    if (voltar) {
        url.searchParams.set("voltar", location.href);
    }

    if (substituir) {
        location.replace(url.href);
    } else {
        location.assign(url.href);
    }
}


// Destino pós-login vindo de ?voltar=, aceito só se for uma página deste app (evita redirecionar pra fora)
function destinoAposLogin() {
    const voltar = new URLSearchParams(location.search).get("voltar");

    if (voltar) {
        try {
            const destino = new URL(voltar, location.href);

            if (destino.href.startsWith(raizProjetoApi.href) && !destino.pathname.includes("/pages/auth/")) {
                return destino.href;
            }
        } catch {
            // voltar inválido: segue pra Tela Inicial
        }
    }

    return caminhoDaRaiz("index.html");
}


// Pra usar antes de uma ação: if (!exigirLogin()) return;
function exigirLogin() {
    if (estaLogado()) {
        return true;
    }

    irParaLogin({ voltar: true, substituir: false });
    return false;
}


async function apiFetch(caminho, opcoes = {}) {
    const token = lerToken();

    // Sessão criada no modo local só vale no modo local (e vice-versa)
    const usarModoLocal = !API_URL || (token && token.startsWith(PREFIXO_TOKEN_LOCAL));

    let resposta;

    if (usarModoLocal) {
        resposta = await modoLocal.atender(caminho, opcoes, token);
    } else {
        try {
            resposta = await fetchApiReal(caminho, opcoes, token);
        } catch (erro) {
            // Falha de rede = servidor fora do ar. Uma sessão da API real não vale no modo local,
            // então quem estava logado nela precisa entrar de novo.
            if (token) {
                apagarToken();

                if (paginaProtegida) {
                    irParaLogin({ voltar: true });
                }

                throw erro;
            }

            console.warn("API indisponível, usando o modo local (api/db.json + localStorage).");
            resposta = await modoLocal.atender(caminho, opcoes, token);
        }
    }

    // Token vencido ou servidor reiniciado: volta pro login
    if (resposta.status === 401 && token && paginaProtegida) {
        apagarToken();
        irParaLogin({ voltar: true });
    }

    return resposta;
}


function fetchApiReal(caminho, opcoes, token) {
    const headers = { ...opcoes.headers };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let corpo = opcoes.body;

    if (corpo !== undefined && typeof corpo !== "string") {
        headers["Content-Type"] = "application/json";
        corpo = JSON.stringify(corpo);
    }

    return fetch(API_URL + caminho, { ...opcoes, headers, body: corpo });
}


let promessaUsuarioLogado = null;

// Busca (uma vez por página) o usuário da sessão; devolve null se não estiver logado
function carregarUsuarioLogado() {
    if (!promessaUsuarioLogado) {
        promessaUsuarioLogado = apiFetch("/api/usuario-logado")
            .then((resposta) => (resposta.ok ? resposta.json() : null))
            .catch((erro) => {
                console.error("Erro ao carregar usuário logado:", erro);
                return null;
            });
    }

    return promessaUsuarioLogado;
}


async function sair() {
    try {
        await apiFetch("/logout", { method: "POST" });
    } catch {
        // mesmo sem resposta da API o usuário sai localmente
    }

    apagarToken();
    sairDoModoVisitante();
    irParaLogin();
}


// ================== Modo local =======================
// Espelha as rotas do api/server.js que o front já usa. Rota nova no front = rota nova aqui.

const modoLocal = (() => {
    const CHAVE_BANCO = "zerotomei:db-local";
    const DURACAO_SESSAO = 1000 * 60 * 60;

    let promessaBanco = null;

    function carregarBanco() {
        if (!promessaBanco) {
            promessaBanco = (async () => {
                try {
                    const salvo = localStorage.getItem(CHAVE_BANCO);

                    if (salvo) {
                        return JSON.parse(salvo);
                    }
                } catch {
                    // storage indisponível ou corrompido: recarrega do db.json
                }

                const resposta = await fetch(caminhoDaRaiz("api/db.json"));

                if (!resposta.ok) {
                    throw new Error(`Não foi possível ler api/db.json (${resposta.status})`);
                }

                return resposta.json();
            })();
        }

        return promessaBanco;
    }

    function salvarBanco(db) {
        try {
            localStorage.setItem(CHAVE_BANCO, JSON.stringify(db));
        } catch (erro) {
            console.error("Não foi possível salvar os dados locais:", erro);
        }
    }

    function json(status, dados) {
        return new Response(JSON.stringify(dados), {
            status,
            headers: { "Content-Type": "application/json" },
        });
    }

    function lerCorpo(opcoes) {
        if (opcoes.body === undefined) {
            return {};
        }

        return typeof opcoes.body === "string" ? JSON.parse(opcoes.body) : opcoes.body;
    }

    function usuarioDaSessao(db, token) {
        const sessao = token && db.sessoesLocais && db.sessoesLocais[token];

        if (!sessao) {
            return null;
        }

        if (Date.now() - sessao.criadaEm > DURACAO_SESSAO) {
            delete db.sessoesLocais[token];
            salvarBanco(db);
            return null;
        }

        return sessao.usuario;
    }

    function perfilPublico(dados, email) {
        return {
            nome: dados.nome,
            email,
            pronome: dados.pronome || "",
            cnpj: dados.cnpj || "",
            sobre: dados.sobre || "",
            numero: dados.numero || "",
        };
    }

    const rotas = {
        "POST /login"(db, { corpo }) {
            const { emailDigitado, senhaDigitada } = corpo;

            if (typeof emailDigitado !== "string" || typeof senhaDigitada !== "string") {
                return json(400, { sucesso: false, erro: "Informe e-mail e senha" });
            }

            const email = emailDigitado.trim().toLowerCase();
            const usuario = db.usuarios[email];

            if (!usuario || usuario.senha !== senhaDigitada) {
                return json(401, { sucesso: false, erro: "E-mail ou senha incorretos" });
            }

            // randomUUID só existe em https/localhost; getRandomValues funciona também por IP da rede
            const aleatorio = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
            const token = PREFIXO_TOKEN_LOCAL + aleatorio;

            db.sessoesLocais = db.sessoesLocais || {};
            db.sessoesLocais[token] = {
                criadaEm: Date.now(),
                usuario: { id_usuario: usuario.id_usuario, nome: usuario.nome, email },
            };
            salvarBanco(db);

            return json(200, { sucesso: true, token });
        },

        "POST /logout"(db, { token }) {
            if (db.sessoesLocais && token) {
                delete db.sessoesLocais[token];
                salvarBanco(db);
            }

            return json(200, { sucesso: true });
        },

        "POST /cadastro"(db, { corpo }) {
            const { nome, sobrenome, email, senha } = corpo;

            if (typeof nome !== "string" || !nome.trim()) {
                return json(400, { sucesso: false, erro: "Nome é um campo obrigatório, preencha-o." });
            }

            if (typeof senha !== "string" || senha.length < 6) {
                return json(400, { sucesso: false, erro: "A senha precisa ter pelo menos 6 caracteres." });
            }

            if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                return json(400, { sucesso: false, erro: "Informe um e-mail válido." });
            }

            const chave = email.trim().toLowerCase();

            if (db.usuarios[chave]) {
                return json(409, { sucesso: false, erro: "E-mail já cadastrado!" });
            }

            const maiorId = Math.max(0, ...Object.values(db.usuarios).map((u) => u.id_usuario));

            db.usuarios[chave] = {
                id_usuario: maiorId + 1,
                nome: nome.trim(),
                sobrenome: sobrenome || "",
                senha,
                cnpj: "",
                numero: "",
                pronome: "",
                sobre: "",
                id_plano: 1,
            };
            salvarBanco(db);

            return json(200, { sucesso: true });
        },

        "GET /api/usuario-logado"(db, { usuario }) {
            return usuario ? json(200, usuario) : json(401, { erro: "Não autenticado" });
        },

        "GET /api/perfil"(db, { usuario }) {
            if (!usuario) {
                return json(401, { erro: "Não autenticado" });
            }

            const dados = db.usuarios[usuario.email];

            if (!dados) {
                return json(404, { erro: "Usuário não encontrado" });
            }

            return json(200, perfilPublico(dados, usuario.email));
        },

        "PUT /api/perfil"(db, { usuario, corpo, token }) {
            if (!usuario) {
                return json(401, { erro: "Não autenticado" });
            }

            const emailAtual = usuario.email;
            const dados = db.usuarios[emailAtual];

            if (!dados) {
                return json(404, { erro: "Usuário não encontrado" });
            }

            const {
                nome = dados.nome,
                pronome = dados.pronome || "",
                email = emailAtual,
                sobre = dados.sobre || "",
                numero = dados.numero || "",
                cnpj = dados.cnpj || "",
            } = corpo;

            if (typeof nome !== "string" || !nome.trim()) {
                return json(400, { erro: "O nome é obrigatório" });
            }

            if (typeof email !== "string" || !email.trim()) {
                return json(400, { erro: "O e-mail é obrigatório" });
            }

            const novoEmail = email.trim().toLowerCase();

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail)) {
                return json(400, { erro: "Informe um e-mail em um formato válido" });
            }

            if (novoEmail !== emailAtual) {
                if (db.usuarios[novoEmail]) {
                    return json(409, { erro: "Email já está sendo utilizado." });
                }

                delete db.usuarios[emailAtual];
                db.usuarios[novoEmail] = dados;
            }

            dados.nome = nome.trim();
            dados.sobre = String(sobre).trim();
            dados.numero = String(numero).trim();
            dados.cnpj = String(cnpj).trim();
            dados.pronome = String(pronome).trim();

            const sessao = db.sessoesLocais[token];
            sessao.usuario.nome = dados.nome;
            sessao.usuario.email = novoEmail;

            salvarBanco(db);

            return json(200, { sucesso: true, perfil: perfilPublico(dados, novoEmail) });
        },

        "GET /api/financeiro/resumo"(db, { usuario, query }) {
            if (!usuario) {
                return json(401, { erro: "Não autenticado" });
            }

            const hoje = new Date();
            const mes = query.has("mes") ? Number(query.get("mes")) : hoje.getMonth() + 1;
            const ano = query.has("ano") ? Number(query.get("ano")) : hoje.getFullYear();

            if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
                return json(400, { erro: "Mês inválido" });
            }

            if (!Number.isInteger(ano)) {
                return json(400, { erro: "Ano inválido" });
            }

            const movimentacoes = Object.values(db.movimentacoes || {})
                .filter((m) => m.id_usuario === usuario.id_usuario);

            function totaisDoMes(mesAlvo, anoAlvo) {
                const totais = { entradas: 0, saidas: 0 };

                movimentacoes.forEach((m) => {
                    const [anoMov, mesMov] = m.data.split("-").map(Number);

                    if (anoMov !== anoAlvo || mesMov !== mesAlvo) {
                        return;
                    }

                    if (m.tipo === "entrada") totais.entradas += Number(m.valor);
                    if (m.tipo === "saida") totais.saidas += Number(m.valor);
                });

                return totais;
            }

            function variacao(atual, anterior) {
                return anterior === 0 ? null : Number((((atual - anterior) / anterior) * 100).toFixed(2));
            }

            const { entradas, saidas } = totaisDoMes(mes, ano);
            const anterior = totaisDoMes(mes === 1 ? 12 : mes - 1, mes === 1 ? ano - 1 : ano);
            const total = entradas + saidas;

            return json(200, {
                mes,
                ano,
                entrada: entradas,
                saida: saidas,
                lucro: entradas - saidas,
                total_movimentado: total,
                percentual_entradas: total ? Number(((entradas / total) * 100).toFixed(2)) : 0,
                percentual_saidas: total ? Number(((saidas / total) * 100).toFixed(2)) : 0,
                comparacao_mes_anterior: {
                    entrada: variacao(entradas, anterior.entradas),
                    saida: variacao(saidas, anterior.saidas),
                },
            });
        },
    };

    async function atender(caminho, opcoes, token) {
        const url = new URL(caminho, "http://modo-local");
        const metodo = (opcoes.method || "GET").toUpperCase();
        const rota = rotas[`${metodo} ${url.pathname}`];

        if (!rota) {
            return json(501, { erro: `Rota ${metodo} ${url.pathname} ainda não existe no modo local` });
        }

        const db = await carregarBanco();

        return rota(db, {
            corpo: lerCorpo(opcoes),
            query: url.searchParams,
            token,
            usuario: usuarioDaSessao(db, token),
        });
    }

    return { atender };
})();


// ================== Modo visitante =======================

const SELETOR_LIVRE_VISITANTE = "#navbar-global, #menu-lateral, [data-abrir-menu], [data-fechar-menu], [data-livre-visitante]";

function bloquearFuncionalidadesVisitante() {
    function mandarProLogin(evento) {
        evento.preventDefault();
        evento.stopImmediatePropagation();
        irParaLogin({ voltar: true, substituir: false });
    }

    // Links (<a>) continuam navegando; o que "faz algo" leva pro login
    document.addEventListener("click", (evento) => {
        const alvo = evento.target.closest("button, input, textarea, select, [role='button'], [data-requer-login]");

        if (alvo && !alvo.closest(SELETOR_LIVRE_VISITANTE)) {
            mandarProLogin(evento);
        }
    }, true);

    // Cobre também chegar num campo pelo teclado (Tab)
    document.addEventListener("focusin", (evento) => {
        const campo = evento.target;

        if (campo.matches("input, textarea, select") && !campo.closest(SELETOR_LIVRE_VISITANTE)) {
            campo.blur();
            mandarProLogin(evento);
        }
    }, true);

    document.addEventListener("submit", (evento) => {
        if (!evento.target.closest(SELETOR_LIVRE_VISITANTE)) {
            mandarProLogin(evento);
        }
    }, true);

    document.documentElement.classList.add("modo-visitante");
}


if (paginaProtegida && !estaLogado()) {
    if (eVisitante()) {
        bloquearFuncionalidadesVisitante();
    } else {
        // Nem desenha a página: o app começa no login
        irParaLogin({ voltar: true });
    }
}
