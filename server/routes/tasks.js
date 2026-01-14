import express from 'express';
import Task from '../models/Task.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for logged-in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, In Progress, Completed]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [High, Medium, Low]
 *         description: Filter by priority
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for the logged-in user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { status, priority, category, sortBy, order } = req.query;

    // Build filter object
    const filter = { user: req.user.id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Build sort object
    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Default: newest first
    }

    const tasks = await Task.find(filter).sort(sortOptions);

    res.status(200).json({
      status: 'success',
      count: tasks.length,
      data: {
        tasks,
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tasks',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/tasks/stats:
 *   get:
 *     summary: Get task statistics using aggregation
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     byStatus:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: number
 *                         in-progress:
 *                           type: number
 *                         completed:
 *                           type: number
 *                     byPriority:
 *                       type: object
 *                       properties:
 *                         high:
 *                           type: number
 *                         medium:
 *                           type: number
 *                         low:
 *                           type: number
 *                     topCategories:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics using aggregation pipeline
 * @access  Private
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await Task.aggregate([
      // Match tasks for the current user
      {
        $match: { user: req.user.id },
      },
      // Group by status and count
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      // Reshape the output
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    // Get priority distribution
    const priorityStats = await Task.aggregate([
      {
        $match: { user: req.user.id },
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          priority: '$_id',
          count: 1,
        },
      },
    ]);

    // Get category distribution
    const categoryStats = await Task.aggregate([
      {
        $match: { user: req.user.id },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    // Get total count
    const totalTasks = await Task.countDocuments({ user: req.user.id });

    // Format status stats as object
    const statusObj = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
    };

    stats.forEach((item) => {
      const key = item.status.toLowerCase().replace(' ', '-');
      statusObj[key] = item.count;
    });

    // Format priority stats as object
    const priorityObj = {
      high: 0,
      medium: 0,
      low: 0,
    };

    priorityStats.forEach((item) => {
      priorityObj[item.priority.toLowerCase()] = item.count;
    });

    res.status(200).json({
      status: 'success',
      data: {
        total: totalTasks,
        byStatus: statusObj,
        byPriority: priorityObj,
        topCategories: categoryStats,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch task',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Complete project report
 *               description:
 *                 type: string
 *                 example: Write and submit the final project report
 *               category:
 *                 type: string
 *                 example: Work
 *               priority:
 *                 type: string
 *                 enum: [High, Medium, Low]
 *                 example: High
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Completed]
 *                 example: Pending
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-01-20T10:00:00Z
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, category, priority, status, dueDate } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        status: 'error',
        message: 'Task title is required',
      });
    }

    // Create task
    const task = new Task({
      title,
      description,
      category,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      user: req.user.id,
    });

    await task.save();

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: {
        task,
      },
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create task',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [High, Medium, Low]
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Completed]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, description, category, priority, status, dueDate } = req.body;

    // Find task and ensure it belongs to the user
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (category !== undefined) task.category = category;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

    await task.save();

    res.status(200).json({
      status: 'success',
      message: 'Task updated successfully',
      data: {
        task,
      },
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update task',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully',
      data: {
        task,
      },
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete task',
      error: error.message,
    });
  }
});

export default router;
