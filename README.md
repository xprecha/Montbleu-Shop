# ระบบลูกค้าร้านแว่นตา (เชื่อม Airtable)

แอป Next.js สำหรับค้นหาลูกค้า ดูประวัติ และบันทึกผลตรวจค่าสายตาใหม่ เชื่อมต่อกับ Airtable base ของร้าน

## วิธี Deploy ขึ้น Vercel (ฟรี)

### ขั้นที่ 1: เตรียมโค้ดขึ้น GitHub

1. สร้าง repository ใหม่บน GitHub (เช่น `eyewear-shop-app`)
2. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ขึ้น repository นั้น
   - ถ้าไม่คุ้นเคยกับ git ใช้ GitHub Desktop หรืออัปโหลดผ่านหน้าเว็บ GitHub ได้เลย (ลากไฟล์ทั้งหมดวางในหน้า "Add file" > "Upload files")
   - **ไม่ต้องอัปโหลดไฟล์ `.env.example`** เป็นค่าจริง — มันเป็นแค่ตัวอย่างให้ดูชื่อตัวแปร

### ขั้นที่ 2: เชื่อม Vercel กับ GitHub

1. เข้า https://vercel.com แล้ว Sign up / Login ด้วย GitHub account
2. กด **Add New** → **Project**
3. เลือก repository `eyewear-shop-app` ที่สร้างไว้
4. Vercel จะตรวจพบว่าเป็น Next.js โดยอัตโนมัติ ไม่ต้องตั้งค่า Build settings เพิ่ม

### ขั้นที่ 3: ตั้งค่า Environment Variables (สำคัญที่สุด)

ก่อนกด Deploy ให้เลื่อนลงมาที่ส่วน **Environment Variables** ในหน้าตั้งค่าโปรเจกต์ แล้วเพิ่ม 2 ตัวแปรนี้:

| Key | Value |
|---|---|
| `AIRTABLE_TOKEN` | Personal Access Token ของคุณจาก airtable.com/create/tokens |
| `AIRTABLE_BASE_ID` | Base ID ของคุณ (ขึ้นต้นด้วย `app...`) |

**คำเตือน**: ตัวแปรทั้งสองนี้คือกุญแจเข้าถึงข้อมูลลูกค้าทั้งหมด ห้ามแชร์ค่านี้ให้ใครเห็น และห้ามใส่ลงในไฟล์โค้ดที่จะ push ขึ้น GitHub โดยตรง — ใส่ผ่านหน้า Vercel Environment Variables เท่านั้น

### ขั้นที่ 4: กด Deploy

กดปุ่ม **Deploy** รอประมาณ 1-2 นาที Vercel จะให้ลิงก์ URL มาใช้งานได้ทันที เช่น `https://eyewear-shop-app.vercel.app`

### ขั้นที่ 5: ทดสอบ

เปิดลิงก์ที่ได้ ลองค้นหาชื่อลูกค้าที่มีอยู่จริงใน Airtable base ดูว่าเจอผลลัพธ์ไหม ถ้าเจอ error ให้เช็ค:
- Token ใส่ scope `data.records:read` และ `data.records:write` ครบไหม
- Token มี access ไปยัง base ที่ถูกต้องไหม
- Base ID คัดลอกมาครบไม่มีตัวอักษรเกิน/ขาดไหม

## โครงสร้างไฟล์

```
app/
  page.js                          ← หน้าหลัก (ค้นหา + บัตรข้อมูล + ฟอร์มบันทึกผลตรวจ)
  layout.js                        ← โครง HTML หลักของแอป
  globals.css                      ← สไตล์พื้นฐาน
  api/
    customers/search/route.js      ← API ค้นหาลูกค้า
    customers/[id]/route.js        ← API ดึงข้อมูลลูกค้า 1 คน + ประวัติล่าสุด
    eye-exams/route.js             ← API บันทึกผลตรวจค่าสายตาใหม่
lib/
  airtable.js                      ← ฟังก์ชันเรียก Airtable API (ฝั่ง server เท่านั้น)
```

## ฟีเจอร์ปัจจุบัน

- ค้นหาลูกค้าด้วยชื่อหรือเบอร์โทร
- ดูบัตรสรุป: วันตรวจล่าสุด, ค่า SPH ขวา/ซ้ายล่าสุด, วันครบกำหนดตรวจใหม่
- บันทึกผลตรวจค่าสายตาใหม่ (SPH, CYL, AXIS ทั้งสองข้าง)

## ฟีเจอร์ที่ยังไม่มี (ทำเพิ่มได้ในอนาคต)

- หน้าจัดการ Orders / Frames / Appointments
- หน้าแดชบอร์ดสรุป (Due for re-check, Low stock)
- การยืนยันตัวตนผู้ใช้งาน (Login) — ตอนนี้ใครมีลิงก์ก็เข้าถึงได้ ถ้าจะใช้งานจริงต่อเนื่อง ควรเพิ่มระบบ login เบื้องต้นด้วย
