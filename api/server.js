// Importando a lib Express para este arquivo e armazenando os seus recursos na constante app
const express = require("express");
const app = express();
const fs = require("fs");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");

// Usando a lib path para conseguir utilizar os arquivos locais do sistema como banco de dados em Json e as paginas web criadas
const path = require("path");

// Exportando o banco de dados Json
const db = JSON.parse(fs.readFileSync(path.join(__dirname, "db.json")));

function salvarBanco() {
    fs.writeFileSync(
        path.join(__dirname, "db.json"),
        JSON.stringify(db, null, 4)
    );
}

// ================== CORS =======================
// O front fica no GitHub Pages (outro domínio), então a API precisa liberar o acesso.
// A autenticação é por token no header Authorization (não usa cookie), por isso "*" é seguro aqui.
app.use(function(request, response, next){
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

    if(request.method === "OPTIONS"){
        response.sendStatus(204);
        return;
    }

    next();
});

// Da acesso a raiz do projeto (fora da pasta /api) ao express para receber
// recursos de estilizacao e script como css e js (pages/, shared/, index.html).
// Tudo que começa com /api/ fica de fora, senão db.json e server.js seriam baixáveis.
const arquivosEstaticos = express.static(path.join(__dirname, ".."));

app.use(function(request, response, next){
    if(request.path.startsWith("/api/")){
        next();
        return;
    }

    arquivosEstaticos(request, response, next);
});

// Interpletar dados dos formulários
app.use(express.urlencoded( {extended: true} ));

app.use(express.json());

// ================== MIDLEWARE de sessão por token =======================
// Cookies entre domínios diferentes (github.io -> host da API) são bloqueados por
// Safari/iOS, então o login devolve um token que o front manda em "Authorization: Bearer".
// As sessões ficam em memória: reiniciar o servidor desloga todo mundo.

const DURACAO_SESSAO = 1000 * 60 * 60;
const sessoes = new Map();

app.use(function(request, response, next){
    const [tipo, token] = (request.headers.authorization || "").split(" ");
    const sessao = tipo === "Bearer" ? sessoes.get(token) : undefined;

    if(sessao && Date.now() - sessao.criadaEm > DURACAO_SESSAO){
        sessoes.delete(token);
        request.session = {};
    } else {
        request.session = sessao || {};
    }

    request.token = token;
    next();
});

// ================== Rotas GET para renderizar páginas =======================


// Coloca o arquivo index como rota principal do sistema
app.get("/home", function(request, response){
    response.sendFile(path.join(__dirname, "..", "index.html"));
});

app.get("/login", function(request, response){
    response.sendFile(path.join(__dirname, "..", "pages", "auth", "Login", "index.html"));
});

app.get("/cadastro", function(request, response){
    response.sendFile(path.join(__dirname, "..", "pages", "auth", "Cadastro", "index.html"));
});

app.get("/cursos", function(request,response){
    response.sendFile(path.join(__dirname, "..", "pages", "Mentorias", "Cursos", "index.html"));
});

app.get("/mentorias", function(request,response){
    response.sendFile(path.join(__dirname, "..", "pages", "Mentorias", "Mentoria", "index.html"));
});

app.get("/perfil", function(request, response){
    response.sendFile(path.join(__dirname, "..", "pages", "Menu", "InformaçõesPessoais", "index.html"));
});

app.get("/financeiro", function(request, response){
    response.sendFile(path.join(__dirname, "..", "pages", "Financeiro", "VisãoGeral", "index.html"));
});

app.get("/tarefas", function(request, response){
    response.sendFile(path.join(__dirname, "..", "pages", "Atividades", "VisãoGeral", "index.html"));
});

app.get("/configuracoes", function(request, response){
    response.sendFile(path.join(__dirname, "..", "pages", "Menu", "Configurações", "index.html"));
});

app.get("/obrigacoes", function(request, response){
    response.sendFile(path.join(__dirname, "..", "pages", "MeuMEI", "Obrigações", "index.html"));
});

app.get("/guias", function(request, response){
    response.sendFile(path.join(__dirname, "..", "pages", "MeuMEI", "Guias", "index.html"));
});

app.get("/visaoGeral", function(request, response){
    response.sendFile(path.join(__dirname, "..", "pages", "MeuMEI", "MeuMei", "index.html"));
});

app.get("/api/cursos", function(request, response){
    response.json(db.cursos);
});

app.get("/assinaturas", function(request, response){
    response.sendFile(path.join(__dirname, "..", "pages", "Menu", "Assinatura", "index.html"));
});

app.get("/suporte", function(request, response){
    response.sendFile(path.join(__dirname, "..", "pages", "Menu", "CentralDeAjuda", "index.html"));
});

//Rota de api para o front consumir e conseguir ver se o user está logado
app.get("/api/usuario-logado", function(request, response){
    if(!request.session.usuario){
        response.status(401).json({ erro: "Não autenticado" });
        return;
    }
    response.json(request.session.usuario);
});

// Rota de api para o front buscar somente as tarefas do usuário que está logado
app.get("/api/tarefas", function(request, response){

    if(!request.session.usuario){
        response.status(401).json({ erro: "Não autenticado" });
        return;
    }

    const idUsuarioLogado = request.session.usuario.id_usuario;

    const todasTarefas = Object.values(db.tarefas);

    const tarefasDoUsuario = todasTarefas.filter(function(tarefa) {
        return tarefa.id_usuario === idUsuarioLogado;
    });

    response.json(tarefasDoUsuario);
});

app.get("/api/perfil", function(request,response){
    if(!request.session.usuario){
        response.status(401).json({erro: "Não autenticado"});
        return;
    }

    const usuario = db.usuarios[request.session.usuario.email];

    if(!usuario){
        response.status(404).json({erro: "Usuário não encontrado"});
        return;
    }

    response.json({
        nome: usuario.nome,
        email: request.session.usuario.email,
        pronome: usuario.pronome || "",
        cnpj: usuario.cnpj || "",
        sobre: usuario.sobre || "",
        numero: usuario.numero
    })
});

app.get("/api/mentorias", function(request, response){
    const mentoriasComProfessor = {};

    Object.entries(db.mentorias).forEach(function([id, mentoria]){
        const professor = db.professores[mentoria.id_professor];

        mentoriasComProfessor[id] = {
            ...mentoria,
            mentor: professor ? professor.nome : "Mentor não encontrado"
        };
    });

    response.json(mentoriasComProfessor);
});

app.get("/api/negocio", function(request, response){
    if(!request.session.usuario){
        response.status(401).json({ erro: "Não autenticado" });
        return;
    }

    const idUsuarioLogado = request.session.usuario.id_usuario;
    const negocio = db.negocios[idUsuarioLogado];

    response.json({
        nome_usuario: request.session.usuario.nome, // vem da sessão, não é editável aqui
        cnpj: negocio ? negocio.cnpj : "",
        nome_negocio: negocio ? negocio.nome_negocio : "",
        situacao: negocio ? negocio.situacao : ""
    });
});

app.get("/api/obrigacoes", function(request, response){
    response.json(db.obrigacoes);
});


app.get("/api/guias", function(request, response){
    response.json(db.guias);
});

// Rotas Financeiro

// Retorna o resumo financeiro do usuário logado.
// Pode receber mês e ano:
// GET /api/financeiro/resumo?mes=8&ano=2026
app.get("/api/financeiro/resumo", function(request, response) {

    if (!request.session.usuario) {
        response.status(401).json({
            erro: "Não autenticado"
        });
        return;
    }

    const idUsuario = request.session.usuario.id_usuario;

    const hoje = new Date();

    const mes = request.query.mes
        ? Number(request.query.mes)
        : hoje.getMonth() + 1;

    const ano = request.query.ano
        ? Number(request.query.ano)
        : hoje.getFullYear();


    if (mes < 1 || mes > 12 || !Number.isInteger(mes)) {
        response.status(400).json({
            erro: "Mês inválido"
        });
        return;
    }

    if (!Number.isInteger(ano)) {
        response.status(400).json({
            erro: "Ano inválido"
        });
        return;
    }


    const movimentacoes = Object.values(db.movimentacoes || {});

    // Movimentações apenas do usuário logado
    const movimentacoesUsuario = movimentacoes.filter(function(movimentacao) {
        return movimentacao.id_usuario === idUsuario;
    });


    function totaisDoMes(mesAlvo, anoAlvo) {
        const totais = { entradas: 0, saidas: 0 };

        movimentacoesUsuario.forEach(function(movimentacao) {
            const [anoMovimento, mesMovimento] = movimentacao.data
                .split("-")
                .map(Number);

            if (anoMovimento !== anoAlvo || mesMovimento !== mesAlvo) {
                return;
            }

            if (movimentacao.tipo === "entrada") {
                totais.entradas += Number(movimentacao.valor);
            }

            if (movimentacao.tipo === "saida") {
                totais.saidas += Number(movimentacao.valor);
            }
        });

        return totais;
    }

    // Variação percentual; null quando o mês anterior não tem valor pra comparar
    function variacao(atual, anterior) {
        if (anterior === 0) {
            return null;
        }

        return Number((((atual - anterior) / anterior) * 100).toFixed(2));
    }

    const { entradas, saidas } = totaisDoMes(mes, ano);

    const mesAnterior = mes === 1 ? 12 : mes - 1;
    const anoDoMesAnterior = mes === 1 ? ano - 1 : ano;
    const anterior = totaisDoMes(mesAnterior, anoDoMesAnterior);


    const lucro = entradas - saidas;

    const totalMovimentado = entradas + saidas;

    let percentualEntradas = 0;
    let percentualSaidas = 0;

    if (totalMovimentado > 0) {
        percentualEntradas = (entradas / totalMovimentado) * 100;
        percentualSaidas = (saidas / totalMovimentado) * 100;
    }


    response.json({
        mes: mes,
        ano: ano,

        entrada: entradas,
        saida: saidas,
        lucro: lucro,

        total_movimentado: totalMovimentado,

        percentual_entradas: Number(percentualEntradas.toFixed(2)),
        percentual_saidas: Number(percentualSaidas.toFixed(2)),

        comparacao_mes_anterior: {
            entrada: variacao(entradas, anterior.entradas),
            saida: variacao(saidas, anterior.saidas)
        }
    });

});

app.delete("/api/financeiro/movimentacoes/:id", function(request, response) {

    if (!request.session.usuario) {
        response.status(401).json({
            erro: "Não autenticado"
        });
        return;
    }

    const id = request.params.id;
    const movimentacao = db.movimentacoes?.[id];


    if (!movimentacao) {
        response.status(404).json({
            erro: "Movimentação não encontrada"
        });
        return;
    }


    if (movimentacao.id_usuario !== request.session.usuario.id_usuario) {
        response.status(403).json({
            erro: "Essa movimentação não pertence a você"
        });
        return;
    }

    delete db.movimentacoes[id];
    salvarBanco();

    response.json({
        sucesso: true
    });

});

app.get("/api/financeiro/movimentacoes", function(request, response) {

    if (!request.session.usuario) {
        response.status(401).json({
            erro: "Não autenticado"
        });
        return;
    }

    const idUsuario = request.session.usuario.id_usuario;

    const { mes, ano, tipo } = request.query;

    let movimentacoes = Object.values(db.movimentacoes || {});

    // Somente movimentações do usuário logado
    movimentacoes = movimentacoes.filter(function(movimentacao) {
        return movimentacao.id_usuario === idUsuario;
    });


    // Filtra por tipo, caso seja informado
    if (tipo) {

        if (tipo !== "entrada" && tipo !== "saida") {
            response.status(400).json({
                erro: "Tipo inválido. Use 'entrada' ou 'saida'"
            });
            return;
        }

        movimentacoes = movimentacoes.filter(function(movimentacao) {
            return movimentacao.tipo === tipo;
        });
    }


    // Filtra mês e ano
    if (mes && ano) {

        movimentacoes = movimentacoes.filter(function(movimentacao) {

            const [anoMovimento, mesMovimento] = movimentacao.data
                .split("-")
                .map(Number);

            return (
                anoMovimento === Number(ano) &&
                mesMovimento === Number(mes)
            );
        });

    }


    // Mais recentes primeiro
    movimentacoes.sort(function(a, b) {
        return new Date(b.data) - new Date(a.data);
    });


    response.json(movimentacoes);
});

app.post("/api/financeiro/movimentacoes", function(request, response) {

    if (!request.session.usuario) {
        response.status(401).json({
            erro: "Não autenticado"
        });
        return;
    }


    const { descricao, valor, tipo, data } = request.body;


    if (!descricao || !descricao.trim()) {
        response.status(400).json({
            erro: "A descrição é obrigatória"
        });
        return;
    }


    const valorNumero = Number(valor);

    if (!valorNumero || valorNumero <= 0) {
        response.status(400).json({
            erro: "Informe um valor maior que zero"
        });
        return;
    }


    if (tipo !== "entrada" && tipo !== "saida") {
        response.status(400).json({
            erro: "O tipo deve ser 'entrada' ou 'saida'"
        });
        return;
    }


    if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        response.status(400).json({
            erro: "Informe uma data no formato AAAA-MM-DD"
        });
        return;
    }


    if (!db.movimentacoes) {
        db.movimentacoes = {};
    }


    const movimentacoes = Object.values(db.movimentacoes);

    let maiorId = 0;

    movimentacoes.forEach(function(movimentacao) {
        if (movimentacao.id > maiorId) {
            maiorId = movimentacao.id;
        }
    });


    const novoId = maiorId + 1;


    const novaMovimentacao = {
        id: novoId,
        id_usuario: request.session.usuario.id_usuario,
        descricao: descricao.trim(),
        valor: valorNumero,
        tipo: tipo,
        data: data
    };


    db.movimentacoes[novoId] = novaMovimentacao;


    salvarBanco();


    response.status(201).json({
        sucesso: true,
        movimentacao: novaMovimentacao
    });

});

// ================== Rotas para POST =======================

app.post("/cadastro", [
    body("nome").trim().notEmpty().withMessage("Nome é um campo obrigatório, preencha-o."),
    body("senha").isLength({ min: 6 }).withMessage("A senha precisa ter pelo menos 6 caracteres."),
    body("email").isEmail().withMessage("Informe um e-mail válido."),
], function(request, response){
    const {nome, sobrenome, email, senha} = request.body;

    const errors = validationResult(request);

    if(!errors.isEmpty()){
        response.status(400).json({ sucesso: false, erro: errors.array()[0].msg });
        return;
    }

    if(db.usuarios[email.trim().toLowerCase()]){
        response.status(409).json({ sucesso: false, erro: "E-mail já cadastrado!" });
        return;
    }

    const usuarios = Object.values(db.usuarios);

    let maiorId = 0;

    usuarios.forEach(function(usuario) {
        if (usuario.id_usuario > maiorId) {
            maiorId = usuario.id_usuario;
        }
    });

    db.usuarios[email.trim().toLowerCase()] = {
        id_usuario: maiorId + 1,
        nome: nome.trim(),
        sobrenome: sobrenome || "",
        senha: senha,
        cnpj: "",
        numero: "",
        pronome: "",
        sobre: "",
        id_plano: 1
    }

    fs.writeFileSync(
        path.join(__dirname, "db.json"),
        JSON.stringify(db, null, 4)
    );
    
    response.json({
        sucesso: true
    });

});

app.post("/login", function(request, response) {

    const { emailDigitado, senhaDigitada } = request.body;

    if (typeof emailDigitado !== "string" || typeof senhaDigitada !== "string") {
        response.status(400).json({ sucesso: false, erro: "Informe e-mail e senha" });
        return;
    }

    // Normaliza o e-mail UMA vez e usa esse mesmo valor pra localizar
    // o usuário e pra guardar na sessão (evita divergência com o perfil)
    const emailNormalizado = emailDigitado.trim().toLowerCase();

    // tem que localizar o usuario pelo o email
    const usuario = db.usuarios[emailNormalizado];

    // Mesma mensagem pros dois casos pra não revelar quais e-mails existem
    if (!usuario || usuario.senha !== senhaDigitada) {
        response.status(401).json({ sucesso: false, erro: "E-mail ou senha incorretos" });
        return;
    }

    const token = crypto.randomUUID();

    sessoes.set(token, {
        criadaEm: Date.now(),
        usuario: {
            id_usuario: usuario.id_usuario,
            nome: usuario.nome,
            email: emailNormalizado
        }
    });

    response.json({ sucesso: true, token: token });
});

app.post("/logout", function(request, response) {
    sessoes.delete(request.token);
    response.json({ sucesso: true });
});


app.post("/tarefas", function(request, response){

    // Só deixa criar tarefa se o usuário estiver logado
    if(!request.session.usuario){
        response.status(401).json({ erro: "Não autenticado" });
        return;
    }

    const { titulo, descricao } = request.body;

    if(!titulo){
        response.status(400).json({ erro: "O título da tarefa é obrigatório" });
        return;
    }

    const tarefas = Object.values(db.tarefas);

    let maiorId = 0;

    tarefas.forEach(function(tarefa) {
        if (tarefa.id > maiorId) {
            maiorId = tarefa.id;
        }
    });

    const novoId = maiorId + 1;

    const novaTarefa = {
        id: novoId,
        id_usuario: request.session.usuario.id_usuario,
        titulo: titulo,
        descricao: descricao || "",
        status: "pendente"
    };

    db.tarefas[novoId] = novaTarefa;

    fs.writeFileSync(
        path.join(__dirname, "db.json"),
        JSON.stringify(db, null, 4)
    );

    response.json({
        sucesso: true,
        tarefa: novaTarefa
    });

});

app.delete("/tarefas/:id", function(request, response){

    // Só deixa apagar tarefa se o usuário estiver logado
    if(!request.session.usuario){
        response.status(401).json({ erro: "Não autenticado" });
        return;
    }

    const idTarefa = request.params.id;

    const tarefa = db.tarefas[idTarefa];

    // Verifica se a tarefa existe
    if(!tarefa){
        response.status(404).json({ erro: "Tarefa não encontrada" });
        return;
    }

    // Verifica se a tarefa pertence ao usuário logado (ninguém apaga tarefa de outra pessoa)
    if(tarefa.id_usuario !== request.session.usuario.id_usuario){
        response.status(403).json({ erro: "Essa tarefa não pertence a você" });
        return;
    }

    delete db.tarefas[idTarefa];

    fs.writeFileSync(
        path.join(__dirname, "db.json"),
        JSON.stringify(db, null, 4)
    );

    response.json({
        sucesso: true
    });

});

// Atualiza título, descrição e/ou status de uma tarefa (edição do CRUD)
app.put("/tarefas/:id", function(request, response){

    if(!request.session.usuario){
        response.status(401).json({ erro: "Não autenticado" });
        return;
    }

    const idTarefa = request.params.id;
    const tarefa = db.tarefas[idTarefa];

    if(!tarefa){
        response.status(404).json({ erro: "Tarefa não encontrada" });
        return;
    }

    if(tarefa.id_usuario !== request.session.usuario.id_usuario){
        response.status(403).json({ erro: "Essa tarefa não pertence a você" });
        return;
    }

    const { titulo, descricao, status } = request.body;

    if(titulo !== undefined){
        if(!titulo.trim()){
            response.status(400).json({ erro: "O título da tarefa é obrigatório" });
            return;
        }
        tarefa.titulo = titulo;
    }

    if(descricao !== undefined){
        tarefa.descricao = descricao;
    }

    if(status !== undefined){
        if(status !== "pendente" && status !== "concluida"){
            response.status(400).json({ erro: "Status inválido, use 'pendente' ou 'concluida'" });
            return;
        }
        tarefa.status = status;
    }

    fs.writeFileSync(
        path.join(__dirname, "db.json"),
        JSON.stringify(db, null, 4)
    );

    response.json({
        sucesso: true,
        tarefa: tarefa
    });

});

// ================== Rotas para PUT =======================

app.put("/api/perfil", function(request, response){
    if(!request.session.usuario){
        response.status(401).json({erro: "Não autenticado"})
        return;
    }

    const emailAtual = request.session.usuario.email;
    const usuario = db.usuarios[emailAtual];

    if(!usuario){
        response.status(404).json({erro: "Usuário não encontrado"});
        return;
    }

    // Campo não enviado mantém o valor atual (antes virava undefined e sumia do db.json)
    const {
        nome = usuario.nome,
        pronome = usuario.pronome || "",
        email = emailAtual,
        sobre = usuario.sobre || "",
        numero = usuario.numero || "",
        cnpj = usuario.cnpj || ""
    } = request.body;

    if(typeof nome !== "string" || !nome.trim()){
        response.status(400).json({erro: "O nome é obrigatório"});
        return;
    }

    //valida presença e tipo ANTES de chamar .trim() (antes disso,
    // e-mail ausente/undefined derrubava o servidor com erro 500)
    if(typeof email !== "string" || !email.trim()){
        response.status(400).json({erro: "O e-mail é obrigatório"});
        return;
    }
    
    const novoEmail = email.trim().toLowerCase();

    // valida o FORMATO do e-mail antes de trocar a chave do usuário
    // e gravar (normalizar caixa/espaços não garante que seja um e-mail válido)
    const formatoDeEmailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail);
    if(!formatoDeEmailValido){
        response.status(400).json({erro: "Informe um e-mail em um formato válido"});
        return;
    }

    if(novoEmail !== emailAtual){
        if(db.usuarios[novoEmail]){
            response.status(409).json({erro: "Email já está sendo utilizado."});
            return;
        }

        delete db.usuarios[emailAtual];
        db.usuarios[novoEmail] = usuario;
    }

    //atualiza os campos no obejto
    usuario.nome = nome.trim();
    usuario.sobre = String(sobre).trim();
    usuario.numero = String(numero).trim();
    usuario.cnpj = String(cnpj).trim();
    usuario.pronome = String(pronome).trim();

    fs.writeFileSync(
        path.join(__dirname, "db.json"),
        JSON.stringify(db, null, 4)
    );

    //mantém a sessão atual com os dados novos
    request.session.usuario.nome = usuario.nome;
    request.session.usuario.email = novoEmail;

    response.json({
        sucesso: true,
        perfil: {
            nome: usuario.nome,
            email: novoEmail,
            pronome: usuario.pronome,
            cnpj: usuario.cnpj,
            sobre: usuario.sobre,
            numero: usuario.numero
        }
    });
})

app.put("/api/negocio", function(request, response){
    if(!request.session.usuario){
        response.status(401).json({ erro: "Não autenticado" });
        return;
    }
 
    const { cnpj, nome_negocio, situacao } = request.body;
 
    if(!cnpj || !nome_negocio || !situacao){
        response.status(400).json({ erro: "Preencha CNPJ, nome do negócio e situação" });
        return;
    }
 
    const idUsuarioLogado = request.session.usuario.id_usuario;
 
    db.negocios[idUsuarioLogado] = {
        cnpj: cnpj,
        nome_negocio: nome_negocio,
        situacao: situacao
    };
 
    fs.writeFileSync(
        path.join(__dirname, "db.json"),
        JSON.stringify(db, null, 4)
    );
 
    response.json({ sucesso: true });
});

app.put("/api/obrigacoes/:id", function(request, response){
    if(!request.session.usuario){
        response.status(401).json({ erro: "Não autenticado" });
        return;
    }
 
    const idObrigacao = request.params.id;
    const obrigacao = db.obrigacoes[idObrigacao];
 
    if(!obrigacao){
        response.status(404).json({ erro: "Obrigação não encontrada" });
        return;
    }
 
    const { status } = request.body;
    const statusValidos = ["Em dia", "Pendente", "Concluida"];
 
    if(!statusValidos.includes(status)){
        response.status(400).json({ erro: "Status inválido" });
        return;
    }
 
    obrigacao.status = status;
 
    fs.writeFileSync(
        path.join(__dirname, "db.json"),
        JSON.stringify(db, null, 4)
    );
 
    response.json({ sucesso: true, obrigacao: obrigacao });
});
// Rotas de Calendário (eventos por dia)

// Lista os eventos do usuário logado. Aceita filtro opcional por mês/ano:
// GET /api/eventos?mes=9&ano=2026
app.get("/api/eventos", function(request, response){

    if(!request.session.usuario){
        response.status(401).json({ erro: "Não autenticado" });
        return;
    }

    const idUsuarioLogado = request.session.usuario.id_usuario;
    const { mes, ano } = request.query;

    let eventosDoUsuario = Object.values(db.eventos).filter(function(evento) {
        return evento.id_usuario === idUsuarioLogado;
    });

    if (mes && ano) {
        eventosDoUsuario = eventosDoUsuario.filter(function(evento) {
            const [anoEvento, mesEvento] = evento.data.split("-");
            return Number(mesEvento) === Number(mes) && Number(anoEvento) === Number(ano);
        });
    }

    response.json(eventosDoUsuario);
});

// Cria um novo evento marcado em uma data (formato AAAA-MM-DD)
app.post("/eventos", function(request, response){

    if(!request.session.usuario){
        response.status(401).json({ erro: "Não autenticado" });
        return;
    }

    const { data, titulo, descricao } = request.body;

    if(!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)){
        response.status(400).json({ erro: "Informe uma data válida no formato AAAA-MM-DD" });
        return;
    }

    if(!titulo){
        response.status(400).json({ erro: "O título do evento é obrigatório" });
        return;
    }

    const eventos = Object.values(db.eventos);

    let maiorId = 0;
    eventos.forEach(function(evento) {
        if (evento.id > maiorId) {
            maiorId = evento.id;
        }
    });

    const novoId = maiorId + 1;

    const novoEvento = {
        id: novoId,
        id_usuario: request.session.usuario.id_usuario,
        data: data,
        titulo: titulo,
        descricao: descricao || ""
    };

    db.eventos[novoId] = novoEvento;

    fs.writeFileSync(
        path.join(__dirname, "db.json"),
        JSON.stringify(db, null, 4)
    );

    response.json({
        sucesso: true,
        evento: novoEvento
    });
});

// Edita data, título e/ou descrição de um evento
app.put("/eventos/:id", function(request, response){

    if(!request.session.usuario){
        response.status(401).json({ erro: "Não autenticado" });
        return;
    }

    const idEvento = request.params.id;
    const evento = db.eventos[idEvento];

    if(!evento){
        response.status(404).json({ erro: "Evento não encontrado" });
        return;
    }

    if(evento.id_usuario !== request.session.usuario.id_usuario){
        response.status(403).json({ erro: "Esse evento não pertence a você" });
        return;
    }

    const { data, titulo, descricao } = request.body;

    if(data !== undefined){
        if(!/^\d{4}-\d{2}-\d{2}$/.test(data)){
            response.status(400).json({ erro: "Data inválida, use o formato AAAA-MM-DD" });
            return;
        }
        evento.data = data;
    }

    if(titulo !== undefined){
        if(!titulo.trim()){
            response.status(400).json({ erro: "O título do evento é obrigatório" });
            return;
        }
        evento.titulo = titulo;
    }

    if(descricao !== undefined){
        evento.descricao = descricao;
    }

    fs.writeFileSync(
        path.join(__dirname, "db.json"),
        JSON.stringify(db, null, 4)
    );

    response.json({
        sucesso: true,
        evento: evento
    });
});

// Apaga um evento
app.delete("/eventos/:id", function(request, response){

    if(!request.session.usuario){
        response.status(401).json({ erro: "Não autenticado" });
        return;
    }

    const idEvento = request.params.id;
    const evento = db.eventos[idEvento];

    if(!evento){
        response.status(404).json({ erro: "Evento não encontrado" });
        return;
    }

    if(evento.id_usuario !== request.session.usuario.id_usuario){
        response.status(403).json({ erro: "Esse evento não pertence a você" });
        return;
    }

    delete db.eventos[idEvento];

    fs.writeFileSync(
        path.join(__dirname, "db.json"),
        JSON.stringify(db, null, 4)
    );

    response.json({ sucesso: true });
});

// Rotas da Central de Ajuda

const { listarCategorias, listarPerguntas, buscarPerguntas, criarTicket, listarTicketsDoUsuario } = require("./scripts/ajuda");
 
app.get("/api/ajuda/categorias", function(request, response){
    response.json(listarCategorias(db));
});
 
app.get("/api/ajuda/perguntas", function(request, response){
    const { categoria } = request.query;
    response.json(listarPerguntas(db, categoria));
});
 
app.get("/api/ajuda/busca", function(request, response){
    const { q } = request.query;
 
    if(!q){
        response.status(400).json({ erro: "Informe o termo de busca no parâmetro q" });
        return;
    }
 
    response.json(buscarPerguntas(db, q));
});
 
app.post("/api/ajuda/tickets", function(request, response){
    if(!request.session.usuario){
        response.status(401).json({ erro: "Não autenticado" });
        return;
    }
 
    const { assunto, mensagem } = request.body;
 
    if(!assunto || !assunto.trim()){
        response.status(400).json({ erro: "O assunto do ticket é obrigatório" });
        return;
    }
 
    if(!mensagem || !mensagem.trim()){
        response.status(400).json({ erro: "A mensagem do ticket é obrigatória" });
        return;
    }
 
    const novoTicket = criarTicket(db, request.session.usuario.id_usuario, assunto, mensagem);
 
    fs.writeFileSync(path.join(__dirname, "db.json"), JSON.stringify(db, null, 4));
 
    response.json({ sucesso: true, ticket: novoTicket });
});
 
app.get("/api/ajuda/tickets", function(request, response){
    if(!request.session.usuario){
        response.status(401).json({ erro: "Não autenticado" });
        return;
    }
 
    response.json(listarTicketsDoUsuario(db, request.session.usuario.id_usuario));
});

// Rotas de Planos/Assinaturas

// Lista todos os planos disponíveis (pública, pra tela de Assinaturas)

const { pegarPlanoDoUsuario, usuarioTemAcesso, exigirFeature } = require("./scripts/planos");

app.get("/api/planos", function(request, response){
    response.json(db.planos);
});

// Retorna o plano do usuário logado + suas features
app.get("/api/planos/atual", function(request, response){
    if(!request.session.usuario){
        response.status(401).json({ erro: "Não autenticado" });
        return;
    }

    const plano = pegarPlanoDoUsuario(db, request.session.usuario.id_usuario);
    response.json(plano);
});

// "Assina" um plano novo pro usuário logado
app.post("/api/planos/assinar", function(request, response){
    if(!request.session.usuario){
        response.status(401).json({ erro: "Não autenticado" });
        return;
    }

    const { id_plano } = request.body;

    if(!db.planos[id_plano]){
        response.status(400).json({ erro: "Plano inválido" });
        return;
    }

    const emailUsuario = request.session.usuario.email;
    db.usuarios[emailUsuario].id_plano = Number(id_plano);

    fs.writeFileSync(
        path.join(__dirname, "db.json"),
        JSON.stringify(db, null, 4)
    );

    response.json({
        sucesso: true,
        plano: db.planos[id_plano]
    });
});
// Sobe o servidor na porta 3000
// para acessar execute "node server.js" no terminal
// use CTRL + Click no link gerado ou abra o localhost:3000 no seu navegador
const PORTA = process.env.PORT || 3000;

app.listen(PORTA, function(){
    console.log(`Servidor rodando no endereco: http://localhost:${PORTA}`);
});