import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    cryptoToken: {              // Token giao dịch (tiền ảo)
        type: Number,
        default: 0,
    },
    videoViewsToday: {          // Số lượt xem video trong ngày
        type: Number,
        default: 0,
    },
    isFreePet: {                 //pet nhận free
        type: Boolean,
        required: true
    },
    numberPetVideoReward: {     //số lượng pet đã nhận từ xem video quảng cáo
        type: Number,
        default: 0,
    },
    numberSeeVideoReward:{      //Số lượng video quảng cáo đã xem
        type: Number,
        default: 0,
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

export default User;
