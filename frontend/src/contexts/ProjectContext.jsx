import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import axios from 'axios'

const ProjectContext = createContext()

const projectReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PROJECTS':
      return {
        ...state,
        projects: action.payload,
        loading: false,
        error: null
      }
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [action.payload, ...state.projects],
        loading: false,
        error: null
      }
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project._id === action.payload._id ? action.payload : project
        ),
        loading: false,
        error: null
      }
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project._id !== action.payload),
        loading: false,
        error: null
      }
    case 'SET_CURRENT_PROJECT':
      return {
        ...state,
        currentProject: action.payload,
        loading: false,
        error: null
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null
}

export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState)

  const fetchProjects = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await axios.get('/api/projects')
      dispatch({ type: 'SET_PROJECTS', payload: response.data.projects })
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch projects'
      dispatch({ type: 'SET_ERROR', payload: message })
    }
  }, [])

  const createProject = useCallback(async (projectData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await axios.post('/api/projects', projectData)
      dispatch({ type: 'ADD_PROJECT', payload: response.data.project })
      return response.data.project
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create project'
      dispatch({ type: 'SET_ERROR', payload: message })
      throw error
    }
  }, [])

  const updateProject = useCallback(async (id, projectData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await axios.put(`/api/projects/${id}`, projectData)
      dispatch({ type: 'UPDATE_PROJECT', payload: response.data.project })
      
      if (state.currentProject?._id === id) {
        dispatch({ type: 'SET_CURRENT_PROJECT', payload: response.data.project })
      }
      
      return response.data.project
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update project'
      dispatch({ type: 'SET_ERROR', payload: message })
      throw error
    }
  }, [])

  const deleteProject = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await axios.delete(`/api/projects/${id}`)
      dispatch({ type: 'DELETE_PROJECT', payload: id })
      
      if (state.currentProject?._id === id) {
        dispatch({ type: 'SET_CURRENT_PROJECT', payload: null })
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete project'
      dispatch({ type: 'SET_ERROR', payload: message })
      throw error
    }
  }, [])

  const fetchProject = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await axios.get(`/api/projects/${id}`)
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: response.data.project })
      return response.data.project
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch project'
      dispatch({ type: 'SET_ERROR', payload: message })
      throw error
    }
  }, [])

  const addMember = async (projectId, memberData) => {
    try {
      const response = await axios.post(`/api/projects/${projectId}/members`, memberData)
      
      // Update current project if it's the one being modified
      if (state.currentProject?._id === projectId) {
        dispatch({
          type: 'SET_CURRENT_PROJECT',
          payload: {
            ...state.currentProject,
            members: [...state.currentProject.members, response.data.member]
          }
        })
      }
      
      return response.data.member
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add member'
      dispatch({ type: 'SET_ERROR', payload: message })
      throw error
    }
  }

  const removeMember = async (projectId, memberId) => {
    try {
      await axios.delete(`/api/projects/${projectId}/members/${memberId}`)
      
      // Update current project if it's the one being modified
      if (state.currentProject?._id === projectId) {
        dispatch({
          type: 'SET_CURRENT_PROJECT',
          payload: {
            ...state.currentProject,
            members: state.currentProject.members.filter(
              member => member.user._id !== memberId
            )
          }
        })
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove member'
      dispatch({ type: 'SET_ERROR', payload: message })
      throw error
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    fetchProject,
    addMember,
    removeMember,
    clearError
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
