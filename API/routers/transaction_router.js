const express = require('express');
const transactionController = require('../controllers/transaction_controller');

const transactionRouter = express.Router();

// Other routes
transactionRouter.post('/add-transaction/:id', transactionController.addTransaction);
transactionRouter.get('/view/:id', transactionController.viewAllTransaction);
transactionRouter.put('/status/:id', transactionController.cancelTransaction);

module.exports = transactionRouter;
