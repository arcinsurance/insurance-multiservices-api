import express from 'express';
import { getCarriers, createCarrier, updateCarrier, deleteCarrier } from '../controllers/carrierController';

const router = express.Router();

// Obtener todos los carriers
router.get('/', getCarriers);

// Crear nuevo carrier
router.post('/', createCarrier);

// Actualizar carrier por id
router.put('/:id', updateCarrier);

// Eliminar carrier por id
router.delete('/:id', deleteCarrier);

export default router;
