import mongoose from "mongoose";
import { FAVORITE_FOODS } from '../config/petConstants.config.js';

const foodPetSchema = new mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },
    foodClaimed: { 
        type: Date, 
        default: null 
    }, // Thời gian nhận thức ăn lần cuối
    foods: [
        {
            name: { 
                type: String, 
                required: true 
            }, // Tên thức ăn (Táo, Bánh mì, Cà rốt)
            qty: { 
                type: Number, 
                default: 0 
            }, // Số lượng thức ăn
            exp: { 
                type: Number, 
                default: 0 
            }, // Điểm kinh nghiệm khi sử dụng
            
        }
    ] 
});

// Tạo model Pet từ schema
const FoodPet = mongoose.model("FoodPet", foodPetSchema);

export default FoodPet;
