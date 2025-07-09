import React from "react";

const backgroundUrl = ".sky.jpg";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: `url('/sky.jpg') center center / cover no-repeat`,
        position: "relative",
        backgroundAttachment: "fixed",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* กล่องตรงกลาง */}
      <div
        style={{
          background: "linear-gradient(135deg, #3a8dff 0%, #00c6ff 100%)",
          borderRadius: 30,
          padding: 40,
          maxWidth: 500,
          width: "90vw",
          boxShadow: "0 10px 30px rgba(0, 128, 255, 0.4)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "auto",
          color: "#fff",
        }}
      >
        {/* ช่องว่างสำหรับรูป */}
        <div
          style={{
            width: 180,
            height: 180, // ทำให้เป็นวงกลมจริง ๆ
            background: "#fff",
            borderRadius: "50%",
            margin: "0 auto 24px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 2px 12px #0002",
          }}
        >
          <img
            src="/shiho.png"
            alt="profile"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",      // สำคัญมาก
              objectPosition: "center" // เลื่อนตำแหน่งรูปให้อยู่กลาง
            }}
          />
        </div>

        <button
          style={{
            background: "#ffe066",
            color: "#003366",
            border: "none",
            borderRadius: 8,
            padding: "12px 36px",
            fontWeight: "bold",
            fontSize: 20,
            cursor: "pointer",
            boxShadow: "0 2px 8px #0001",
            marginTop: 12,
          }}
          onClick={() => window.location.href = "/login"}
        >
          เข้าสู่เว็บไซต์
        </button>
      </div>
    </div>
  );
}
