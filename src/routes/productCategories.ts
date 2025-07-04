import express from 'express';
import {
  getAllProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
} from '../controllers/productCategoryController';

const router = express.Router();

router.get('/', getAllProductCategories);
router.post('/', createProductCategory);
router.put('/:id', updateProductCategory);   // ← editar
router.delete('/:id', deleteProductCategory);

export default router;
