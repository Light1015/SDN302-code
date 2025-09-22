const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Define routes for employee operations
router.get('/', employeeController.getAllEmployees);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;