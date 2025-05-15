'use client'
import { useEffect, useState } from "react";
import { Clock, Flag, LockKeyhole, Unlock, Award } from "lucide-react";
import Cookies from "js-cookie";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import supabase from "@/utils/supabase/client";
import { toast } from "sonner";

const SubmitFlag = () => {
  const router = useRouter();
  const [teamId, setTeamId] = useState("");
  const [teamSession, setTeamSession] = useState("");
  const [flags, setFlags] = useState([]);
  const [submitData, setSubmitData] = useState([]);
  const [submittedFlags, setSubmittedFlags] = useState({});
  const [flagInputs, setFlagInputs] = useState({});
  const [timeLeft, setTimeLeft] = useState('');
  const [targetTime, setTargetTime] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });

  const timer = {
    currentTime: 30,
    duration: 300
  };

  useEffect(() => {
    const cookieData = Cookies.get("timData");
    if (cookieData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookieData));
        setTeamId(parsed.nomorTim);
        setTeamSession(parsed.sesi);
      } catch (err) {
        console.error("Gagal parse cookie timData:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!teamSession) return;
    const fetchWaktuBerakhir = async () => {
      const { data, error } = await supabase
        .from('submit_waktu')
        .select('waktu_berakhir')
        .order('waktu_berakhir', { ascending: false })
        .limit(1)
        .eq('sesi', teamSession)
        .single();

      if (error) {
        return;
      } else if (!data){
        return;
      } else {
        const waktuBerakhirUTC = new Date(data.waktu_berakhir) 
        const waktuWITA = new Date(waktuBerakhirUTC.getTime() + (8 * 60 * 60 * 1000));
        setTargetTime(waktuWITA);
      }
    };

    fetchWaktuBerakhir();
  }, [teamSession]);

  useEffect(() => {
    if (!targetTime) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetTime).getTime() - now;
      
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

  useEffect(() => {
    if (teamSession) {
      console.log("Fetching flags for session:", teamSession);
      fetchFlags(teamSession);
    }
  }, [teamSession]);

  useEffect(() => {
    if (teamId && teamSession) {
      fetchSubmittedFlags();
    }
  }, [teamId, teamSession]);
 
  useEffect(() => {
    if (flags.length > 0 && submitData.length > 0) {
      const submitted = {};
      submitData.forEach(item => {
        const flagRecord = flags.find(f => f.id === item.id_flag); // pastikan `f.id` cocok dengan `item.id_flag`
        console.log('flags',flagRecord);
        if (flagRecord) {
          submitted[flagRecord.no_flag] = true; // misalnya: { flag1: true }
        }
      });
  
      setSubmittedFlags(submitted);
    }
  }, [flags, submitData]);
 
  const fetchSubmittedFlags = async () => {
    const { data, error } = await supabase
      .from('submit')
      .select('*')
      .eq('tim', teamId)
      .eq('sesi', teamSession)
      .eq('is_right', true);
  
    if (error) {
      console.error("Gagal mengambil data submit:", error.message);
      return;
    }
  
    setSubmitData(data);
  };

  const fetchFlags = async (session) => {
    const { data, error } = await supabase
      .from("flag")
      .select("*")
      .eq("sesi", session);
  
    if (error) {
      console.error("Gagal mengambil data flag:", error);
    } else {
      setFlags(data);
    }
  };

  const formatTime = (time) => {
    const m = Math.floor(time / 60).toString().padStart(2, "0");
    const s = (time % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleFlagSubmit = async (flag, correctFlag, idFlag) => {
    const { data: waktuData, error: waktuError } = await supabase
    .from("submit_waktu")
    .select("waktu_berakhir")
    .order('waktu_berakhir', { ascending: false })
    .limit(1)
    .eq("sesi", teamSession)
    .single();

    if (waktuError) {
      console.error("Gagal mengambil waktu_berakhir:", waktuError.message);
      toast.error("Gagal mengambil data waktu.");
      return;
    }
    const now = new Date().getTime();
    const waktuBerakhir = new Date(waktuData.waktu_berakhir);
    const waktuWITA = new Date(waktuBerakhir.getTime() + (8 * 60 * 60 * 1000));
    const isTimeout = now > waktuWITA;
    if (isTimeout) {
      toast.error("Waktu sudah habis. Tidak bisa submit.");
      return;
    }
    const submittedValue = flagInputs[flag]?.trim();
  
    const isCorrect = submittedValue === correctFlag;
  
    if (isCorrect) {
      setSubmittedFlags(prev => ({ ...prev, [flag]: true }));
      toast.success("Flag berhasil dikonfirmasi!");
    } else {
      toast.error("Flag salah atau tidak sesuai.");
    }
  
    const { data, error } = await supabase.from('submit').insert([
      {
        sesi: teamSession,        // enum: 'ganjil' atau 'genap'
        tim: teamId,        // ID tim dari cookie
        id_flag: idFlag,               // contoh: 'flag1', 'flag2', dst
        jawaban: submittedValue,  // jawaban yang dikirim user
        is_right: isCorrect       // true jika cocok, false jika salah
      }
    ]);
  
    if (error) {
      console.error("Gagal menyimpan jawaban:", error.message);
      toast.error("Gagal menyimpan ke database.");
    } else {
      console.log("Berhasil disimpan ke Supabase:", data);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 px-40 flex flex-col gap-10">
      <div className="grid grid-cols-3">
        <div className="flex justify-start items-center">
          <Button 
            className="bg-cardform cursor-pointer"
            onClick={() => {
              Cookies.remove("timData");
              router.push("/akses-tim");
            }}
          >
            Kembali
          </Button>
        </div>
        <div className="flex justify-center items-center">
          <h2 className="text-3xl font-bold mb-4">Tim {teamId} - Sesi {teamSession}</h2>
        </div>
        <div className="text-yellow-400 flex justify-center items-center text-2xl py-5">
          <Clock className="mr-2" />
          {timeLeft || 'Memuat...'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {[...flags]
        .sort((a, b) => parseInt(a.no_flag) - parseInt(b.no_flag)) // urutkan berdasarkan no_flag secara numerik
        .map((flag) => {
          const isSubmitted = submittedFlags[flag.no_flag] || false;

          return (
            <div key={flag.id} className="bg-gray-800 p-5 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Flag className={`mr-2 ${isSubmitted ? 'text-green-500' : 'text-yellow-400'}`} />
                  <span className="font-semibold">Flag {flag.no_flag}</span>
                </div>
                {isSubmitted ? (
                  <div className="text-green-400 flex items-center">
                    <Unlock size={16} className="mr-1" /> Terkonfirmasi
                  </div>
                ) : (
                  <div className="text-gray-400 flex items-center">
                    <LockKeyhole size={16} className="mr-1" /> Belum Submit
                  </div>
                )}
              </div>

              {isSubmitted ? (
                <div className="bg-green-700/20 text-green-300 p-2 rounded flex items-center">
                  <Award size={18} className="mr-2" /> Berhasil disubmit!
                </div>
              ) : (
                <div className="flex">
                  <input
                    type="text"
                    value={flagInputs[flag.no_flag] || ""}
                    onChange={(e) =>
                      setFlagInputs(prev => ({ ...prev, [flag.no_flag]: e.target.value }))
                    }
                    className="flex-1 bg-gray-700 px-3 py-2 rounded-l outline-none"
                    placeholder="Masukkan flag..."
                  />
                  <button
                    onClick={() => handleFlagSubmit(flag.no_flag, flag.jawaban, flag.id)}
                    className="bg-blue-600 cursor-pointer hover:bg-blue-700 px-4 rounded-r"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          );
        })
      }
      </div>
    </div>
  );
};

export default SubmitFlag;
