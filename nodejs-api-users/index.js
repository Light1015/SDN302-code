const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let users = [
    { id: 1, name: 'Alice', email: "alice@example.com"},
    { id: 2, name: 'Bob', email: "bob@example.com"}
];

// Get all users
app.get('/users', (req, res) => {
    res.json(users);
});

// Get user by ID
app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id == req.params.id);
    if (user) res.json(user);
    else res.status(404).json({ message: "user not found" });
})

// POST create a new user
app.post('/users', (req, res) => {
    const newUser = {
        id: users.length + 1,
        // name: req.body.name,
        // email: req.body.email
        ...req.body
    }
    users.push(newUser);
    res.status(201).json(newUser);
});

// PUT update a user
app.put('/users/:id', (req, res) => {
    const user= users.find(u => u.id == req.params.id);
    if (index !== -1) {
        user[index] = { id: Number(req.params.id), ...req.body};
        res.json(user[index]);
    } else {
        res.status(404).json({ message: "user not found" });    
    }
});

// DELETE a user
app.delete('/users/:id', (req, res) => {
    const index = users.findIndex(u => u.id = req.params.id);
    if (index !== -1) {
        const deleted = users.splice(index, 1);
        res.json(deleted[0]);
    } else {
        res.status(404).json({ message: "user not found" });    
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});