'use client'
import { useEffect, useState } from "react";
import SubmitFlag from "@/components/kirim-flag/SubmitFlag"
import Cookies from "js-cookie";

const Page = () => {
    const [hasSession, setHasSession] = useState(false);

    useEffect(() => {
      const cookieData = Cookies.get("timData");
      if (!cookieData) {
        setHasSession(true);
      }
    }, []);
    return(
        <>
            <SubmitFlag/>
        </>
    )
}

export default Page