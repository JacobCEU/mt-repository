const express = require('express');
const storeController = require('../controllers/store_controller');

const storeRouter = express.Router();

// Other routes
storeRouter.post('/add-store', storeController.addStore);
storeRouter.get('/view/all', storeController.viewAllStores);
storeRouter.get('/view/:id', storeController.viewStoreDetails);
storeRouter.put('/update/:id', storeController.updateStore);
storeRouter.delete('/delete/:id', storeController.deleteStore);

module.exports = storeRouter;
