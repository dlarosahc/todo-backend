const db = require('../db');

const validateUser = (req, res, next) => {
  const userId = Number(req.query.userId);

  if (!userId) {
    return res.sendStatus(403);
  }
  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);

  if (!user) {
    return res.sendStatus(403);
  }

  req.userId = user.user_id;
  return next();
};

module.exports = validateUser;
