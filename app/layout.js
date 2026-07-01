// app/layout.js
import "./globals.css";

export const metadata = {
  title: "ระบบลูกค้าร้านแว่นตา",
  description: "ระบบจัดเก็บข้อมูลลูกค้าร้านแว่นตา เชื่อมกับ Airtable",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
