import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const LEARNING_STORAGE_KEY = 'online-course-learning-progress'

interface CourseProgress {
  completedLessonIds: (string | number)[]
  lastWatchedLessonId?: string | number
  lastVideoTimestamp?: number
}

export const useLearningStore = defineStore('learning', () => {
  const progressMap = ref<Record<string, CourseProgress>>(
    JSON.parse(localStorage.getItem(LEARNING_STORAGE_KEY) || '{}'),
  )

  function saveToStorage() {
    localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(progressMap.value))
  }

  function getCourseProgress(courseId: string | number): CourseProgress {
    const cid = String(courseId)
    return progressMap.value[cid] || { completedLessonIds: [] }
  }

  function isLessonCompleted(courseId: string | number, lessonId: string | number): boolean {
    const progress = getCourseProgress(courseId)
    return progress.completedLessonIds.some((id) => String(id) === String(lessonId))
  }

  function markLessonCompleted(courseId: string | number, lessonId: string | number) {
    const cid = String(courseId)
    if (!progressMap.value[cid]) {
      progressMap.value[cid] = { completedLessonIds: [] }
    }
    const completed = progressMap.value[cid].completedLessonIds
    if (!completed.some((id) => String(id) === String(lessonId))) {
      completed.push(lessonId)
      saveToStorage()
    }
  }

  function setLastWatched(courseId: string | number, lessonId: string | number, timestamp = 0) {
    const cid = String(courseId)
    if (!progressMap.value[cid]) {
      progressMap.value[cid] = { completedLessonIds: [] }
    }
    progressMap.value[cid].lastWatchedLessonId = lessonId
    progressMap.value[cid].lastVideoTimestamp = timestamp
    saveToStorage()
  }

  return {
    progressMap,
    getCourseProgress,
    isLessonCompleted,
    markLessonCompleted,
    setLastWatched,
  }
})
