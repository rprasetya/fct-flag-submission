import { useEffect, useState } from "react";
import supabase from "./client";

const useLeaderboardStream = (sesi) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!sesi) return;

    const fetchInitial = async () => {
      const { data: initialData, error } = await supabase
        .from("submit")
        .select("*, flag(no_flag)")
        .eq("is_right", true)
        .eq("sesi", sesi);

      if (error) console.error("Initial fetch error:", error);
      else setData(initialData);
    };

    fetchInitial();

    const channel = supabase
      .channel(`leaderboard-stream-${sesi}`) // unique per sesi
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'submit',
          filter: `is_right=eq.true`, // can't filter sesi here
        },
        async (payload) => {
          if (payload.new.sesi !== sesi) return; // filter secara manual
          
          const { data: flagData } = await supabase
            .from("flag")
            .select("no_flag")
            .eq("id", payload.new.id_flag)
            .single();

          setData((old) => [
            ...old,
            { ...payload.new, flag: flagData ? { no_flag: flagData.no_flag } : null },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sesi]);

  return data;
};

export default useLeaderboardStream;
