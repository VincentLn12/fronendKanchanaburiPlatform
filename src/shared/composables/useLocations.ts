import { ref } from 'vue'
import {
  getDistricts,
  getSubDistricts,
  type District,
  type SubDistrict,
} from '@/features/contents/api'

export function useLocations() {
  const districts = ref<District[]>([])
  const subDistricts = ref<SubDistrict[]>([])
  const loadingDistricts = ref(false)
  const loadingSubDistricts = ref(false)

  async function fetchDistricts() {
    loadingDistricts.value = true
    try {
      districts.value = await getDistricts()
    } catch (e) {
      console.error('Failed fetching districts', e)
    } finally {
      loadingDistricts.value = false
    }
  }

  async function fetchSubDistricts(districtId: string | null) {
    subDistricts.value = []
    if (!districtId) return

    loadingSubDistricts.value = true
    try {
      subDistricts.value = await getSubDistricts(districtId)
    } catch (e) {
      console.error('Failed fetching subDistricts', e)
    } finally {
      loadingSubDistricts.value = false
    }
  }

  return {
    districts,
    subDistricts,
    loadingDistricts,
    loadingSubDistricts,
    fetchDistricts,
    fetchSubDistricts,
  }
}
