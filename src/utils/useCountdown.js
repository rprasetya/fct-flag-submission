import { useEffect, useState } from "react";

const useCountdown = (endTime) => {
  const calculateTimeLeft = () => {
    const difference = new Date(endTime).getTime() - new Date().getTime();
    return difference > 0 ? difference : 0;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return {
    currentTime: timeLeft,
    duration: new Date(endTime).getTime() - new Date().getTime() + timeLeft, // bisa sesuaikan logika ini jika ingin durasi total terpisah
    isFinished: timeLeft <= 0,
  };
};

export default useCountdown;
