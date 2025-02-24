import cron from 'node-cron';
import UserServices from '../services/users.services.js';

const resetVideoViewsToday = async () => {
    console.log('🔄 Đang reset VideoViewsToday về 0...');
    try {
        await UserServices.resetVideoViewsTodayUser();
    } catch (error) {
        console.log("❌ Lỗi khi reset VideoViewsToday:", error);
    }
};

// Chạy vào 00:00 mỗi ngày
cron.schedule('0 0 * * *', resetVideoViewsToday, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
});

// // Chạy vào mỗi 5s 
// cron.schedule('*/5 * * * * *', resetVideoViewsToday, {
//     scheduled: true,
//     timezone: "Asia/Ho_Chi_Minh"
// });

export default resetVideoViewsToday;
