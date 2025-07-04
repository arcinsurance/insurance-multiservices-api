import { Router } from 'express';
import { getAllProducts, createProduct, deleteProduct } from '../controllers/productController';

const router = Router();

router.get('/', getAllProducts);
router.post('/', createProduct);
router.delete('/:id', deleteProduct);

export default router;
