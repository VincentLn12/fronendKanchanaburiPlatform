import type { App, InjectionKey } from 'vue'
import { inject } from 'vue'
import Swal, { type SweetAlertIcon, type SweetAlertOptions, type SweetAlertResult } from 'sweetalert2'

export interface AppSwal {
  fire: (options: SweetAlertOptions) => Promise<SweetAlertResult>
  success: (title: string, text?: string) => Promise<SweetAlertResult>
  error: (title: string, text?: string) => Promise<SweetAlertResult>
  warning: (title: string, text?: string) => Promise<SweetAlertResult>
  info: (title: string, text?: string) => Promise<SweetAlertResult>
  confirm: (title: string, text?: string) => Promise<SweetAlertResult>
}

const defaultOptions: SweetAlertOptions = {
  confirmButtonColor: '#4F46E5',
  cancelButtonColor: '#6B7280',
  confirmButtonText: 'ตกลง',
  cancelButtonText: 'ยกเลิก',
}

const notificationDuration: Record<SweetAlertIcon, number> = {
  success: 2200,
  error: 4000,
  warning: 3500,
  info: 2800,
  question: 2800,
}

const show = (icon: SweetAlertIcon, title: string, text?: string) =>
  Swal.fire({
    ...defaultOptions,
    icon,
    title,
    text,
    showConfirmButton: false,
    timer: notificationDuration[icon],
    timerProgressBar: true,
  })

export const appSwal: AppSwal = {
  fire: (options) => Swal.mixin(defaultOptions).fire(options),
  success: (title, text) => show('success', title, text),
  error: (title, text) => show('error', title, text),
  warning: (title, text) => show('warning', title, text),
  info: (title, text) => show('info', title, text),
  confirm: (title, text) =>
    Swal.fire({
      ...defaultOptions,
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
    }),
}

export const swalKey: InjectionKey<AppSwal> = Symbol('appSwal')

export const useSwal = (): AppSwal => inject(swalKey, appSwal)

export default {
  install(app: App) {
    app.provide(swalKey, appSwal)
    app.config.globalProperties.$swal = appSwal
  },
}
