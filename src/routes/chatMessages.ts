import { Router } from 'express';
import {
  getChatMessages,
  createChatMessage,
} from '../controllers/chatMessageController';

const router = Router();

router.get('/', getChatMessages);
router.post('/', createChatMessage);

export default router;
