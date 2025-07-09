import React, { useState } from "react";

const criteria = [
	{
		label: "ลักษณะการพักอาศัย",
		options: [
			{ label: "บ้านพักทางราชการ", score: 1 },
			{ label: "บ้านญาติ/เพื่อน", score: 3 },
			{ label: "เช่าบ้าน", score: 5 },
		],
	},
	{
		label: "เป็นผู้มีสิทธิ์เบิกค่าเช่าบ้าน",
		options: [
			{ label: "ไม่มีสิทธิ์", score: 1 },
			{ label: "มีสิทธิ์", score: 3 },
		],
	},
	{
		label: "ผู้ขอมีรายได้ทั้งหมด (เงินเดือน)",
		options: [
			{ label: "มากกว่า 50,000 บาท", score: 1 },
			{ label: "45,000 - 50,000 บาท", score: 2 },
			{ label: "30,000 - 45,000 บาท", score: 3 },
			{ label: "ต่ำกว่า 30,000 บาท", score: 5 },
		],
	},
	{
		label: "คู่สมรส/บุตรสมรสเป็นข้าราชการ ลูกจ้าง หรือพนักงานราชการ สังกัดกองทัพเรือ",
		options: [
			{ label: "ทร. 1 คน", score: 2 },
			{ label: "ทร. ทั้งคู่", score: 5 },
		],
	},
	{
		label: "สถานภาพ",
		options: [
			{ label: "โสด", score: 1 },
			{ label: "โสด มีบุตรภาระ", score: 3 },
			{ label: "สมรส บิดามารดา", score: 5 },
		],
	},
	{
		label: "ความสะดวกในการเดินทางมาปฏิบัติหน้าที่ราชการ",
		options: [
			{ label: "พาหนะส่วนตัว", score: 2 },
			{ label: "อาศัยเดินทาง", score: 3 },
			{ label: "รถสายราชการ", score: 5 },
		],
	},
	{
		label: "ระยะทางจากที่พักอาศัยปัจจุบันถึงที่ทำงาน",
		options: [
			{ label: "น้อยกว่า 30 กม.", score: 1 },
			{ label: "30 - 60 กม.", score: 3 },
			{ label: "60 กม.ขึ้นไป", score: 5 },
		],
	},
	{
		label: "จำนวนบุตรทั้งหมด",
		options: [
			{ label: "ไม่มีบุตร", score: 1 },
			{ label: "1 คน", score: 2 },
			{ label: "2 คน", score: 3 },
			{ label: "มากกว่า 2 คน", score: 5 },
		],
	},
	{
		label: "จำนวนบุตรที่อยู่ระหว่างศึกษา",
		options: [
			{ label: "ไม่มีบุตร", score: 1 },
			{ label: "1 คน", score: 2 },
			{ label: "มากกว่า 1 คน", score: 5 },
		],
	},
	{
		label: "อายุราชการ",
		options: [
			{ label: "น้อยกว่า 5 ปี", score: 1 },
			{ label: "5 - 10 ปี", score: 3 },
			{ label: "มากกว่า 10 ปี", score: 5 },
		],
	},
];

export default function ScoreForm() {
	const [selected, setSelected] = useState(Array(criteria.length).fill(null));

	const handleChange = (criIdx, optIdx) => {
		const newSelected = [...selected];
		newSelected[criIdx] = optIdx;
		setSelected(newSelected);
	};

	const totalScore = selected.reduce((sum, optIdx, criIdx) => {
		if (optIdx !== null) {
			return sum + criteria[criIdx].options[optIdx].score;
		}
		return sum;
	}, 0);

	return (
		<div className="h-screen w-screen bg-blue-50 flex justify-center items-center p-5">
			<div
				style={{
					maxWidth: 600,
					width: "100%",
					background: "#ffffff",
					borderRadius: 10,
					boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
					overflow: "hidden",
					border: "1px solid #e0e7ff",
					maxHeight: "calc(100vh - 4rem)",
					overflowY: "auto",
				}}
			>
				{/* Header */}
				<div
					style={{
						padding: "20px 30px",
						background: "#ffffff",
						borderBottom: "1px solid #e0e7ff",
					}}
				>
					<h2
						style={{
							margin: 0,
							fontSize: "20px",
							fontWeight: "600",
							color: "#1e40af",
						}}
					>
						แบบฟอร์มให้คะแนนการเข้าพัก
					</h2>
				</div>

				{/* Form Content */}
				<div style={{ padding: "20px 30px" }}>
					{criteria.map((cri, criIdx) => (
						<div
							key={cri.label}
							style={{
								marginBottom: 20,
								paddingBottom: 20,
								borderBottom:
									criIdx < criteria.length - 1
										? "1px solid #e0e7ff"
										: "none",
							}}
						>
							<div
								style={{
									fontWeight: "500",
									marginBottom: 15,
									fontSize: "16px",
									color: "#1f2937",
									lineHeight: "1.5",
								}}
							>
								{criIdx + 1}. {cri.label}
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: 10,
								}}
							>
								{cri.options.map((opt, optIdx) => (
									<label
										key={opt.label}
										style={{
											cursor: "pointer",
											display: "flex",
											alignItems: "center",
											padding: "12px 15px",
											background:
												selected[criIdx] === optIdx
													? "#e0f2fe"
													: "#ffffff",
											border:
												selected[criIdx] === optIdx
													? "2px solid #0284c7"
													: "1px solid #e5e7eb",
											borderRadius: 6,
											transition: "all 0.2s ease",
											fontSize: "14px",
											color: "#374151",
										}}
									>
										<input
											type="radio"
											name={`criteria-${criIdx}`}
											checked={selected[criIdx] === optIdx}
											onChange={() => handleChange(criIdx, optIdx)}
											style={{
												marginRight: 10,
												accentColor: "#0284c7",
											}}
										/>
										<span style={{ flex: 1 }}>
											{opt.label}
											<span
												style={{
													color: "#6b7280",
													fontWeight: "400",
													marginLeft: 5,
													fontSize: "13px",
												}}
											>
												({opt.score} คะแนน)
											</span>
										</span>
									</label>
								))}
							</div>
						</div>
					))}

					{/* Score Display */}
					<div
						style={{
							background: "#0284c7",
							color: "white",
							padding: "15px 20px",
							borderRadius: 6,
							textAlign: "center",
							marginTop: 20,
							marginBottom: 20,
						}}
					>
						<div
							style={{
								fontWeight: "600",
								fontSize: "16px",
							}}
						>
							รวมคะแนนที่ได้: {totalScore} คะแนน
						</div>
					</div>

					{/* Submit Button */}
					<div style={{ textAlign: "center" }}>
						<button
							type="button"
							style={{
								background: "#0284c7",
								color: "white",
								border: "none",
								padding: "12px 30px",
								borderRadius: 6,
								fontSize: "16px",
								fontWeight: "500",
								cursor: "pointer",
								transition: "all 0.2s ease",
							}}
							onMouseOver={(e) => {
								e.target.style.background = "#0369a1";
							}}
							onMouseOut={(e) => {
								e.target.style.background = "#0284c7";
							}}
						>
							บันทึกคะแนน
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}