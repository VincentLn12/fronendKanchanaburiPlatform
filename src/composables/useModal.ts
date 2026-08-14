import { ref, shallowRef, type Component } from 'vue'

interface ModalOptions {
  title?: string
  component: Component
  props?: Record<string, unknown>
}

const isOpen = ref(false)
const title = ref('')
const component = shallowRef<Component | null>(null)
const props = ref<Record<string, unknown>>({})

export function useModal() {
  function openModal({
    title: modalTitle = '',
    component: modalComponent,
    props: modalProps = {},
  }: ModalOptions) {
    title.value = modalTitle
    component.value = modalComponent
    props.value = modalProps
    isOpen.value = true
  }

  function closeModal() {
    isOpen.value = false
    title.value = ''
    component.value = null
    props.value = {}
  }

  return {
    isOpen,
    title,
    component,
    props,
    openModal,
    closeModal,
  }
}
