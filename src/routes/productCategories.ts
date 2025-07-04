import express from 'express';
import {
  getAllProductCategories,
  createProductCategory,
  deleteProductCategory,
} from '../controllers/productCategoryController';

const router = express.Router();

router.get('/', getAllProductCategories);
router.post('/', createProductCategory);
router.delete('/:id', deleteProductCategory);

export default router;
