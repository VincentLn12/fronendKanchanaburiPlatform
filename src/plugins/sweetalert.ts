import type { App, InjectionKey } from 'vue'
import { inject } from 'vue'
import { push } from 'notivue'
import { openConfirm, type AppSwalResult } from './confirmState'

export type { AppSwalResult }

export interface AppSwal {
  fire: (options: { title?: string; text?: string }) => Promise<AppSwalResult>
  success: (title: string, text?: string) => Promise<AppSwalResult>
  error: (title: string, text?: string) => Promise<AppSwalResult>
  warning: (title: string, text?: string) => Promise<AppSwalResult>
  info: (title: string, text?: string) => Promise<AppSwalResult>
  confirm: (title: string, text?: string) => Promise<AppSwalResult>
}

export const appSwal: AppSwal = {
  fire: async (options) => {
    push.info({ title: options.title || '', message: options.text || '' })
    return { isConfirmed: true, isDenied: false, isDismissed: false }
  },
  success: async (title, text) => {
    push.success({ title, message: text || '' })
    return { isConfirmed: true, isDenied: false, isDismissed: false }
  },
  error: async (title, text) => {
    push.error({ title, message: text || '' })
    return { isConfirmed: true, isDenied: false, isDismissed: false }
  },
  warning: async (title, text) => {
    push.warning({ title, message: text || '' })
    return { isConfirmed: true, isDenied: false, isDismissed: false }
  },
  info: async (title, text) => {
    push.info({ title, message: text || '' })
    return { isConfirmed: true, isDenied: false, isDismissed: false }
  },
  confirm: (title, text) => openConfirm(title, text),
}

export const swalKey: InjectionKey<AppSwal> = Symbol('appSwal')

export const useSwal = (): AppSwal => inject(swalKey, appSwal)

export default {
  install(app: App) {
    app.provide(swalKey, appSwal)
    app.config.globalProperties.$swal = appSwal
  },
}
