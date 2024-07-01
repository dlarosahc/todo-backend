const tasksRouter = require('express').Router();
const db = require('../db');
const REGEX_ITEM = /^(?=.*[a-zA-Z0-9]).{1,}$/;

// POST ITEM
tasksRouter.post('/', async (req, res) => {
  try {
    // 1. Obtener tarea y checked de body
    const { text, checked } = req.body;

    // 1.1 Verificar que no este vacío
    if (!REGEX_ITEM.test(text)) {
      return res.status(400).json({
        error: 'No puede dejar tareas en blanco',
      });
    }

    // 2. Crear nueva tarea en db
    const statement = db.prepare(`
    INSERT INTO tasks (text, checked, user_id)
    VALUES (?, ?, ?)
    RETURNING *
  `);

    const newTask = statement.get(text, checked, Number(req.query.userId));
    newTask.checked = Number(newTask.checked);
    // 4. Enviar la respuesta
    return res.status(201).json(newTask);
  } catch (error) {
    // En caso de que sea un error desconocido muestro cual es
    console.log('ERROR', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        error: 'El email ya existe',
      });
    }
    return res.status(500).json({ error: 'Hubo un error' });
  }
});

// CHECK TASK
tasksRouter.put('/:id', async (req, res) => {
  try {
    // 1. Obtener tarea del body
    const { checked } = req.body;

    // 2. Actualizar tarea
    const statement = db.prepare(`
    UPDATE tasks
    SET 
      checked = ?
    WHERE tasks_id = ? AND user_id = ?
    RETURNING *
  `);
    const upgradeTask = statement.get(checked, Number(req.params.id), Number(req.query.userId));

    if (!upgradeTask) {
      return res.status(403).json({
        error: 'No tiene los permisos',
      });
    }

    // 4. Enviar la respuesta
    return res.status(200).json(upgradeTask);
  } catch (error) {
    // console.log('ERROR', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        error: 'El email ya existe',
      });
    }
    return res.status(500).json({ error: 'Hubo un error' });
  }
});

// Eliminar
tasksRouter.delete('/:id', async (req, res) => {
  try {
    // Eliminar el contacto
    const statement = db.prepare(`
      DELETE FROM tasks
      WHERE tasks_id = ? AND user_id = ?
      `);
    // guardo cambios en una constante
    const { changes } = statement.run(req.params.id, req.userId);
    // si la tarea no existe
    if (!changes) {
      return res.status(400).json({
        message: 'La tarea ya no existe',
      });
    }

    // Si todo esta OK
    return res.status(200).json({
      message: 'La tarea ha sido eliminada con exito',
    });
  } catch (error) {
    // Visualizar el error
    console.log('ERROR:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        error: 'El email ya existe',
      });
    }
  }
});

module.exports = tasksRouter;
