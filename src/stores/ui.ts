import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

export const useUiStore = defineStore('ui', () => {
  const isSidebarOpen = ref<boolean>(false)
  const isGlobalLoading = ref<boolean>(false)
  const toasts = ref<ToastNotification[]>([])

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  function setGlobalLoading(status: boolean) {
    isGlobalLoading.value = status
  }

  function showToast(message: string, type: ToastNotification['type'] = 'info', duration = 3000) {
    const id = Date.now().toString()
    toasts.value.push({ id, type, message, duration })

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    isSidebarOpen,
    isGlobalLoading,
    toasts,
    toggleSidebar,
    setGlobalLoading,
    showToast,
    removeToast,
  }
})
