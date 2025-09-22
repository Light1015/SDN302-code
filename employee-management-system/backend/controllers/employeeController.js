const Employee = require('../models/Employee');

exports.getAllEmployees = async (req, res) => {
    try {
        const emloyees = await Employee.find()
            .populate('department')
            .populate('projects');
        res.json(emloyees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createEmployee = async (req, res) => {
    try {
        const newEmployee = new Employee(req.body);
        await newEmployee.save();
        res.status(201).json(newEmployee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const updateEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });
        if (!updateEmployee) return res.status(404).json({ message: 'Employee not found' });
        res.json(updateEmployee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.deleteEmployee = async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
