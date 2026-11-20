// Geographic anchors for the first playable district of LAMHAH Life.
// Roads and non-landmark building footprints are illustrative blockout geometry,
// not a survey-grade reconstruction.
export const MAP_CENTER = { lat: 29.81115, lon: 39.86717 };
export const GEO_ANCHORS = [
  { id: "marid-castle", name: "قلعة مارد", kind: "castle", lat: 29.81115, lon: 39.86717, note: "المعلم الرئيسي للحي التاريخي" },
  { id: "omar-mosque", name: "مسجد عمر بن الخطاب", kind: "mosque", lat: 29.81203, lon: 39.86762, note: "بجوار قلعة مارد والحي التاريخي" },
  { id: "al-dara-quarter", name: "حي الدرع التاريخي", kind: "heritage", lat: 29.811186, lon: 39.867053, note: "نسيج من البيوت الحجرية والأزقة المتصلة" }
];
export const STARTING_DISTRICT = {
  title: "وسط دومة الجندل — النواة التاريخية",
  radiusMeters: 450,
  playablePhase: "Blockout 01",
  expansionTargets: ["وسط المدينة الحديث", "الأسواق والخدمات", "بحيرة دومة الجندل", "المزارع والأطراف"]
};