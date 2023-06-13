const express = require('express');
const userController = require('../controllers/user_controller');

const userRouter = express.Router();

// Login route
userRouter.post('/login', userController.login);

// Other routes
userRouter.post('/add-user', userController.addUser);
userRouter.get('/view/all', userController.viewAllUser);
userRouter.get('/view/:id', userController.viewUserDetails);
userRouter.put('/update/:id', userController.updateUser);
userRouter.delete('/delete/:id', userController.deleteUser);

module.exports = userRouter;
