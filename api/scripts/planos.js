// Lógica de Planos/Assinaturas: consulta de plano do usuário e checagem de features

function buscarUsuarioPorId(db, idUsuario) {
    return Object.values(db.usuarios || {}).find(function(usuario) {
        return usuario.id_usuario === idUsuario;
    });
}

function pegarPlanoDoUsuario(db, idUsuario) {
    const usuario = buscarUsuarioPorId(db, idUsuario);

    if (!usuario) {
        return null;
    }

    return db.planos[usuario.id_plano] || null;
}

function usuarioTemAcesso(db, idUsuario, feature) {
    const plano = pegarPlanoDoUsuario(db, idUsuario);

    if (!plano) {
        return false;
    }

    return Boolean(plano.features[feature]);
}

// Middleware pra proteger rotas que exigem uma feature específica do plano.
// Recebe o mesmo objeto `db` já carregado pelo server.js (não recarrega do disco,
// senão perderia as alterações feitas em memória por salvarBanco()).
function exigirFeature(db, feature) {
    return function(request, response, next) {
        if (!request.session.usuario) {
            response.status(401).json({ erro: "Não autenticado" });
            return;
        }

        const idUsuarioLogado = request.session.usuario.id_usuario;

        if (!usuarioTemAcesso(db, idUsuarioLogado, feature)) {
            response.status(403).json({ erro: "Seu plano não tem acesso a essa funcionalidade" });
            return;
        }

        next();
    };
}

module.exports = {
    pegarPlanoDoUsuario,
    usuarioTemAcesso,
    exigirFeature
};
