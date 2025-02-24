import FoodPet from "../models/food_pet.model.js";
import { SELECTED_RECEIVED_FOODS } from "../config/petConstants.config.js";
import { MONGO_DB_CONFIG } from "../config/app.config.js";
import User from "../models/user.model.js";

const foodPetServices = {
  //Chọn nhận thức ăn cho pet
  async selectedReceiveFoodPet(params, callback) {
    //user
    const email = params.email;
    let password = params.password;
    //food-pet
    const nameFood = params.nameFood;
    const type = params.type;
    const version = params.version;

    let msgSelectedReceivedFoodPet = "Nhận thức ăn thành công";
    let statusSelectedReceivedFoodPet = true;

    let isUser = await User.findOne({ email: email });

    let foodPet = null;
    let infoUser = null;

    //Check version
    if (version == MONGO_DB_CONFIG.SERVER_VERSION) {
      if (isUser) {
        if (isUser.password == password) {
          let isFoodPet = await FoodPet.findOne({ owner_id: isUser._id });
          if (isFoodPet) {
            if (type == "Miễn phí") {
              const SELECT_RECEIVED_FOODS_INDEX = SELECTED_RECEIVED_FOODS.findIndex((food) => food.name === nameFood);
              //Client chọn food có trong free
              if (SELECT_RECEIVED_FOODS_INDEX != -1) {
                //console.log('foodClaimed:' + new Date(isFoodPet.foodClaimed).getTime());
                console.log("Date.now():", new Date(Date.now()).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }));

                console.log("foodClaimed:" + isFoodPet.foodClaimed);
                //console.log('foodClaimed:' + new Date(isFoodPet.foodClaimed).getTime());
                //Check time chọn với lần cuối chọn free
                if (new Date(isFoodPet.foodClaimed).getTime() <= Date.now()) {
                  const foodIndex = isFoodPet.foods.findIndex((food) => food.name === nameFood);
                  //Có món chọn nhận ở trong inven
                  if (foodIndex !== -1) {
                    isFoodPet.foods[foodIndex].qty += 1;
                    //Món chọn mà trong inven chưa có => Thêm vào
                  } else {
                    isFoodPet.foods.push({
                      name: nameFood,
                      qty: 1,
                      exp: SELECTED_RECEIVED_FOODS[SELECT_RECEIVED_FOODS_INDEX].exp,
                    });
                  }
                  isFoodPet.foodClaimed = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(); //3 tiếng nhận free
                  await isFoodPet.save();
                  console.log("Người dùng chọn nhận thức ăn " + type + " thành công");
                } else {
                  statusSelectedReceivedFoodPet = false;
                  msgSelectedReceivedFoodPet = "Chưa đến thời gian nhận, vui lòng thử lại sau";
                }
              } else {
                statusSelectedReceivedFoodPet = false;
                msgSelectedReceivedFoodPet = "Người dùng chọn món ăn không tồn tại trên hệ thống";
              }
            } else if (type == "Xem quảng cáo") {
              const SELECT_RECEIVED_FOODS_INDEX = SELECTED_RECEIVED_FOODS.findIndex((food) => food.name === nameFood);
              //Client chọn food có trong free
              if (SELECT_RECEIVED_FOODS_INDEX != -1) {
                const foodIndex = isFoodPet.foods.findIndex((food) => food.name === nameFood);
                //Có món chọn nhận ở trong inven
                if (foodIndex !== -1) {
                  isFoodPet.foods[foodIndex].qty += 1;
                  //Món chọn mà trong inven chưa có => Thêm vào
                } else {
                  isFoodPet.foods.push({
                    name: nameFood,
                    qty: 1,
                    exp: SELECTED_RECEIVED_FOODS[SELECT_RECEIVED_FOODS_INDEX].exp,
                  });
                }
                isUser.videoViewsToday += 1;
                await isFoodPet.save();
                await isUser.save();
                console.log("Người dùng chọn nhận thức ăn " + type + " thành công");
              } else {
                statusSelectedReceivedFoodPet = false;
                msgSelectedReceivedFoodPet = "Người dùng chọn món ăn không tồn tại trên hệ thống";
              }
            }
            foodPet = isFoodPet;
          } else {
            statusSelectedReceivedFoodPet = false;
            msgSelectedReceivedFoodPet = "Người dùng không có túi đồ, vui lòng liên hệ admin";
          }
          infoUser = isUser;
        } else {
          statusSelectedReceivedFoodPet = false;
          msgSelectedReceivedFoodPet = "Mật khẩu user không đúng";
        }
      } else {
        statusSelectedReceivedFoodPet = false;
        msgSelectedReceivedFoodPet = "Không tồn tại user này";
      }
    } else {
      msgSelectedReceivedFoodPet = "Phiên bản hiện tại không phù hợp, vui lòng cập nhật phiên bản mới bạn nhé <3";
      statusSelectedReceivedFoodPet = false;
    }

    let data = {
      msgSelectedReceivedFoodPet: msgSelectedReceivedFoodPet,
      statusSelectedReceivedFoodPet: statusSelectedReceivedFoodPet,
      foodPet: foodPet,
      infoUser: infoUser,
    };

    //console.log(data);

    return callback(null, data);
  },
};

export default foodPetServices;
