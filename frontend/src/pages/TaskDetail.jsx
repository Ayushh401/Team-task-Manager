import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'

const TaskDetail = () => {
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTask()
  }, [id])

  const fetchTask = async () => {
    try {
      const response = await axios.get(`/api/tasks/${id}`)
      setTask(response.data.task)
    } catch (error) {
      console.error('Failed to fetch task:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Task not found</h3>
        <p className="text-gray-500">The task you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{task.title}</h1>
        <p className="text-gray-600 mb-6">{task.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Task Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span className="ml-2 text-sm text-gray-900 capitalize">{task.status}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Priority:</span>
                <span className="ml-2 text-sm text-gray-900 capitalize">{task.priority}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Project:</span>
                <span className="ml-2 text-sm text-gray-900">{task.project?.name}</span>
              </div>
              {task.dueDate && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Due Date:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Assignment</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Created By:</span>
                <span className="ml-2 text-sm text-gray-900">{task.createdBy?.username}</span>
              </div>
              {task.assignedTo && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Assigned To:</span>
                  <span className="ml-2 text-sm text-gray-900">{task.assignedTo?.username}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetail
