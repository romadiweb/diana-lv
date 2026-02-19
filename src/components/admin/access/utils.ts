export function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("lv-LV");
}

export function parseLvDateTimeToIso(value: string) {
  const v = value.trim();
  if (!v) return null;

  // dd.mm.yyyy hh:mm OR dd/mm/yyyy hh:mm
  const m1 = v.match(/^\s*(\d{1,2})[./](\d{1,2})[./](\d{4})(?:\s+(\d{1,2}):(\d{2}))?\s*$/);
  if (m1) {
    const dd = Number(m1[1]);
    const mm = Number(m1[2]);
    const yyyy = Number(m1[3]);
    const hh = m1[4] ? Number(m1[4]) : 0;
    const mi = m1[5] ? Number(m1[5]) : 0;
    const d = new Date(yyyy, mm - 1, dd, hh, mi, 0, 0);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  // yyyy-mm-dd hh:mm OR yyyy-mm-ddThh:mm
  const m2 = v.match(/^\s*(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))\s*$/);
  if (m2) {
    const yyyy = Number(m2[1]);
    const mm = Number(m2[2]);
    const dd = Number(m2[3]);
    const hh = Number(m2[4]);
    const mi = Number(m2[5]);
    const d = new Date(yyyy, mm - 1, dd, hh, mi, 0, 0);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
