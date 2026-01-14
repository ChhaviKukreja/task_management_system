import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import TaskForm from '../components/TaskForm';

/**
 * Dashboard Component
 * Main interface for managing tasks with comprehensive features:
 * - Real-time statistics (Total, Pending, In Progress, Completed)
 * - Task filtering by priority and status
 * - Search functionality
 * - Sort by due date (earliest first)
 * - Create, edit, and delete tasks
 * - Visual progress indicators and due date warnings
 */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  /**
   * Fetch tasks with sorting and filtering
   * - Sorts by due date (ascending) to show urgent tasks first
   * - Applies priority and status filters if selected
   */
  const fetchTasks = async () => {
    try {
      const params = {
        sortBy: 'dueDate',
        order: 'asc'
      };
      if (priorityFilter) params.priority = priorityFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await axios.get('/tasks', { params });
      const fetchedTasks = response.data.data?.tasks || response.data.data;
      setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
      setTasks([]);
    }
  };

  /**
   * Calculate task statistics from tasks array
   * - Counts tasks by status (Pending, In Progress, Completed)
   * - Calculates total count
   * - Updates statistics cards in real-time
   */
  const calculateStats = (tasksArray) => {
    const calculatedStats = {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
    };

    if (Array.isArray(tasksArray)) {
      tasksArray.forEach((task) => {
        calculatedStats.total++;
        if (task.status === 'Pending') {
          calculatedStats.pending++;
        } else if (task.status === 'In Progress') {
          calculatedStats.inProgress++;
        } else if (task.status === 'Completed') {
          calculatedStats.completed++;
        }
      });
    }

    setStats(calculatedStats);
  };

  /**
   * Fetch task statistics
   * - Aggregates tasks by status using MongoDB aggregation pipeline
   * - Calculates total, pending, in progress, and completed counts
   * - Updates statistics cards in real-time
   */
  const fetchStats = async () => {
    try {
      const response = await axios.get('/tasks/stats');
      const statsData = response.data.data;

      const calculatedStats = {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
      };

      if (statsData.byStatus && Array.isArray(statsData.byStatus)) {
        statsData.byStatus.forEach((stat) => {
          calculatedStats.total += stat.count;
          if (stat._id === 'Pending') calculatedStats.pending = stat.count;
          if (stat._id === 'In Progress') calculatedStats.inProgress = stat.count;
          if (stat._id === 'Completed') calculatedStats.completed = stat.count;
        });
      }

      setStats(calculatedStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTasks();
      setLoading(false);
    };
    loadData();
  }, [priorityFilter, statusFilter]);

  // Calculate stats whenever tasks change
  useEffect(() => {
    calculateStats(tasks);
  }, [tasks]);

  // Delete task
  const handleDelete = (taskId) => {
    setTaskToDelete(taskId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/tasks/${taskToDelete}`);
      toast.success('Task deleted successfully');
      setDeleteModalOpen(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
      console.error(error);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  // Open modal for editing
  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Open modal for creating
  const handleCreate = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Handle form success
  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    fetchTasks();
  };

  // Filter tasks by search term
  const filteredTasks = Array.isArray(tasks) ? tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getPriorityBadge = (priority) => {
    const styles = {
      High: 'bg-rose-500/10 text-rose-700 border-rose-200',
      Medium: 'bg-amber-500/10 text-amber-700 border-amber-200',
      Low: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    };
    return styles[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-blue-500/10 text-blue-700 border-blue-200',
      'In Progress': 'bg-purple-500/10 text-purple-700 border-purple-200',
      Completed: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusProgress = (status) => {
    const progress = {
      Pending: 0,
      'In Progress': 50,
      Completed: 100,
    };
    return progress[status] || 0;
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'Completed') return false;
    return new Date(dueDate) < new Date();
  };

  const getDueDateColor = (dueDate, status) => {
    if (!dueDate || status === 'Completed') return 'text-gray-600 bg-gray-50 border-gray-200';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-700 bg-red-50 border-red-300';
    if (diffDays <= 2) return 'text-orange-700 bg-orange-50 border-orange-300';
    return 'text-green-700 bg-green-50 border-green-300';
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No deadline';
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Task Manager</h1>
                <p className="text-xs text-gray-500">Organize your productivity</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-indigo-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center relative z-10">
              <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-4 shadow-lg shadow-indigo-500/30">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 flex-1">
                <dt className="text-sm font-medium text-gray-500 mb-1">Total Tasks</dt>
                <dd className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{stats.total}</dd>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-amber-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center relative z-10">
              <div className="flex-shrink-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 shadow-lg shadow-amber-500/30">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 flex-1">
                <dt className="text-sm font-medium text-gray-500 mb-1">Pending</dt>
                <dd className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{stats.pending}</dd>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-purple-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center relative z-10">
              <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl p-4 shadow-lg shadow-purple-500/30">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-5 flex-1">
                <dt className="text-sm font-medium text-gray-500 mb-1">In Progress</dt>
                <dd className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{stats.inProgress}</dd>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-emerald-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center relative z-10">
              <div className="flex-shrink-0 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl p-4 shadow-lg shadow-emerald-500/30">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 flex-1">
                <dt className="text-sm font-medium text-gray-500 mb-1">Completed</dt>
                <dd className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{stats.completed}</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-all cursor-pointer"
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-all cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <button
                onClick={handleCreate}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent absolute top-0"></div>
              </div>
              <p className="mt-4 text-gray-500 font-medium">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-10 w-10 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-6">Create your first task to get started with organizing your work!</p>
              <button
                onClick={handleCreate}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/30 inline-flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create First Task</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTasks.map((task) => (
                <div 
                  key={task._id} 
                  className="group p-6 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200 relative"
                >
                  {isOverdue(task.dueDate, task.status) && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-red-500"></div>
                  )}
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                          {isOverdue(task.dueDate, task.status) && (
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-500/10 text-black border border-rose-200">
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">{task.status}</span>
                        <span className="inline-flex items-center bg-gray-200 rounded-full h-1.5 w-20">
                          <span 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              task.status === 'Completed' ? 'bg-emerald-500' :
                              task.status === 'In Progress' ? 'bg-purple-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${getStatusProgress(task.status)}%` }}
                          ></span>
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-6 text-sm">
                        {task.category && (
                          <span className="flex items-center text-gray-500">
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="font-medium">{task.category}</span>
                          </span>
                        )}
                        {task.createdAt && (
                          <span className="flex items-center text-gray-500 text-xs">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Created {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className={`px-4 py-3 rounded-xl border-2 ${getDueDateColor(task.dueDate, task.status)} text-center min-w-[140px]`}>
                        <div className="text-xs font-medium opacity-75 mb-1">
                          {task.status === 'Completed' ? 'Completed' : 'Due Date'}
                        </div>
                        <div className="text-lg font-bold">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No deadline'}
                        </div>
                        <div className="text-xs font-medium mt-1">
                          {formatDueDate(task.dueDate)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(task)}
                          className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 border border-transparent hover:border-indigo-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200 border border-transparent hover:border-rose-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Task Form Modal */}
      {isModalOpen && (
        <TaskForm
          task={editingTask}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-rose-100 rounded-full">
              <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Task</h3>
            <p className="text-gray-600 text-center mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
