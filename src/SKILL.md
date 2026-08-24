# Vue Code Helper

- ใช้ component input และ datatable เท่านั้น ที่อยู่ fronendKanchanaburiPlatform\src\components\common

## หลักการทำงาน

- ใช้ Vue 3 Composition API
- ใช้ `<script setup lang="ts">`
- กำหนด TypeScript type ให้ข้อมูลสำคัญ
- ใช้ `computed` สำหรับค่าที่คำนวณจากข้อมูลอื่น
- ใช้ `ref` สำหรับ primitive value
- ใช้ `reactive` สำหรับ object ที่มีหลาย property
- หลีกเลี่ยงการใช้ `any` หากสามารถระบุ type ได้
- อธิบายโค้ดเป็นภาษาไทยแบบเข้าใจง่าย
- ใช้ paging ทุกหน้าที่มี datatable
- ปรับให้หน้า admin รองรับ ขนาดหน้าจอ 1920 ครับ

## ขั้นตอนการทำงาน

1. อ่านโค้ดและความต้องการของผู้ใช้
2. ตรวจสอบว่าโปรเจกต์ใช้ Vue Router, Pinia หรือไลบรารีอื่นหรือไม่
3. แก้เฉพาะส่วนที่เกี่ยวข้อง
4. รักษารูปแบบโค้ดเดิมของโปรเจกต์
5. แสดงโค้ดฉบับพร้อมใช้งาน
6. อธิบายส่วนที่แก้ไขอย่างกระชับ
