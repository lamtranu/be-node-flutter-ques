import mongoose from "mongoose";
import { FAVORITE_FOODS } from '../config/petConstants.config.js';

const petSchema = new mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Liên kết với User
        required: true
    },
    name: {
        type: String,
        required: true
    },
    exp: {
        type: Number,
        default: 0 // Kinh nghiệm mặc định là 0
    },
    type: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        default: 1 // Level mặc định là 1
    },
    lastFedTime: {
        type: Date,
        default: Date.now // Lần cuối được cho ăn
    },
    favoriteFood: {
        type: String,
        enum: FAVORITE_FOODS,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Tạo model Pet từ schema
const Pet = mongoose.model("Pet", petSchema);

export default Pet;
