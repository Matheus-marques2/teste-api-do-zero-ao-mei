// Lógica da Central de Ajuda: categorias, perguntas frequentes e tickets de suporte

function listarCategorias(db) {
    return Object.values(db.categoriasAjuda || {});
}

function listarPerguntas(db, categoria) {
    const perguntas = Object.values(db.perguntasFrequentes || {});

    if (!categoria) {
        return perguntas;
    }

    return perguntas.filter(function(pergunta) {
        return pergunta.id_categoria === Number(categoria);
    });
}

function buscarPerguntas(db, termoBusca) {
    const termo = termoBusca.trim().toLowerCase();
    const perguntas = Object.values(db.perguntasFrequentes || {});

    return perguntas.filter(function(pergunta) {
        return pergunta.pergunta.toLowerCase().includes(termo)
            || pergunta.resposta.toLowerCase().includes(termo);
    });
}

function criarTicket(db, idUsuario, assunto, mensagem) {
    if (!db.tickets) {
        db.tickets = {};
    }

    const tickets = Object.values(db.tickets);

    let maiorId = 0;
    tickets.forEach(function(ticket) {
        if (ticket.id > maiorId) {
            maiorId = ticket.id;
        }
    });

    const novoTicket = {
        id: maiorId + 1,
        id_usuario: idUsuario,
        assunto: assunto.trim(),
        mensagem: mensagem.trim(),
        status: "aberto",
        criado_em: new Date().toISOString()
    };

    db.tickets[novoTicket.id] = novoTicket;

    return novoTicket;
}

function listarTicketsDoUsuario(db, idUsuario) {
    const tickets = Object.values(db.tickets || {});

    return tickets.filter(function(ticket) {
        return ticket.id_usuario === idUsuario;
    });
}

module.exports = {
    listarCategorias,
    listarPerguntas,
    buscarPerguntas,
    criarTicket,
    listarTicketsDoUsuario
};
