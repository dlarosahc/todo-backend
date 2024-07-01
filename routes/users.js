const usersRouter = require('express').Router();
const bcrypt = require('bcrypt');
const db = require('../db');

const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@”]+(\.[^<>()[\]\\.,;:\s@”]+)*)|(”.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&()_.,])[a-zA-Z0-9!@#$%^&()_.,]{6,}$/;
usersRouter.post('/', async (req, res) => {
  try {
    // 1. Obtener el usuario y la contraseña del body
    const { email, password } = req.body;

    // 1.1 Verificar que el nombre de usuario es correcto y la contraseña
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        error: 'El email es invalido',
      });
    } else if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        error: 'La contraseña es invalida',
      });
    }

    // 2. Encriptar la contraseña
    const passwordHash = await bcrypt.hash(password, 10);
    // 3. Crear el nuevo usuario
    const statement = db.prepare(`
    INSERT INTO users (email, password)
    VALUES (?, ?)
  `);

    statement.run(email, passwordHash);

    // 4. Enviar la respuesta
    return res.status(201).json({
      message: `El email se ha creado con exito`,
    });
  } catch (error) {
    console.log('ERROR', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        error: 'El email ya esta registrado',
      });
    }
    return res.status(500).json({ error: 'Hubo un error' });
  }
});

module.exports = usersRouter;
