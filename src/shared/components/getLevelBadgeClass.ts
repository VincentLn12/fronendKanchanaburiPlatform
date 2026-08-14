export function getLevelBadgeClass(level: string | undefined): string {
  switch (level) {
    case 'ระดับพื้นฐาน':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
    case 'ระดับกลาง':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
    case 'ระดับสูง':
    case 'ระดับขั้นสูง':
      return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
    default:
      return 'bg-slate-500/15 text-slate-650 dark:text-slate-400 border border-slate-500/20'
  }
}

export function formatPrice(price: number): string {
  if (!price) return '0'
  return price.toLocaleString('th-TH')
}
