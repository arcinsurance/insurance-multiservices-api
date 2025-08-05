import { Router } from 'express';
import { getChatMessages, createChatMessage } from '../controllers/chatMessageController';
import { db } from '../config/db';
import { verifyToken, AuthenticatedRequest } from '../middlewares/verifyToken';

/*
 * Chat routes to support the frontend DataContext expectations.
 *
 * - GET /api/chat/messages      -> returns all chat messages (for now).
 * - GET /api/chat/history/:id   -> returns chat history with a given recipient (filtered server-side).
 * - POST /api/chat/send         -> sends a new chat message from the logged-in user to a recipient.
 */

const router = Router();
router.use(verifyToken);

// GET /chat/messages – fetch all chat messages
router.get('/messages', getChatMessages);

// GET /chat/history/:recipientId – fetch conversation history between current user and recipient
// GET /chat/history/:recipientId – fetch conversation history between current user and recipient
router.get('/history/:recipientId', async (req: AuthenticatedRequest, res) => {
  try {
    const { recipientId } = req.params;
    const currentUserId = req.user?.userId;
    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Fetch messages where (sender=currentUserId AND recipient=recipientId) OR (sender=recipientId AND recipient=currentUserId)
    const [rows] = await db.query(
      `SELECT * FROM chat_messages
       WHERE (sender_id = ? AND recipient_id = ?) 
          OR (sender_id = ? AND recipient_id = ?) 
       ORDER BY timestamp ASC`,
      [currentUserId, recipientId, recipientId, currentUserId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /chat/send – send a new chat message
router.post('/send', async (req: AuthenticatedRequest, res) => {
  try {
    const senderId = req.user?.userId;
    const { recipientId, content } = req.body;
    if (!senderId || !recipientId || !content) {
      return res.status(400).json({ error: 'senderId, recipientId and content are required' });
    }
    // Delegate to createChatMessage but with explicit senderId
    req.body.senderId = senderId;
    await createChatMessage(req, res);
  } catch (err) {
    console.error('Error sending chat message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;