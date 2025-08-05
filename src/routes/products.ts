import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct
} from '../controllers/productController';

const router = Router();

router.post('/', createProduct);
router.get('/', getAllProducts);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
