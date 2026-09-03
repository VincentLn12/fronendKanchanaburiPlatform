<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type ValidationRule = (value: unknown) => boolean | string

interface Props {
  label?: string
  placeholder?: string
  items?: unknown[]
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  multiple?: boolean
  searchable?: boolean
  itemTitle?: string
  itemValue?: string
  rules?: ValidationRule[]
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'เลือกข้อมูล',
  items: () => [],
  disabled: false,
  readonly: false,
  clearable: false,
  multiple: false,
  searchable: true,
  itemTitle: '',
  itemValue: '',
  rules: () => [],
})

const model = defineModel<unknown>()

const isOpen = ref(false)
const searchQuery = ref('')
const containerRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

function valueOf(item: unknown) {
  if (!props.itemValue || typeof item !== 'object' || item === null) return item
  return (item as Record<string, unknown>)[props.itemValue]
}

function titleOf(item: unknown) {
  if (item === null || item === undefined) return ''
  if (!props.itemTitle || typeof item !== 'object') return String(item)
  return String((item as Record<string, unknown>)[props.itemTitle] ?? '')
}

const selectedItem = computed(() => {
  if (model.value === null || model.value === undefined || model.value === '') return null
  return props.items.find((item) => valueOf(item) === model.value) ?? null
})

const selectedTitle = computed(() => {
  if (!selectedItem.value) return ''
  return titleOf(selectedItem.value)
})

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return props.items
  const query = searchQuery.value.toLowerCase().trim()
  return props.items.filter((item) => titleOf(item).toLowerCase().includes(query))
})

const showSearchInput = computed(() => {
  if (!props.searchable) return false
  return props.items.length >= 5 || searchQuery.value.length > 0
})

function toggleDropdown() {
  if (props.disabled || props.readonly) return
  isOpen.value = !isOpen.value
}

function selectItem(item: unknown) {
  model.value = valueOf(item)
  isOpen.value = false
  searchQuery.value = ''
}

function handleClear(e: MouseEvent) {
  e.stopPropagation()
  model.value = null
  searchQuery.value = ''
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

watch(isOpen, (newVal) => {
  if (newVal && showSearchInput.value) {
    void nextTick(() => {
      searchInputRef.value?.focus()
    })
  } else if (!newVal) {
    searchQuery.value = ''
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative w-full space-y-1 text-[#332820]"
    :class="isOpen ? 'z-50' : 'z-10'"
  >
    <!-- LABEL -->
    <label v-if="label" class="block text-xs font-black text-[#786B62] uppercase tracking-wider">
      {{ label }}
    </label>

    <!-- TRIGGER BUTTON -->
    <div
      class="relative flex min-h-[42px] w-full items-center justify-between rounded-xl border-2 border-[#E8D9C9] bg-[#FFF9F2] px-3.5 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer shadow-2xs hover:border-[#D96C2C]/60 focus-within:border-[#D96C2C] focus-within:ring-2 focus-within:ring-[#D96C2C]/20"
      :class="{
        'opacity-50 cursor-not-allowed bg-slate-100': disabled || readonly,
        'border-[#D96C2C] ring-2 ring-[#D96C2C]/20': isOpen,
      }"
      @click="toggleDropdown"
    >
      <!-- DISPLAY TITLE OR PLACEHOLDER -->
      <span v-if="selectedItem" class="truncate font-bold text-[#332820]">
        {{ selectedTitle }}
      </span>
      <span v-else class="truncate text-[#786B62]/60 font-medium">
        {{ placeholder || 'เลือกข้อมูล' }}
      </span>

      <!-- ICONS -->
      <div class="flex items-center gap-1.5 shrink-0 ml-2">
        <button
          v-if="clearable && selectedItem && !disabled && !readonly"
          type="button"
          class="flex h-5 w-5 items-center justify-center rounded-full text-[#786B62] hover:bg-[#E8D9C9] hover:text-[#D96C2C] transition cursor-pointer"
          @click="handleClear"
          title="ล้างค่า"
        >
          <i class="mdi mdi-close text-xs" />
        </button>

        <i
          class="mdi mdi-chevron-down text-base text-[#786B62] transition-transform duration-200"
          :class="{ 'rotate-180 text-[#D96C2C]': isOpen }"
        />
      </div>
    </div>

    <!-- DROPDOWN MENU -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-1"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1.5 w-full rounded-2xl border-2 border-[#E8D9C9] bg-[#FFF9F2] py-2 shadow-xl backdrop-blur-md"
      >
        <!-- SEARCH INPUT FIELD -->
        <div v-if="showSearchInput" class="px-2 pb-2 mb-1 border-b border-[#E8D9C9]">
          <div class="relative flex items-center">
            <i class="mdi mdi-magnify absolute left-3 text-base text-[#786B62]" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="w-full rounded-xl border border-[#E8D9C9] bg-white py-1.5 pl-9 pr-3 text-xs font-semibold text-[#332820] outline-none focus:border-[#D96C2C] focus:ring-1 focus:ring-[#D96C2C]"
              placeholder="พิมพ์เพื่อค้นหา..."
              @click.stop
            />
            <button
              v-if="searchQuery"
              type="button"
              class="absolute right-2 text-xs text-[#786B62] hover:text-[#D96C2C]"
              @click="searchQuery = ''"
            >
              <i class="mdi mdi-close-circle" />
            </button>
          </div>
        </div>

        <!-- CLEAR / ALL OPTION (IF CLEARABLE AND NO SEARCH QUERY) -->
        <div
          v-if="clearable && !searchQuery"
          class="flex items-center justify-between px-3.5 py-2 text-xs font-medium text-[#786B62] hover:bg-[#F7F0E6] hover:text-[#D96C2C] cursor-pointer transition"
          :class="{ 'bg-[#D96C2C]/10 text-[#D96C2C] font-bold': model === null }"
          @click="selectItem(null)"
        >
          <span>{{ placeholder || 'ทั้งหมด' }}</span>
          <i v-if="model === null" class="mdi mdi-check text-sm text-[#D96C2C]" />
        </div>

        <!-- OPTIONS LIST -->
        <div class="max-h-60 overflow-y-auto space-y-0.5 px-1 scrollbar-thin">
          <div
            v-for="(item, index) in filteredItems"
            :key="index"
            class="flex items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer"
            :class="
              valueOf(item) === model
                ? 'bg-[#D96C2C] text-white font-bold shadow-2xs'
                : 'text-[#332820] hover:bg-[#F7F0E6] hover:text-[#D96C2C]'
            "
            @click="selectItem(item)"
          >
            <span class="truncate">{{ titleOf(item) }}</span>
            <i
              v-if="valueOf(item) === model"
              class="mdi mdi-check text-sm font-bold text-white ml-2"
            />
          </div>

          <!-- NO RESULTS -->
          <div
            v-if="filteredItems.length === 0"
            class="px-3 py-4 text-center text-xs font-semibold text-[#786B62]"
          >
            ไม่พบข้อมูลที่ค้นหา
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
