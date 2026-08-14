import type { AppSwal } from '@/plugins/sweetalert'

declare module 'vue' {
  interface ComponentCustomProperties {
    $swal: AppSwal
  }
}

export {}
