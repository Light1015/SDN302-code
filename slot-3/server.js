const express = require('express');
const morgan = require('morgan');

const app = express();
const PORT = 3000;

// Middleware
app.use(morgan('dev')); // log request
app.use(express.json()); // parse JSON request body

// Fake database (mảng lưu tasks)
let tasks = [];
let idCounter = 1;

// -------------------- ROUTES CRUD --------------------

// GET /tasks - Lấy tất cả tasks
app.get('/tasks', (req, res) => {
    res.json(tasks);
});

// GET /tasks/:id - Lấy task theo ID
app.get('/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
});

// POST /tasks - Tạo task mới
app.post('/tasks', (req, res) => {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const newTask = { id: idCounter++, title, description: description || '', completed: false };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// PUT /tasks/:id - Cập nhật task
app.put('/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, completed } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;

    res.json(task);
});

// DELETE /tasks/:id - Xóa task
app.delete('/tasks/:id', (req, res) => {
    const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ message: 'Task not found' });

    const deletedTask = tasks.splice(index, 1);
    res.json(deletedTask[0]);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
