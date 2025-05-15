'use client'
import Image from "next/image";
import { Shield, Users, Terminal } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";



export default function Home() {
  const [showVideo, setShowVideo] = useState(false);

  return (
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
        <div className="flex flex-col justify-center items-center gap-5 h-full">
          <div className="flex items-center gap-4 font-bold">
            <Shield size={62} className="text-shield"/>
            <h1 className="text-4xl">CTF Flag Submission</h1>
          </div>
          <div className="flex justify-center gap-5">
            <Button className="bg-button1 hover:bg-button1 hover:scale-110">
              <Users size={32}/>
              <Link href="/akses-tim">Akses Tim</Link>
            </Button>
            <Button className="bg-button2 hover:bg-button2 hover:scale-110">
            <Terminal size={32} />
            <Link href="/pilih-sesi">Admin Dashboard</Link>
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground text-center mb-3">
          <p>Total 29 Tim • 2 Sesi • 12 Flags (6 per Sesi)</p>
          <p>© 2025 CTF Challenge System</p>
        </div>
      </div>
    </div>
  );
}
