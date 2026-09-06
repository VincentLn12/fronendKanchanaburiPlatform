export interface SpecialFieldRule {
  key: string
  label: string
  icon: string
}

export interface CategoryRule {
  hasSchedule: boolean | 'optional'
  shopRequirement: 'required' | 'optional'
  shopRequirementLabel: string
  specialInfoTitle: string
  specialFields: SpecialFieldRule[]
}

export const CATEGORY_RULES: Record<string, CategoryRule> = {
  'วัฒนธรรมและประเพณี': {
    hasSchedule: true,
    shopRequirement: 'optional',
    shopRequirementLabel: 'ระบุร้านค้าที่เกี่ยวข้อง (ถ้ามี)',
    specialInfoTitle: 'ข้อมูลงานวัฒนธรรมและประเพณี',
    specialFields: [
      { key: 'eventDate', label: 'วันที่จัดงาน / ช่วงเทศกาล', icon: 'mdi-calendar-range' },
      { key: 'eventTime', label: 'เวลาจัดงาน', icon: 'mdi-clock-outline' },
      { key: 'location', label: 'สถานที่จัดงาน / พื้นที่กิจกรรม', icon: 'mdi-map-marker-outline' },
    ],
  },
  'ประวัติศาสตร์และโบราณสถาน': {
    hasSchedule: true,
    shopRequirement: 'optional',
    shopRequirementLabel: 'ระบุร้านค้าใกล้เคียง (ถ้ามี)',
    specialInfoTitle: 'ข้อมูลสถานที่ประวัติศาสตร์',
    specialFields: [
      { key: 'openingHours', label: 'เวลาเปิด–ปิด', icon: 'mdi-clock-time-four-outline' },
      { key: 'entranceFee', label: 'ค่าเข้าชม / ค่าบริการ', icon: 'mdi-ticket-percent-outline' },
      { key: 'locationMap', label: 'พิกัดสถานที่ / แผนที่', icon: 'mdi-map-marker-radius-outline' },
    ],
  },
  'ชาติพันธุ์และวิถีชุมชน': {
    hasSchedule: false,
    shopRequirement: 'optional',
    shopRequirementLabel: 'ระบุร้านค้า/วิสาหกิจชุมชน (ถ้ามี)',
    specialInfoTitle: 'ข้อมูลวิถีชุมชนและชาติพันธุ์',
    specialFields: [
      { key: 'communityName', label: 'กลุ่มชาติพันธุ์ / ชื่อชุมชน', icon: 'mdi-account-group-outline' },
      { key: 'areaName', label: 'พื้นที่ / ที่ตั้งชุมชน', icon: 'mdi-home-map-marker' },
      { key: 'informant', label: 'ผู้ให้ข้อมูล / ปราชญ์ชาวบ้าน', icon: 'mdi-account-tie-voice-outline' },
    ],
  },
  'ศิลปะและการแสดง': {
    hasSchedule: true,
    shopRequirement: 'optional',
    shopRequirementLabel: 'ระบุสถานที่/คณะแสดง (ถ้ามี)',
    specialInfoTitle: 'ข้อมูลศิลปะและการแสดง',
    specialFields: [
      { key: 'showDateTime', label: 'วัน / เวลา การแสดงสด', icon: 'mdi-drama-masks' },
      { key: 'location', label: 'สถานที่จัดแสดง / เวที', icon: 'mdi-map-marker-star-outline' },
    ],
  },
  'หัตถกรรมและงานฝีมือ': {
    hasSchedule: false,
    shopRequirement: 'required',
    shopRequirementLabel: 'จำเป็นต้องระบุร้านค้าผู้ผลิต/ผู้จำหน่าย',
    specialInfoTitle: 'ข้อมูลหัตถกรรมและงานฝีมือ',
    specialFields: [
      { key: 'producer', label: 'ผู้ผลิต / กลุ่มหัตถกรรม', icon: 'mdi-hammer-wrench' },
      { key: 'relatedShop', label: 'ร้านค้าที่เกี่ยวข้อง / ผู้จัดจำหน่าย', icon: 'mdi-store-outline' },
      { key: 'relatedProducts', label: 'สินค้าหัตถกรรมที่เกี่ยวข้อง', icon: 'mdi-basket-outline' },
    ],
  },
  'อาหารท้องถิ่น': {
    hasSchedule: 'optional',
    shopRequirement: 'required',
    shopRequirementLabel: 'จำเป็นต้องระบุร้านอาหาร/ร้านค้าที่ให้บริการ',
    specialInfoTitle: 'ข้อมูลอาหารท้องถิ่น',
    specialFields: [
      { key: 'relatedShop', label: 'ร้านค้า / ร้านอาหารที่เกี่ยวข้อง', icon: 'mdi-silverware-fork-knife' },
      { key: 'openingHours', label: 'เวลาเปิด–ปิด ให้บริการ', icon: 'mdi-clock-outline' },
    ],
  },
  'แหล่งเรียนรู้และภูมิปัญญา': {
    hasSchedule: true,
    shopRequirement: 'optional',
    shopRequirementLabel: 'ระบุศูนย์เรียนรู้/ร้านค้า (ถ้ามี)',
    specialInfoTitle: 'ข้อมูลแหล่งเรียนรู้และภูมิปัญญา',
    specialFields: [
      { key: 'openDays', label: 'วันเปิดทำการเรียนรู้', icon: 'mdi-school-outline' },
      { key: 'openHours', label: 'เวลาให้บริการ / กิจกรรม', icon: 'mdi-clock-outline' },
      { key: 'instructor', label: 'ผู้ให้ความรู้ / วิทยากรภูมิปัญญา', icon: 'mdi-account-school-outline' },
    ],
  },
  'ท่องเที่ยวชุมชนและธรรมชาติ': {
    hasSchedule: true,
    shopRequirement: 'optional',
    shopRequirementLabel: 'ระบุกลุ่มท่องเที่ยว/ร้านค้า (ถ้ามี)',
    specialInfoTitle: 'ข้อมูลท่องเที่ยวธรรมชาติและชุมชน',
    specialFields: [
      { key: 'openingHours', label: 'เวลาเปิด–ปิด แหล่งท่องเที่ยว', icon: 'mdi-tree-outline' },
      { key: 'entranceFee', label: 'ค่าธรรมเนียมเข้าชม / บำรุงสถานที่', icon: 'mdi-cash-multiple' },
      { key: 'locationMap', label: 'พิกัดสถานที่ / จุดเช็คอิน', icon: 'mdi-map-marker-distance' },
    ],
  },
}

export const DEFAULT_CATEGORY_RULE: CategoryRule = {
  hasSchedule: true,
  shopRequirement: 'optional',
  shopRequirementLabel: 'ระบุร้านค้าที่เกี่ยวข้อง (ถ้ามี)',
  specialInfoTitle: 'ข้อมูลรายละเอียดเพิ่มเติม',
  specialFields: [],
}

export function getCategoryRule(categoryName?: string | null): CategoryRule {
  if (!categoryName) return DEFAULT_CATEGORY_RULE
  const key = Object.keys(CATEGORY_RULES).find(
    (k) =>
      categoryName.trim().toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(categoryName.trim().toLowerCase()),
  )
  return (key ? CATEGORY_RULES[key] : undefined) ?? DEFAULT_CATEGORY_RULE
}
