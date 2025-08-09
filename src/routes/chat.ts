import { Router } from 'express';
import { getChatMessages, createChatMessage } from '../controllers/chatMessageController';
import { db } from '../config/db';
import { verifyToken, AuthenticatedRequest } from '../middlewares/verifyToken';

const router = Router();

/**
 * Valida UUID v4 (formato 8-4-4-4-12).
 * Si tu DB usa otro formato para IDs (por ejemplo int autoincremental),
 * cambia esta función acorde.
 */
const isUuid = (v?: string): v is string =>
  !!v &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

// Todas estas rutas requieren auth
router.use(verifyToken);

/*
 * Chat routes to support the frontend DataContext expectations.
 *
 * - GET /api/chat/messages        -> returns all chat messages (for now).
 * - GET /api/chat/history/:id     -> returns chat history with a given recipient (filtered server-side).
 * - POST /api/chat/send           -> sends a new chat message from the logged-in user to a recipient.
 */

// GET /chat/messages – fetch all chat messages
router.get('/messages', getChatMessages);

// GET /chat/history/:recipientId – fetch conversation history between current user and recipient
router.get('/history/:recipientId', async (req: AuthenticatedRequest, res) => {
  try {
    const { recipientId } = req.params;
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 🔒 Validación de UUID para evitar 500 por IDs truncados/invalidos
    if (!isUuid(recipientId)) {
      return res.status(400).json({ error: 'Invalid recipientId (UUID required)' });
    }

    // Fetch messages where (sender=currentUserId AND recipient=recipientId)
    // OR (sender=recipientId AND recipient=currentUserId)
    const [rows] = await db.query(
      `SELECT * FROM chat_messages
       WHERE (sender_id = ? AND recipient_id = ?)
          OR (sender_id = ? AND recipient_id = ?)
       ORDER BY timestamp ASC`,
      [currentUserId, recipientId, recipientId, currentUserId]
    );

    // Si quieres diferenciar "sin mensajes" de "recipiente inexistente", puedes devolver 200 []
    // Aquí devolvemos 200 con el array (posiblemente vacío)
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching chat history:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /chat/send – send a new chat message
router.post('/send', async (req: AuthenticatedRequest, res) => {
  try {
    const senderId = req.user?.userId;
    const { recipientId, content } = req.body || {};

    if (!senderId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // 🔒 Validaciones de payload
    if (!isUuid(recipientId)) {
      return res.status(400).json({ error: 'Invalid recipientId (UUID required)' });
    }
    if (typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }
    if (content.length > 5000) {
      // opcional: limitar tamaño
      return res.status(413).json({ error: 'Message too large' });
    }

    // Delegate to createChatMessage but with explicit senderId
    req.body.senderId = senderId;
    return await createChatMessage(req, res);
  } catch (err) {
    console.error('Error sending chat message:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
