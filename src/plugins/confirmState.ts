import { reactive } from 'vue'

export interface AppSwalResult {
  isConfirmed: boolean
  isDenied: boolean
  isDismissed: boolean
}

export const confirmState = reactive({
  isOpen: false,
  title: '',
  text: '',
  confirmText: 'ยืนยัน',
  cancelText: 'ยกเลิก',
  resolve: null as ((value: AppSwalResult) => void) | null,
})

export function openConfirm(
  title: string,
  text?: string,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
): Promise<AppSwalResult> {
  return new Promise((resolve) => {
    confirmState.title = title
    confirmState.text = text || ''
    confirmState.confirmText = confirmText
    confirmState.cancelText = cancelText
    confirmState.resolve = resolve
    confirmState.isOpen = true
  })
}

export function resolveConfirm(isConfirmed: boolean) {
  confirmState.isOpen = false
  if (confirmState.resolve) {
    confirmState.resolve({
      isConfirmed,
      isDenied: false,
      isDismissed: !isConfirmed,
    })
    confirmState.resolve = null
  }
}
