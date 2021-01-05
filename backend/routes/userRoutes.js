import express from 'express';
const router = express.Router();
import {authUser, getUsers, deleteUser, getUserById, updateUser} from '../controllers/userController.js'
import {protect, admin} from '../middleware/authMiddleware.js'

router.route('/').get(protect, admin, getUsers);
router.post('/login', authUser);
//router.route('/profile').get(protect, getUserProfile).put(protect, udpateUserProfile);
router.route('/:id').delete(protect, admin, deleteUser).get(protect, admin, getUserById).put(protect, admin, updateUser);

export default router;