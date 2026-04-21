export const INDONESIA_LOCATIONS: Record<string, string[]> = {
  Banten: ["Tangerang Selatan", "Kota Tangerang", "Serang", "Cilegon"],
  "DKI Jakarta": [
    "Jakarta Selatan",
    "Jakarta Pusat",
    "Jakarta Timur",
    "Jakarta Barat",
    "Jakarta Utara",
  ],
  "Jawa Barat": ["Bandung", "Bogor", "Bekasi", "Depok"],
  "Jawa Tengah": ["Semarang", "Surakarta", "Magelang", "Salatiga"],
};

/**
 * Returns the province for a given city/location.
 * If not found, returns "Unknown".
 */
export function getProvinceFromCity(city: string): string {
  for (const [province, cities] of Object.entries(INDONESIA_LOCATIONS)) {
    if (cities.includes(city)) return province;
  }
  return "Unknown";
}
