export function getSecondsRemaining(waktuBerakhir) {
    const now = new Date();
    const end = new Date(waktuBerakhir);
    const diffInSec = Math.floor((end.getTime() - now.getTime()) / 1000);
    return diffInSec > 0 ? diffInSec : 0;
  }
  