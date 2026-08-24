<script setup lang="ts">
type TableItem = object

export interface DataTableColumn {
  key: string
  label: string
  class?: string
  headerClass?: string
}

export interface DataTablePagination {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[]
    items?: TableItem[]
    rowKey: string | ((item: TableItem) => string | number)
    loading?: boolean
    emptyMessage?: string
    pagination?: DataTablePagination
  }>(),
  {
    items: () => [],
    loading: false,
    emptyMessage: 'ไม่พบข้อมูล',
  },
)

const emit = defineEmits<{
  pageChange: [page: number]
}>()

function getRowKey(item: TableItem, index: number) {
  if (typeof props.rowKey === 'function') return props.rowKey(item)
  return (getValue(item, props.rowKey) as string | number) ?? index
}

function getValue(item: TableItem, key: string): unknown {
  return (item as Record<string, unknown>)[key]
}

function changePage(page: number) {
  if (!props.pagination || page < 1 || page > props.pagination.totalPages || page === props.pagination.page) return
  emit('pageChange', page)
}
</script>

<template>
  <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
    <table class="w-full min-w-[720px] text-left">
      <thead class="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            class="px-5 py-4 font-semibold"
            :class="column.headerClass"
          >
            <slot :name="`header-${column.key}`" :column="column">{{ column.label }}</slot>
          </th>
        </tr>
      </thead>

      <tbody v-if="loading">
        <tr>
          <td :colspan="columns.length" class="px-5 py-12 text-center text-slate-500">
            กำลังโหลดข้อมูล...
          </td>
        </tr>
      </tbody>
      <tbody v-else-if="items.length" class="divide-y divide-slate-100">
        <tr v-for="(item, index) in items" :key="getRowKey(item, index)" class="hover:bg-slate-50">
          <td v-for="column in columns" :key="column.key" class="px-5 py-4" :class="column.class">
            <slot :name="`cell-${column.key}`" :item="item" :value="getValue(item, column.key)">
              {{ getValue(item, column.key) ?? '-' }}
            </slot>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td :colspan="columns.length" class="px-5 py-12 text-center text-slate-500">
            {{ emptyMessage }}
          </td>
        </tr>
      </tbody>
    </table>
    <footer v-if="pagination && pagination.totalCount > 0" class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-sm text-slate-600">
      <span>ทั้งหมด {{ pagination.totalCount }} รายการ</span>
      <div class="flex items-center gap-2">
        <button type="button" class="rounded-lg border border-slate-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40" :disabled="pagination.page === 1" @click="changePage(pagination.page - 1)">ก่อนหน้า</button>
        <span>หน้า {{ pagination.page }} / {{ pagination.totalPages || 1 }}</span>
        <button type="button" class="rounded-lg border border-slate-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40" :disabled="pagination.page >= pagination.totalPages" @click="changePage(pagination.page + 1)">ถัดไป</button>
      </div>
    </footer>
  </div>
</template>
