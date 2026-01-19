export const calculateTimeLeft = (otpExpireTime: string) => {
    const expiryTime = new Date(otpExpireTime).getTime();
    const now = new Date().getTime();
    const difference = Math.floor((expiryTime - now) / 1000);
    return difference > 0 ? difference : 0;
};

// Format seconds to MM:SS
export const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
};
