import React from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import fontRegular from "./THSARABUNNEW.TTF"; // ปรับให้ตรงกับเส้นทางฟอนต์ที่ถูกต้อง
import fontBold from "./THSARABUNNEW BOLD.ttf";

// ลงทะเบียนฟอนต์ไทย
Font.register({
  family: 'THSarabunNew',
  fonts: [
    { src: fontRegular, fontWeight: 'normal' },
    { src: fontBold, fontWeight: 'bold' },
  ]
});

// สไตล์สำหรับ PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontFamily: 'THSarabunNew',
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    padding: 8,
    textAlign: 'center',
    color: '#000000',
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 15,
    // marginTop: 20,
    color: '#000000',
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: 8,
    textAlign: 'center',
  },
  summaryTable: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 30,
  },
  detailTable: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    minHeight: 25,
  },
  tableRowEmpty: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    minHeight: 25,
    backgroundColor: '#f36363ff', // พื้นหลังสีแดงอ่อน
  },
  tableHeader: {
    backgroundColor: '#d3d3d3',
    fontWeight: 'bold',
  },
  // คอลัมน์สำหรับตารางสรุป
  summaryCol1: {
    width: '70%',
    paddingLeft: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    justifyContent: 'center',
  },
  summaryCol2: {
    width: '30%',
    paddingLeft: 8,
    paddingRight: 8,
    justifyContent: 'center',
  },
  // คอลัมน์สำหรับตารางรายละเอียด
  detailCol1: {
    width: '8%',
    paddingLeft: 4,
    paddingRight: 4,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    justifyContent: 'center',
  },
  detailCol2: {
    width: '12%',
    paddingLeft: 4,
    paddingRight: 4,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    justifyContent: 'center',
  },
  detailCol3: {
    width: '60%',
    paddingLeft: 4,
    paddingRight: 4,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    justifyContent: 'center',
  },
  detailCol4: {
    width: '20%',
    paddingLeft: 4,
    paddingRight: 4,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  cellTextLeft: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'left',
  },
  cellTextBold: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cellTextEmpty: {
    fontSize: 14,
    color: '#000000ff', // สีแดง
    textAlign: 'left',
    fontWeight: 'bold',
    backgroundColor: '#f36363ff', // พื้นหลังสีแดงอ่อน
  },
  summarySection: {
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    border: '1px solid #000000',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 9,
    color: '#666666',
  },
  pageBreak: {
    pageBreakAfter: 'always',
  },
});

// คอมโพเนนต์ PDF Document แบบรวม
const ComprehensiveReportPDF = ({ typeStats, houseStatus, detailData }) => {
  const currentDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('th-TH');

  // ฟังก์ชันจัดรูปแบบชื่อผู้อยู่อาศัย
  const formatResidentName = (item) => {
    if (item.residentName) return item.residentName;
    if (item.fullName) return item.fullName;
    if (item.fname && item.lname) return `${item.fname} ${item.lname}`;
    if (item.first_name && item.last_name) return `${item.first_name} ${item.last_name}`;
    if (item.fname) return item.fname;
    if (item.first_name) return item.first_name;
    return 'ว่าง';
  };

  // แยกข้อมูลตามประเภทบ้าน
  const groupByType = () => {
    if (!detailData || detailData.length === 0) return {};
    
    const grouped = {};
    detailData.forEach(item => {
      const type = item.hType || 'ไม่ระบุ';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(item);
    });
    return grouped;
  };

  const groupedData = groupByType();
  const totalHouses = houseStatus.vacant + houseStatus.occupied;
  const occupancyRate = totalHouses > 0 ? ((houseStatus.occupied / totalHouses) * 100).toFixed(1) : 0;
  const vacancyRate = totalHouses > 0 ? ((houseStatus.vacant / totalHouses) * 100).toFixed(1) : 0;

  return (
    <Document>
      {/* หน้าแรก: สรุปข้อมูล */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>รายงานสรุปประเภทบ้านพัก</Text>
        <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 20 }}>
          วันที่พิมพ์: {currentDate} เวลา: {currentTime}
        </Text>

        {/* ตารางสรุปประเภทบ้าน */}
        <Text style={styles.subHeader}>สถิติประเภทบ้านพัก</Text>
        <View style={styles.summaryTable}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.summaryCol1}>
              <Text style={styles.cellTextBold}>ประเภทบ้านพัก</Text>
            </View>
            <View style={styles.summaryCol2}>
              <Text style={styles.cellTextBold}>จำนวน (หลัง)</Text>
            </View>
          </View>

          {typeStats.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.summaryCol1}>
                <Text style={styles.cellTextLeft}>{item.type}</Text>
              </View>
              <View style={styles.summaryCol2}>
                <Text style={styles.cellText}>{item.count}</Text>
              </View>
            </View>
          ))}

          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.summaryCol1}>
              <Text style={styles.cellTextBold}>รวมทั้งหมด</Text>
            </View>
            <View style={styles.summaryCol2}>
              <Text style={styles.cellTextBold}>
                {typeStats.reduce((sum, item) => sum + item.count, 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* สรุปสถานะ */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>สรุปข้อมูลการใช้งาน</Text>
          <Text style={styles.summaryText}>• บ้านที่มีผู้อยู่อาศัย: {houseStatus.occupied} หลัง ({occupancyRate}%)</Text>
          <Text style={styles.summaryText}>• บ้านว่าง: {houseStatus.vacant} หลัง ({vacancyRate}%)</Text>
          <Text style={styles.summaryText}>• รวมทั้งหมด: {totalHouses} หลัง</Text>
          <Text style={styles.summaryText}>• จำนวนประเภทบ้าน: {typeStats.length} ประเภท</Text>
        </View>

        <Text style={styles.footer}>
          สร้างโดยระบบจัดการบ้านพัก • หน้า 1
        </Text>
      </Page>

      {/* หน้าต่อไป: รายละเอียดแยกตามประเภท */}
      {Object.entries(groupedData).map(([type, houses], typeIndex) => (
        <Page key={typeIndex} size="A4" style={styles.page}>
          <Text style={styles.header}>
            รายละเอียดผู้อยู่อาศัย - {type}
          </Text>
          <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 20 }}>
            จำนวน: {houses.length} หลัง
          </Text>

          {/* ตารางรายละเอียด */}
          <View style={styles.detailTable}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.detailCol1}>
                <Text style={styles.cellTextBold}>ลำดับ</Text>
              </View>
              <View style={styles.detailCol2}>
                <Text style={styles.cellTextBold}>เลขที่</Text>
              </View>
              <View style={styles.detailCol3}>
                <Text style={styles.cellTextBold}>ยศ ชื่อ-สกุล</Text>
              </View>
              <View style={styles.detailCol4}>
                <Text style={styles.cellTextBold}>เบอร์โทรศัพท์</Text>
              </View>
            </View>

            {houses.map((house, index) => {
              const residentName = formatResidentName(house);
              const isEmpty = residentName === 'ว่าง';
              
              return (
                <View key={index} style={isEmpty ? styles.tableRowEmpty : styles.tableRow}>
                  <View style={styles.detailCol1}>
                    <Text style={styles.cellText}>{index + 1}</Text>
                  </View>
                  <View style={styles.detailCol2}>
                    <Text style={styles.cellText}>
                      {house.hNumber || house.houseNumber || house.house_number || '-'}
                    </Text>
                  </View>
                  <View style={styles.detailCol3}>
                    <Text style={isEmpty ? styles.cellTextEmpty : styles.cellTextLeft}>
                      {residentName}
                    </Text>
                  </View>
                  <View style={styles.detailCol4}>
                    <Text style={styles.cellText}>
                      {house.phone || house.phoneNumber || house.phone_number || '-'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* สรุปประเภทนี้ */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>สรุปข้อมูล {type}</Text>
            <Text style={styles.summaryText}>
              • จำนวนบ้านทั้งหมด: {houses.length} หลัง
            </Text>
            <Text style={styles.summaryText}>
              • จำนวนบ้านที่มีผู้อยู่อาศัย: {houses.filter(house => 
                formatResidentName(house) !== 'ว่าง'
              ).length} หลัง
            </Text>
            <Text style={styles.summaryText}>
              • จำนวนบ้านว่าง: {houses.filter(house => 
                formatResidentName(house) === 'ว่าง'
              ).length} หลัง
            </Text>
            <Text style={styles.summaryText}>
              • อัตราการเข้าพัก: {houses.length > 0 ? 
                ((houses.filter(house => formatResidentName(house) !== 'ว่าง').length / houses.length) * 100).toFixed(1)
                : 0}%
            </Text>
          </View>

          <Text style={styles.footer}>
            สร้างโดยระบบจัดการบ้านพัก • หน้า {typeIndex + 2}
          </Text>
        </Page>
      ))}
    </Document>
  );
};

/* 
// คอมโพเนนต์ PDF Document สำหรับสรุปเท่านั้น - ยังไม่ใช้งาน
const SummaryReportPDF = ({ typeStats, houseStatus }) => {
  const currentDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalHouses = houseStatus.vacant + houseStatus.occupied;
  const occupancyRate = totalHouses > 0 ? ((houseStatus.occupied / totalHouses) * 100).toFixed(1) : 0;
  const vacancyRate = totalHouses > 0 ? ((houseStatus.vacant / totalHouses) * 100).toFixed(1) : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>รายงานสรุปประเภทบ้านพัก</Text>
        <Text style={{ textAlign: 'center', fontSize: 20, marginBottom: 20 }}>
          วันที่พิมพ์: {currentDate}
        </Text>

        <Text style={styles.subHeader}>สถิติประเภทบ้านพัก</Text>
        <View style={styles.summaryTable}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.summaryCol1}>
              <Text style={styles.cellTextBold}>ประเภทบ้านพัก</Text>
            </View>
            <View style={styles.summaryCol2}>
              <Text style={styles.cellTextBold}>จำนวน (หลัง)</Text>
            </View>
          </View>

          {typeStats.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.summaryCol1}>
                <Text style={styles.cellTextLeft}>{item.type}</Text>
              </View>
              <View style={styles.summaryCol2}>
                <Text style={styles.cellText}>{item.count}</Text>
              </View>
            </View>
          ))}

          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.summaryCol1}>
              <Text style={styles.cellTextBold}>รวมทั้งหมด</Text>
            </View>
            <View style={styles.summaryCol2}>
              <Text style={styles.cellTextBold}>
                {typeStats.reduce((sum, item) => sum + item.count, 0)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>สรุปข้อมูลการใช้งาน</Text>
          <Text style={styles.summaryText}>• บ้านที่มีผู้อยู่อาศัย: {houseStatus.occupied} หลัง ({occupancyRate}%)</Text>
          <Text style={styles.summaryText}>• บ้านว่าง: {houseStatus.vacant} หลัง ({vacancyRate}%)</Text>
          <Text style={styles.summaryText}>• รวมทั้งหมด: {totalHouses} หลัง</Text>
        </View>

        <Text style={styles.footer}>
          สร้างโดยระบบจัดการบ้านพัก • {currentDate}
        </Text>
      </Page>
    </Document>
  );
};
*/

// Component หลักสำหรับ PDF Download
const PDFDownload = ({ typeStats, houseStatus, detailData, reportType = 'summary', disabled = false }) => {
  const getPDFFileName = () => {
    const currentDate = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
    
    // if (reportType === 'comprehensive') {
      return `รายงานครบถ้วนบ้านพัก_${currentDate}.pdf`;
    // }
    // return `รายงานสรุปบ้านพัก_${currentDate}.pdf`;
  };

  if (disabled) {
    return (
      <button disabled style={{
        background: "#9ca3af", color: "#fff", border: "none", borderRadius: 8,
        padding: "8px 24px", fontWeight: "bold", fontSize: 16, cursor: "not-allowed",
        boxShadow: "0 2px 8px #e5e7eb", display: "flex", alignItems: "center", gap: 8
      }}>
        📄 กำลังโหลดข้อมูล...
      </button>
    );
  }

  // ใช้แค่ ComprehensiveReportPDF เท่านั้น
  const document = <ComprehensiveReportPDF typeStats={typeStats} houseStatus={houseStatus} detailData={detailData} />;

  return (
    <PDFDownloadLink
      document={document}
      fileName={getPDFFileName()}
      style={{
        background: "#6366f1", // ใช้สีเดียว
        color: "#fff", border: "none", borderRadius: 8, padding: "8px 24px",
        fontWeight: "bold", fontSize: 16, textDecoration: "none",
        boxShadow: "0 2px 8px #e5e7eb", display: "flex", alignItems: "center", gap: 8
      }}
    >
      {({ blob, url, loading, error }) => {
        if (error) {
          console.error('PDF Error:', error);
          return <span style={{ color: "#ef4444" }}>❌ เกิดข้อผิดพลาด</span>;
        }
        
        return loading ? (
          <span>⏳ กำลังสร้าง PDF...</span>
        ) : (
          <span>
            📄 รายงานครบถ้วน
          </span>
        );
      }}
    </PDFDownloadLink>
  );
};

export default PDFDownload;