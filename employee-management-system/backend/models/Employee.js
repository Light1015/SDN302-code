const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    hireDate: Date,
    salary: Number,
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
});

module.exports = mongoose.model('Employee', employeeSchema);