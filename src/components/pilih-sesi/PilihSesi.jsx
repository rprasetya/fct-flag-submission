"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner"

const PilihSesi = () =>{
    const router = useRouter();

    const [showVideo, setShowVideo] = useState(false);
    const [sesi, setSesi] = useState("");
    const [nomorTim, setNomorTim] = useState("");

    useEffect(() => {
        setShowVideo(true);
      }, []);

    const getNomorTim = () => {
        const allNumbers = Array.from({ length: 29 }, (_, i) => i + 1);
        return allNumbers.filter((n) => sesi === "ganjil" ? n % 2 === 1 : n % 2 === 0);
    };

    return(
        <div className="relative w-full h-screen overflow-hidden">
            {showVideo && (
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover blur-sm scale-105"
                    src="/assets/gradient.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            )}
            <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-white bg-black/60">
                <Card className="w-[450px] py-8 bg-cardform/50 backdrop-blur-md border border-white/20 shadow-lg text-white">
                    <CardHeader>
                        <CardTitle className="text-xl">Akses Leaderboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form>
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="name">Pilih Sesi</Label>
                                    <div className="grid grid-cols-2 gap-5 text-sm text-center">
                                        <label className={`cursor-pointer transition-colors duration rounded-sm py-2 border 
                                            ${sesi === "ganjil" ? "bg-white text-black" : "border-white"}`}>
                                            <input
                                                type="radio"
                                                name="sesi"
                                                value="ganjil"
                                                className="hidden"
                                                checked={sesi === "ganjil"}
                                                onChange={() => setSesi("ganjil")}
                                            />
                                            Ganjil
                                        </label>

                                        <label className={`cursor-pointer transition-colors duration rounded-sm py-2 border
                                            ${sesi === "genap" ? "bg-white text-black" : "border-white"}`}>
                                            <input
                                                type="radio"
                                                name="sesi"
                                                value="genap"
                                                className="hidden"
                                                checked={sesi === "genap"}
                                                onChange={() => setSesi("genap")}
                                            />
                                            Genap
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button 
                            className="bg-transparent border cursor-pointer hover:bg-white hover:text-black" 
                            onClick={() => router.push("/")}
                        >
                            Kembali
                        </Button>
                        <Button 
                            variant="outline" 
                            className="text-black cursor-pointer hover:bg-transparent hover:text-white"
                            onClick={() => {
                                if (!sesi) {
                                    toast.error('Pilih sesi yang benar!');
                                    return;
                                }
                            
                                Cookies.set("admin", JSON.stringify({ sesi }), { expires: 1 });
                                router.push('/dashboard')
                            }}
                        >
                            Lanjut
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default PilihSesi