'use client'

import { useState, useEffect } from "react";
import useLeaderboardStream  from '@/utils/supabase/useLeaderboardStream'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { Clock } from "lucide-react";
import supabase from "@/utils/supabase/client";
import Cookies from "js-cookie";
import { toast } from "sonner";

const Leaderboard = () => {
  const [session, setSession] = useState("");
  const [targetTime, setTargetTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [jam, setJam] = useState("");
  const [menit, setMenit] = useState("");  

  const submissions = useLeaderboardStream(session)

  useEffect(() => {
    const cookieData = Cookies.get("admin");
    if (cookieData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookieData));
        setSession(parsed.sesi);
      } catch (err) {
        console.error("Gagal parse cookie timData:", err);
      }
    }
  }, []);  

  useEffect(() => {
    if (!session) return;
    const fetchWaktuBerakhir = async () => {
      const { data, error } = await supabase
        .from('submit_waktu')
        .select('waktu_berakhir')
        .order('waktu_berakhir', { ascending: false })
        .limit(1)
        .eq('sesi', session)
        .single();

      if (error) {
        return;
      } else if (!data){
        return;
      } else {
        const waktuBerakhirUTC = new Date(data.waktu_berakhir) 
        const waktuWITA = new Date(waktuBerakhirUTC.getTime() + (8 * 60 * 60 * 1000));
        setTargetTime(waktuWITA);
        // setTargetTime(data.waktu_berakhir);
      }
    };

    fetchWaktuBerakhir();
  }, [session]);

  useEffect(() => {
    if (!targetTime) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetTime).getTime() - now;
      console.log("Target:", new Date(targetTime).toString());
      console.log("Sekarang:", new Date().toString());
      console.log("Selisih ms:", new Date(targetTime).getTime() - Date.now());
      
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      {
        now>new Date(targetTime).getTime() 
        ? 
        setTimeLeft(`00:00:00`) 
        : 
        setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [targetTime]);

  const grouped = {}

  submissions.forEach((row) => {
    const key = `${row.tim}-${row.sesi}`

    if (!grouped[key]) {
      grouped[key] = {
        tim: row.tim,
        sesi: row.sesi,
        flags: {},
        progress: 0,
      }
    }

    const noFlag = row.flag?.no_flag
    if (noFlag) {
      grouped[key].flags[`flag${noFlag}`] = '✅'
      grouped[key].progress += 1
    }
  })

  const sorted = Object.values(grouped).sort((a, b) => b.progress - a.progress)

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log("jam:", jam, "→", Number(jam));
    console.log("menit:", menit, "→", Number(menit));

    if (!jam || !menit) {
      alert("Isi semua kolom dulu ya!");
      return;
    }

    const durasiInMs = (parseInt(jam) * 60 * 60 * 1000) + (parseInt(menit) * 60 * 1000);
    const waktuBerakhir = new Date(Date.now() + durasiInMs);

    try {
      const { data, error } = await supabase
        .from("submit_waktu")
        .upsert(
          {
            sesi: session,
            waktu_berakhir: waktuBerakhir,
            jam,
            menit
          },
        );

      if (error) throw error;

      toast.success("Waktu berhasil diatur!");
    } catch (error) {
      console.error("Gagal menyimpan waktu:", error.message);
      alert("Gagal menyimpan waktu ke database.");
    }
  };

  return (
    <div className="p-4 bg-gray-800 h-screen">
      <div className=" flex gap-10">
        <form
          onSubmit={handleSubmit}
          className="rounded flex flex-col bg-gray-900 p-4"
        >
          <h3 className="flex justify-center text-white font-bold text-3xl">Sesi {session}</h3>
          <div className="text-yellow-400 flex justify-center items-center text-2xl py-5">
            <Clock className="mr-2" />
            {timeLeft || 'Memuat...'}
          </div>
          <h2 className="text-xl font-semibold mb-3 mt-5 text-white">Timer</h2>
          <label className="block mb-4 text-white">
            Jam
            <input
              type="number"
              min="0"
              value={jam}
              onChange={(e) => setJam(e.target.value)}
              className="mt-1 w-full rounded px-3 py-2 bg-gray-700 text-white outline-none"
              required
            />
          </label>

          <label className="block mb-4 text-white">
            Menit
            <input
              type="number"
              min="0"
              max="59"
              value={menit}
              onChange={(e) => setMenit(e.target.value)}
              className="mt-1 w-full rounded px-3 py-2 bg-gray-700 text-white outline-none"
              required
            />
          </label>

          <Button
            type="submit"
            className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold py-2 rounded"
          >
            Simpan Waktu
          </Button>
        </form>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4 text-white">🏁 Leaderboard Live</h1>
          <div className=" rounded overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-800 text-white font-bold">
                <TableRow>
                  <TableHead className="text-white">Tim</TableHead>
                  <TableHead className="text-white">Sesi</TableHead>
                  <TableHead className="text-center text-white">F1</TableHead>
                  <TableHead className="text-center text-white">F2</TableHead>
                  <TableHead className="text-center text-white">F3</TableHead>
                  <TableHead className="text-center text-white">F4</TableHead>
                  <TableHead className="text-center text-white">F5</TableHead>
                  <TableHead className="text-center text-white">Poin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {sorted.map((row, index) => (
                    <motion.tr
                      key={row.tim + row.sesi}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className={index % 2 === 0 ? "bg-gray-700 text-white" : "bg-gray-800 text-white"}
                    >
                      <TableCell>{row.tim}</TableCell>
                      <TableCell>{row.sesi}</TableCell>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <TableCell key={i} className="text-center">
                          {row.flags[`flag${i}`] || "❌"}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold text-green-400">
                        {row.progress}
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
