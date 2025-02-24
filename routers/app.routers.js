import express from 'express';

import userController from '../controllers/users.controller.js';
import petController from '../controllers/pets.controller.js';
import foodPetController from '../controllers/foodPets.controller.js';

const router = express.Router();

//USER
router.post('/user/register', userController.register);  
router.post('/user/login', userController.login);  
router.post('/user/deleted', userController.deleted);  

//PET
router.post('/pet/selectedReceivedPet', petController.selectedReceivedPet);  
router.post('/pet/sendFoodToPet', petController.sendFoodToPet);  

//FOOD-PET
router.post('/foodPet/selectedReceiveFoodPet', foodPetController.selectedReceiveFoodPet);  

export default router;