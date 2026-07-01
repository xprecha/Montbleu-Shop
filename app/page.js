"use client";
// app/page.js
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [latestExam, setLatestExam] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  const [form, setForm] = useState({
    examDate: new Date().toISOString().slice(0, 10),
    sphR: "",
    sphL: "",
    cylR: "",
    cylL: "",
    axisR: "",
    axisL: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    setResults([]);
    try {
      const res = await fetch(
        `/api/customers/search?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ค้นหาไม่สำเร็จ");
      setResults(data.records);
      if (data.records.length === 0) {
        setSearchError("ไม่พบลูกค้าที่ตรงกับคำค้นหา");
      }
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  }

  async function handleSelectCustomer(record) {
    setLoadingCustomer(true);
    setSelectedCustomer(null);
    setLatestExam(null);
    setSaveMessage("");
    try {
      const res = await fetch(`/api/customers/${record.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "โหลดข้อมูลลูกค้าไม่สำเร็จ");
      setSelectedCustomer(data.customer);
      setLatestExam(data.latestExam);
      // เติมค่าเดิมลงฟอร์ม เผื่ออยากดูค่าก่อนแก้
      if (data.latestExam) {
        const f = data.latestExam.fields;
        setForm((prev) => ({
          ...prev,
          sphR: f["SPH (R)"] ?? "",
          sphL: f["SPH (L)"] ?? "",
          cylR: f["CYL (R)"] ?? "",
          cylL: f["CYL (L)"] ?? "",
          axisR: f["AXIS (R)"] ?? "",
          axisL: f["AXIS (L)"] ?? "",
        }));
      }
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setLoadingCustomer(false);
    }
  }

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveExam() {
    if (!selectedCustomer) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch("/api/eye-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          examDate: form.examDate,
          sphR: form.sphR,
          sphL: form.sphL,
          cylR: form.cylR,
          cylL: form.cylL,
          axisR: form.axisR,
          axisL: form.axisL,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "บันทึกไม่สำเร็จ");
      setSaveMessage("บันทึกผลตรวจเรียบร้อยแล้ว");
      setLatestExam(data.record);
    } catch (err) {
      setSaveMessage(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
        ร้านแว่นตา — ระบบลูกค้า
      </h1>
      <p style={{ fontSize: 13, color: "#5b6b7a", marginTop: 0, marginBottom: 20 }}>
        ค้นหาลูกค้า ดูประวัติ และบันทึกผลตรวจค่าสายตาใหม่
      </p>

      {/* ค้นหาลูกค้า */}
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="ค้นหาชื่อหรือเบอร์โทรลูกค้า"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          disabled={searching}
          style={{ marginTop: 8, width: "100%", background: "#2e7d9a", color: "white", border: "none" }}
        >
          {searching ? "กำลังค้นหา..." : "ค้นหา"}
        </button>
      </form>

      {searchError && (
        <p style={{ color: "#b3261e", fontSize: 13, marginBottom: 12 }}>
          {searchError}
        </p>
      )}

      {/* ผลการค้นหา */}
      {results.length > 0 && (
        <div
          style={{
            background: "white",
            borderRadius: 12,
            border: "1px solid #e1e8ed",
            marginBottom: 16,
            overflow: "hidden",
          }}
        >
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelectCustomer(r)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                border: "none",
                borderBottom: "1px solid #f0f3f6",
                borderRadius: 0,
                background: "white",
              }}
            >
              <div style={{ fontWeight: 500, fontSize: 14 }}>
                {r.fields["Full name"] || "(ไม่มีชื่อ)"}
              </div>
              <div style={{ fontSize: 12, color: "#5b6b7a" }}>
                {r.fields["Customer ID"] || ""} ·{" "}
                {r.fields["Phone"] || "ไม่มีเบอร์โทร"}
              </div>
            </button>
          ))}
        </div>
      )}

      {loadingCustomer && <p style={{ fontSize: 13 }}>กำลังโหลดข้อมูลลูกค้า...</p>}

      {/* บัตรข้อมูลลูกค้า */}
      {selectedCustomer && (
        <div
          style={{
            background: "white",
            borderRadius: 12,
            border: "1px solid #e1e8ed",
            padding: "16px 20px",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#e3f0f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 500,
                fontSize: 13,
                color: "#2e7d9a",
                flexShrink: 0,
              }}
            >
              {(selectedCustomer.fields["Full name"] || "?").slice(0, 2)}
            </div>
            <div>
              <p style={{ fontWeight: 500, fontSize: 15, margin: 0 }}>
                {selectedCustomer.fields["Full name"]}
              </p>
              <p style={{ fontSize: 12, color: "#5b6b7a", margin: 0 }}>
                {selectedCustomer.fields["Customer ID"] || ""} ·{" "}
                {selectedCustomer.fields["Phone"] || "-"}
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <SummaryBox
              label="ตรวจตาล่าสุด"
              value={latestExam ? latestExam.fields["Exam date"] : "ไม่มีข้อมูล"}
            />
            <SummaryBox
              label="SPH ขวา/ซ้าย"
              value={
                latestExam
                  ? `${formatSph(latestExam.fields["SPH (R)"])} / ${formatSph(
                      latestExam.fields["SPH (L)"]
                    )}`
                  : "-"
              }
            />
            <SummaryBox
              label="ครบกำหนดตรวจ"
              value={latestExam?.fields["Next exam due"] || "-"}
              warning
            />
          </div>
        </div>
      )}

      {/* ฟอร์มบันทึกผลตรวจ */}
      {selectedCustomer && (
        <div
          style={{
            background: "white",
            borderRadius: 12,
            border: "1px solid #e1e8ed",
            padding: "16px 20px",
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 500, color: "#5b6b7a", marginTop: 0 }}>
            บันทึกผลตรวจค่าสายตาใหม่
          </p>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: "#5b6b7a" }}>วันที่ตรวจ</label>
            <input
              type="date"
              value={form.examDate}
              onChange={(e) => updateForm("examDate", e.target.value)}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "56px 1fr 1fr",
              gap: "8px 10px",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span />
            <span style={{ fontSize: 11, color: "#9aa6b1", textAlign: "center" }}>
              ตาขวา (R)
            </span>
            <span style={{ fontSize: 11, color: "#9aa6b1", textAlign: "center" }}>
              ตาซ้าย (L)
            </span>

            <span style={{ fontSize: 12, color: "#5b6b7a" }}>SPH</span>
            <input
              type="number"
              step="0.25"
              value={form.sphR}
              onChange={(e) => updateForm("sphR", e.target.value)}
              style={{ textAlign: "center" }}
            />
            <input
              type="number"
              step="0.25"
              value={form.sphL}
              onChange={(e) => updateForm("sphL", e.target.value)}
              style={{ textAlign: "center" }}
            />

            <span style={{ fontSize: 12, color: "#5b6b7a" }}>CYL</span>
            <input
              type="number"
              step="0.25"
              value={form.cylR}
              onChange={(e) => updateForm("cylR", e.target.value)}
              style={{ textAlign: "center" }}
            />
            <input
              type="number"
              step="0.25"
              value={form.cylL}
              onChange={(e) => updateForm("cylL", e.target.value)}
              style={{ textAlign: "center" }}
            />

            <span style={{ fontSize: 12, color: "#5b6b7a" }}>AXIS</span>
            <input
              type="number"
              step="1"
              value={form.axisR}
              onChange={(e) => updateForm("axisR", e.target.value)}
              style={{ textAlign: "center" }}
            />
            <input
              type="number"
              step="1"
              value={form.axisL}
              onChange={(e) => updateForm("axisL", e.target.value)}
              style={{ textAlign: "center" }}
            />
          </div>

          <button
            onClick={handleSaveExam}
            disabled={saving}
            style={{
              width: "100%",
              marginTop: 10,
              background: "#2e7d9a",
              color: "white",
              border: "none",
            }}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกผลตรวจ"}
          </button>

          {saveMessage && (
            <p
              style={{
                fontSize: 13,
                marginTop: 10,
                color: saveMessage.startsWith("เกิดข้อผิดพลาด")
                  ? "#b3261e"
                  : "#1e7a3d",
              }}
            >
              {saveMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryBox({ label, value, warning }) {
  return (
    <div style={{ background: "#f4f7f9", borderRadius: 8, padding: "10px 12px" }}>
      <p style={{ fontSize: 11, color: "#5b6b7a", margin: "0 0 4px" }}>{label}</p>
      <p
        style={{
          fontSize: 14,
          fontWeight: 500,
          margin: 0,
          color: warning ? "#b3791e" : "#1a2b3c",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function formatSph(value) {
  if (value === undefined || value === null || value === "") return "-";
  const num = Number(value);
  return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
}
