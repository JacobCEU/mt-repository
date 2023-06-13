const express = require('express');
const transactionController = require('../controllers/transaction_controller');

const transactionRouter = express.Router();

// Other routes
transactionRouter.post('/add-transaction/:id', transactionController.addTransaction);
transactionRouter.get('/view/:id', transactionController.viewAllTransaction);
transactionRouter.put('/update/:id', transactionController.updateTransaction);
transactionRouter.delete('/delete/:id', transactionController.deleteTransaction);

module.exports = transactionRouter;
