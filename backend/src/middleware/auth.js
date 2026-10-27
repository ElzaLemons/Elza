const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

function requireSecret() {
  if (!secret) throw new Error('JWT_SECRET não configurado');
  return secret;
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, perfil: user.perfil, nome: user.nome },
    requireSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' },
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Autenticação necessária' });

  try {
    req.user = jwt.verify(token, requireSecret());
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

function requireProfiles(...profiles) {
  return (req, res, next) => {
    if (!req.user || !profiles.includes(req.user.perfil)) {
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }
    return next();
  };
}

module.exports = { authMiddleware, requireProfiles, signToken };
