const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all tasks (root route)
router.get('/', auth, async (req, res) => {
  try {
    const { status, assignedTo, priority, project } = req.query;
    
    // Build query
    const query = {};
    
    // Only show tasks from projects user has access to
    const userProjects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).select('_id');
    
    query.project = { $in: userProjects.map(p => p._id) };
    
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (priority) query.priority = priority;
    if (project) query.project = project;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'username email avatar')
      .populate('createdBy', 'username email avatar')
      .populate('comments.user', 'username email avatar')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
});

// Get all tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, assignedTo, priority } = req.query;

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    // Build query
    const query = { project: projectId };
    
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'username email avatar')
      .populate('createdBy', 'username email avatar')
      .populate('comments.user', 'username email avatar')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
});

// Get single task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name owner')
      .populate('assignedTo', 'username email avatar')
      .populate('createdBy', 'username email avatar')
      .populate('comments.user', 'username email avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: task.project._id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
});

// Create new task
router.post('/', auth, [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 200 })
    .withMessage('Task title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('project')
    .isMongoId()
    .withMessage('Valid project ID is required'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Valid user ID is required for assignment'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('estimatedHours')
    .optional()
    .isNumeric()
    .withMessage('Estimated hours must be a number')
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Estimated hours must be between 0 and 1000')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      project,
      assignedTo,
      priority,
      dueDate,
      estimatedHours,
      tags
    } = req.body;

    // Check if user has access to the project
    const projectDoc = await Project.findOne({
      _id: project,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    // If assignedTo is provided, check if the user is a project member
    if (assignedTo) {
      const isMember = projectDoc.members.some(
        member => member.user.toString() === assignedTo
      ) || projectDoc.owner.toString() === assignedTo;

      if (!isMember) {
        return res.status(400).json({ message: 'Assigned user is not a project member' });
      }
    }

    const task = new Task({
      title,
      description,
      project,
      assignedTo,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate,
      estimatedHours,
      tags: tags || []
    });

    await task.save();
    await task.populate('assignedTo', 'username email avatar');
    await task.populate('createdBy', 'username email avatar');

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
});

// Update task
router.put('/:id', auth, [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Task title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'review', 'completed'])
    .withMessage('Status must be todo, in-progress, review, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('estimatedHours')
    .optional()
    .isNumeric()
    .withMessage('Estimated hours must be a number')
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Estimated hours must be between 0 and 1000'),
  body('actualHours')
    .optional()
    .isNumeric()
    .withMessage('Actual hours must be a number')
    .isFloat({ min: 0 })
    .withMessage('Actual hours cannot be negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: task.project._id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedHours,
      actualHours,
      tags,
      assignedTo
    } = req.body;

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
    if (actualHours !== undefined) updateData.actualHours = actualHours;
    if (tags !== undefined) updateData.tags = tags;

    // If assignedTo is being updated, check if the user is a project member
    if (assignedTo !== undefined) {
      if (assignedTo) {
        const isMember = project.members.some(
          member => member.user.toString() === assignedTo
        ) || project.owner.toString() === assignedTo;

        if (!isMember) {
          return res.status(400).json({ message: 'Assigned user is not a project member' });
        }
      }
      updateData.assignedTo = assignedTo;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('assignedTo', 'username email avatar')
    .populate('createdBy', 'username email avatar')
    .populate('comments.user', 'username email avatar');

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
});

// Add comment to task
router.post('/:id/comments', auth, [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text } = req.body;

    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: task.project._id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add comment
    task.comments.push({
      user: req.user._id,
      text,
      createdAt: new Date()
    });

    await task.save();
    await task.populate('comments.user', 'username email avatar');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: task.comments[task.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the project (only project owners and admins can delete tasks)
    const project = await Project.findOne({
      _id: task.project._id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.role': 'admin' }
      ]
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
});

// Get user's tasks across all projects
router.get('/my-tasks', auth, async (req, res) => {
  try {
    const { status, priority } = req.query;

    // Build query
    const query = { assignedTo: req.user._id };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('createdBy', 'username email avatar')
      .sort({ dueDate: 1, createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching your tasks' });
  }
});

module.exports = router;
