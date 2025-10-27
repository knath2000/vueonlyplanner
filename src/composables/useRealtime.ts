import { ref, readonly } from 'vue'
import { io, Socket } from 'socket.io-client'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/authStore'

export interface RealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  data: any
  old?: any
}

const useRealtime = () => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const authStore = useAuthStore()

  const connect = () => {
    if (!authStore.currentUser) {
      console.log('Cannot connect to realtime: No authenticated user')
      return
    }

    // For now, implement polling as a simple alternative
    // In production, you'd set up a Socket.io server
    console.log('Realtime features temporarily disabled - using polling')

    // Placeholder for future Socket.io implementation
    /*
    socket.value = io(import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3001', {
      auth: {
        token: authStore.currentUser.id
      }
    })

    socket.value.on('connect', () => {
      isConnected.value = true
      console.log('Connected to realtime server')
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
      console.log('Disconnected from realtime server')
    })

    socket.value.on('database_change', (event: RealtimeEvent) => {
      // Handle realtime events
      handleRealtimeEvent(event)
    })
    */
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }

  const handleRealtimeEvent = (event: RealtimeEvent) => {
    // This would handle incoming realtime events
    // For now, we'll implement polling in the stores instead
    console.log('Realtime event received:', event)
  }

  // Polling implementation for projects
  const pollProjects = async (callback: (data: any[]) => void) => {
    if (!authStore.currentUser) return

    const poll = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', authStore.currentUser!.id)
          .order('created_at', { ascending: false })

        if (!error && data) {
          callback(data)
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }

    // Poll every 5 seconds
    const interval = setInterval(poll, 5000)

    // Initial poll
    poll()

    return () => clearInterval(interval)
  }

  // Polling implementation for tasks
  const pollTasks = async (projectId: string, callback: (data: any[]) => void) => {
    if (!authStore.currentUser) return

    const poll = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .eq('user_id', authStore.currentUser!.id)
          .order('created_at', { ascending: true })

        if (!error && data) {
          callback(data)
        }
      } catch (err) {
        console.error('Task polling error:', err)
      }
    }

    // Poll every 3 seconds for tasks
    const interval = setInterval(poll, 3000)

    // Initial poll
    poll()

    return () => clearInterval(interval)
  }

  return {
    isConnected: readonly(isConnected),
    connect,
    disconnect,
    pollProjects,
    pollTasks,
  }
}

export default useRealtime