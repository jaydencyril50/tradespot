import express from 'express';
import TrashItem from '../models/TrashItem';

const router = express.Router();

// Get all trash items
router.get('/', async (req, res) => {
  try {
    const items = await TrashItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trash items.' });
  }
});

// Add a new trash item
router.post('/', async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required.' });
  }
  try {
    // Prevent duplicate content
    const exists = await TrashItem.findOne({ content: content.trim() });
    if (exists) {
      return res.status(400).json({ error: 'Duplicate content not allowed.' });
    }
    const newItem = new TrashItem({ content: content.trim() });
    await newItem.save();
    res.status(201).json(newItem);
 } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Duplicate content not allowed.' });
    }
    res.status(500).json({ error: 'Failed to add trash item.' });
  }
});

// Search trash items
router.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    let items;
    if (!q || !q.toString().trim()) {
      items = await TrashItem.find().sort({ createdAt: -1 });
    } else {
      items = await TrashItem.find({
        content: { $regex: q.toString().trim(), $options: 'i' }
      }).sort({ createdAt: -1 });
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search trash items.' });
  }
});

export default router;
