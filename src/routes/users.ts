import { Router } from 'express';
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  updateUserStatus,
} from '../controllers/userController';
import { verifyToken } from '../middlewares/verifyToken';

/*
 * Users routes. These endpoints mirror the expectations of the frontend
 * DataContext. All routes are protected with verifyToken to ensure only
 * authenticated users can access them.
 */

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET /api/users – retrieve all users (agents)
router.get('/', getUsers);

// POST /api/users – create a new user (agent)
router.post('/', createUser);

// PUT /api/users/:id – update an existing user
router.put('/:id', updateUser);

// DELETE /api/users/:id – delete a user
router.delete('/:id', deleteUser);

// PATCH /api/users/:id/status – activate/deactivate a user
router.patch('/:id/status', updateUserStatus);

export default router;