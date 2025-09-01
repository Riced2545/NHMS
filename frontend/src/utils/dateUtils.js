// รับวันที่แบบ 'YYYY-MM-DD' แล้วแปลงเป็น 'DD/MM/YYYY' (หรือรูปแบบไทย)
export function formatThaiDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = (d.getFullYear() + 543).toString(); // ปี พ.ศ.
  return `${day}/${month}/${year}`;
}

// รับวันที่แบบ 'DD/MM/YYYY' แล้วแปลงกลับเป็น 'YYYY-MM-DD'
export function parseThaiDate(thaiDateStr) {
  if (!thaiDateStr) return "";
  const [day, month, year] = thaiDateStr.split("/");
  const gregorianYear = (parseInt(year, 10) - 543).toString();
  return `${gregorianYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function splitThaiDate(dateStr) {
  if (!dateStr) return { day: "", month: "", year: "" };
  const [day, month, year] = dateStr.split("/");
  return { day: day || "", month: month || "", year: year || "" };
}

export function joinThaiDate(day, month, year) {
  if (!day || !month || !year) return "";
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

export function getYearOptions(range = 80) {
  const buddhistYearNow = new Date().getFullYear() + 543;
  const years = [];
  for (let y = buddhistYearNow - range; y <= buddhistYearNow; y++) {
    years.push(y);
  }
  return years;
}