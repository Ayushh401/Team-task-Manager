import { useParams } from 'react-router-dom'
import { useProject } from '../contexts/ProjectContext'
import { useEffect } from 'react'

const ProjectDetail = () => {
  const { id } = useParams()
  const { currentProject, fetchProject, loading } = useProject()

  useEffect(() => {
    if (id) {
      fetchProject(id)
    }
  }, [id, fetchProject])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Project not found</h3>
        <p className="text-gray-500">The project you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{currentProject.name}</h1>
        <p className="mt-1 text-sm text-gray-600">{currentProject.description}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Project Details</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Status</h3>
            <p className="text-sm text-gray-900 capitalize">{currentProject.status}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Members</h3>
            <div className="mt-2 space-y-2">
              {currentProject.members?.map((member, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm">
                    {member.user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-900">{member.user?.username}</span>
                  <span className="text-xs text-gray-500 capitalize">({member.role})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail
