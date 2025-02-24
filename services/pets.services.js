import Pet from "../models/pet.model.js";
import User from "../models/user.model.js";
import FoodPet from "../models/food_pet.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  FAVORITE_FOODS,
  PET_NAME_FREE,
  PET_TYPE_FREE,
  SELECTED_RECEIVED_FOODS,
  getFoodByName,
  getPetReceivedVideoRewardByName,
} from "../config/petConstants.config.js";

import { MONGO_DB_CONFIG } from "../config/app.config.js";

const PetServices = {
  //client selected pet free hoặc xem quảng cáo
  async selectedReceivedPet(params, callback) {
    try {
      //user
      const email = params.email;
      const password = params.password;
      //pet
      const userVersion = params.version;
      const typedSelectedReceivedPet = params.typedSelectedReceivedPet;
      const typePet = params.typePet;

      let infoPetNew = null;
      let infoUser = null;

      let statusSelected = true;
      let messageSelected = "Lựa chọn Pet thành công!";

      //Check version
      if (userVersion == MONGO_DB_CONFIG.SERVER_VERSION) {
        //Find email user
        const userModel = await User.findOne({ email: email });
        //tồn tại user này
        if (userModel != null) {
          //trạng thái user đã kích họat
          if (userModel.status == "active") {
            //trùng mật khẩu
            if (password == userModel.password) {
              if (typedSelectedReceivedPet == "Miễn phí") {
                //còn lượt chọn pet free
                if (userModel.isFreePet == true) {
                  //Pet từ client nằm trong mảng pet free của server
                  if (PET_TYPE_FREE.includes(typePet)) {
                    const index = PET_TYPE_FREE.indexOf(typePet); // Lấy index của typePet
                    const petName = PET_NAME_FREE[index] || "";

                    const randomHours = Math.floor(Math.random() * 2) + 1; // Random từ 1 đến 2 giờ
                    const lastFedTime = new Date(Date.now() + randomHours * 60 * 60 * 1000).toISOString(); // Cộng thêm giờ

                    const newPet = new Pet({
                      owner_id: userModel._id,
                      name: petName,
                      exp: 0,
                      type: typePet,
                      level: 1,
                      lastFedTime: lastFedTime,
                      favoriteFood: FAVORITE_FOODS[Math.floor(Math.random() * FAVORITE_FOODS.length)], // Chọn ngẫu nhiên
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    });
                    const pet = await newPet.save();
                    userModel.isFreePet = false;
                    await userModel.save();

                    //data user
                    infoUser = {
                      email: userModel.email,
                      isFreePet: userModel.isFreePet,
                      cryptoToken: userModel.cryptoToken,
                      videoViewsToday: userModel.videoViewsToday,
                      numberPetVideoReward: userModel.numberPetVideoReward,
                    };

                    //data pet
                    infoPetNew = {
                      _id: pet._id,
                      owner_id: pet.owner_id,
                      level: newPet.level,
                      name: newPet.name,
                      exp: newPet.exp,
                      type: newPet.type,
                      lastFedTime: newPet.lastFedTime,
                      favoriteFood: newPet.favoriteFood,
                      createdAt: newPet.createdAt,
                    };
                  } else {
                    statusSelected = false;
                    messageSelected = "Bạn đã hết lượt nhận Pet miễn phí :(";
                  }
                } else {
                  statusSelected = false;
                  messageSelected = "Bạn đã hết lượt nhận Pet miễn phí :(";
                }
              } else {
                if (userModel.numberPetVideoReward < 3) {
                  if (getPetReceivedVideoRewardByName(typePet) != null) {
                    const randomHours = Math.floor(Math.random() * 2) + 1; // Random từ 1 đến 2 giờ
                    const lastFedTime = new Date(Date.now() + randomHours * 60 * 60 * 1000).toISOString(); // Cộng thêm giờ

                    const newPet = new Pet({
                      owner_id: userModel._id,
                      name: getPetReceivedVideoRewardByName(typePet).name,
                      exp: 0,
                      type: typePet,
                      level: 1,
                      lastFedTime: lastFedTime,
                      favoriteFood: FAVORITE_FOODS[Math.floor(Math.random() * FAVORITE_FOODS.length)], // Chọn ngẫu nhiên
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    });
                    const pet = await newPet.save();
                    userModel.numberPetVideoReward += 1;
                    await userModel.save();

                    //data user
                    infoUser = {
                      email: userModel.email,
                      isFreePet: userModel.isFreePet,
                      cryptoToken: userModel.cryptoToken,
                      videoViewsToday: userModel.videoViewsToday,
                      numberPetVideoReward: userModel.numberPetVideoReward,
                    };

                    //data pet
                    infoPetNew = {
                      _id: pet._id,
                      owner_id: pet.owner_id,
                      level: newPet.level,
                      name: newPet.name,
                      exp: newPet.exp,
                      type: newPet.type,
                      lastFedTime: newPet.lastFedTime,
                      favoriteFood: newPet.favoriteFood,
                      createdAt: newPet.createdAt,
                    };
                  }
                } else {
                  statusSelected = false;
                  messageSelected = "Tài khoản đã đủ số lượng pet được nhận từ xem quảng cáo rồi";
                }
              }
            } else {
              statusSelected = false;
              messageSelected = "Chọn pet thất bại do thông tin tài khoản hoặc mật khẩu không chính xác!";
            }
          } else {
            statusSelected = false;
            messageSelected = "Tài khoản chưa được kích hoạt, vui lòng liên hệ admin lt10b10@gmail.com để biết thêm chi tiết!";
          }
        } else {
          statusSelected = false;
          messageSelected = "Tài khoản không tồn tại!";
        }
      } else {
        statusSelected = false;
        messageSelected = "Phiên bản hiện tại không phù hợp, vui lòng cập nhật phiên bản mới bạn nhé <3";
      }

      let data = {
        statusSelected: statusSelected,
        messageSelected: messageSelected,
        infoUser: infoUser,
        infoPetNew: infoPetNew,
      };
      //console.log(data);

      return callback(null, data);
    } catch (e) {
      console.log("Lỗi: " + e);
    }
  },
  //client cho pet ăn
  async sendFoodToPet(params, callback) {
    try {
      //user
      const email = params.email;
      const password = params.password;
      //pet
      const userVersion = params.version;
      const petID = params.petID;

      let foodPet = null;
      let infoPet = null;

      let statusSendFood = true;
      let messageSendFood = "Cho pet ăn thành công!";

      //Check version
      if (userVersion == MONGO_DB_CONFIG.SERVER_VERSION) {
        //Find email user
        const userModel = await User.findOne({ email: email });
        //tồn tại user này
        if (userModel != null) {
          //trạng thái user đã kích họat
          if (userModel.status == "active") {
            //trùng mật khẩu
            if (password == userModel.password) {
              //Tìm pet với id từ client
              const petFind = await Pet.findOne({ owner_id: userModel._id, _id: petID });
              const isFoodPet = await FoodPet.findOne({ owner_id: userModel._id });
              if (petFind) {
                infoPet = petFind;
                if (isFoodPet) {
                  //Check thời gian đói
                  if (Date.now() >= new Date(petFind.lastFedTime).getTime()) {
                    const foodIndex = isFoodPet.foods.findIndex((food) => food.name === petFind.favoriteFood && food.qty >= 1);
                    //Có món ăn mà pet yêu cầu và đủ số lượng
                    if (foodIndex !== -1) {
                      const randomHours = Math.floor(Math.random() * 2) + 1; // Random từ 1 đến 2 giờ
                      const lastFedTime = new Date(Date.now() + randomHours * 60 * 60 * 1000).toISOString(); // Cộng thêm giờ
                      isFoodPet.foods[foodIndex].qty -= 1; // -1 qty food
                      petFind.exp += getFoodByName(petFind.favoriteFood)?.exp ?? 0; // + exp
                      (petFind.favoriteFood = SELECTED_RECEIVED_FOODS[Math.floor(Math.random() * SELECTED_RECEIVED_FOODS.length)].name), // Chọn ngẫu nhiên
                        (petFind.lastFedTime = lastFedTime);
                      await isFoodPet.save();
                      await petFind.save();
                    } else {
                      statusSendFood = false;
                      messageSendFood = "Thức ăn không đủ số lượng hoặc không tìm thấy";
                    }
                  } else {
                    statusSendFood = false;
                    messageSendFood = "Pet chưa đói nên không cần cho ăn đâu";
                  }
                  foodPet = isFoodPet;
                }
              } else {
                statusSendFood = false;
                messageSendFood = "Cho ăn thất bại do không có Pet này";
              }
            } else {
              statusSendFood = false;
              messageSendFood = "Thất bại do thông tin tài khoản hoặc mật khẩu không chính xác!";
            }
          } else {
            statusSendFood = false;
            messageSendFood = "Tài khoản chưa được kích hoạt, vui lòng liên hệ admin lt10b10@gmail.com để biết thêm chi tiết!";
          }
        } else {
          statusSendFood = false;
          messageSendFood = "Tài khoản không tồn tại!";
        }
      } else {
        statusSendFood = false;
        messageSendFood = "Phiên bản hiện tại không phù hợp, vui lòng cập nhật phiên bản mới bạn nhé <3";
      }

      let data = {
        statusSendFood: statusSendFood,
        messageSendFood: messageSendFood,
        foodPet: foodPet,
        infoPet: infoPet,
      };
      //console.log(data);

      return callback(null, data);
    } catch (e) {
      console.log("Lỗi: " + e);
    }
  },
};

export default PetServices;
