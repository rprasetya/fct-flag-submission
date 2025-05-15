import supabase from "./supabase/client";

export async function fetchWaktuBerakhir(sesi) {
  const { data, error } = await supabase
    .from("submit_waktu")
    .select("waktu_berakhir")
    .eq("sesi", sesi)
    .single();

  if (error || !data) {
    // Tidak perlu lempar error — anggap tidak ada waktu diset
    console.warn("Tidak ada waktu berakhir ditemukan untuk sesi:", sesi);
    return null;
  }

  return data.waktu_berakhir;
}