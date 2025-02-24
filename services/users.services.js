import User from "../models/user.model.js";
import Pet from "../models/pet.model.js";
import FoodPet from "../models/food_pet.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { MONGO_DB_CONFIG } from "../config/app.config.js";

const UserServices = {
  //Register account user with email + password
  async register(params, callback) {
    const email = params.email;
    const version = params.version;
    let password = params.passWord;
    const fullName = params.fullName;

    let msgRegister = "Tạo tài khoản thành công, cảm ơn bạn đã sử dụng ứng dụng <3";
    let statusRegister = true;
    //Check version client + server
    if (version == MONGO_DB_CONFIG.SERVER_VERSION) {
      let isUserExist = await User.findOne({ email: email });
      if (isUserExist) {
        msgRegister = "Tạo tài khoản thất bại do email đã tồn tại";
        statusRegister = false;
      } else {
        const salt = bcrypt.genSaltSync(10);
        password = bcrypt.hashSync(password, salt);
        //USER
        const newUser = new User({
          fullName: fullName,
          email: email,
          password: password,
          cryptoToken: 10000,
          videoViewsToday: 0,
          numberPetVideoReward: 0,
          numberSeeVideoReward: 0,
          status: "active",
          isFreePet: true,
        });

        const responseUser = await newUser.save();
        //FOOD_PET
        const newFoodPet = new FoodPet({
          owner_id: responseUser._id,
          foodClaimed: Date.now(),
          foods: [
            { name: "Táo", qty: 0, exp: 10 },
            { name: "Bánh mì", qty: 0, exp: 15 },
            { name: "Cà rốt", qty: 0, exp: 8 },
          ],
        });

        const responseFoodPet = await newFoodPet.save();
      }
    } else {
      msgRegister = "Phiên bản hiện tại không phù hợp, vui lòng cập nhật phiên bản mới bạn nhé <3";
      statusRegister = false;
    }

    let data = {
      msgRegister: msgRegister,
      statusRegister: statusRegister,
    };
    return callback(null, data);
  },

  //Login account user with email + password
  async login(params, callback) {
    const email = params.email;
    const password = params.password;
    const version = params.version;
    let infoUser = null;
    let infoPet = null;
    let foodPet = null;
    //Find email user
    const userModel = await User.findOne({ email: email });

    let statusLogin = true;
    let messageLogin = "Đăng nhập thành công";

    if (version != MONGO_DB_CONFIG.SERVER_VERSION) {
      statusLogin = false;
      messageLogin = "Phiên bản hiện tại không phù hợp, vui lòng cập nhật phiên bản mới bạn nhé <3";
    } else {
      if (!email.includes("@")) {
        statusLogin = false;
        messageLogin = "Đăng nhập thất bại, email không đúng định dạng!";
      } else {
        if (userModel != null) {
          if (userModel.status == "active") {
            //trạng thái user đã kích họat
            if (bcrypt.compareSync(password, userModel.password)) {
              //Info user
              infoUser = {
                password: userModel.password,
                userId: userModel._id,
                fullName: userModel.fullName,
                email: userModel.email,
                cryptoToken: userModel.cryptoToken,
                videoViewsToday: userModel.videoViewsToday,
                numberPetVideoReward: userModel.numberPetVideoReward,
                numberSeeVideoReward: userModel.numberSeeVideoReward,
                isFreePet: userModel.isFreePet,
              };

              //Info list pet
              const listPet = await Pet.find({
                owner_id: userModel._id,
              });

              if (listPet) {
                infoPet = listPet;
              }

              //Info data food pet
              const dataFoodPet = await FoodPet.findOne({
                owner_id: userModel._id,
              });

              if (dataFoodPet) {
                foodPet = dataFoodPet;
              }
            } else {
              statusLogin = false;
              messageLogin = "Đăng nhập thất bại, thông tin tài khoản hoặc mật khẩu không chính xác!";
            }
          } else {
            statusLogin = false;
            messageLogin = "Tài khoản chưa được kích hoạt, vui lòng liên hệ admin lt10b10@gmail.com để biết thêm chi tiết!";
          }
        } else {
          statusLogin = false;
          messageLogin = "Tài khoản không tồn tại!";
        }
      }
    }

    let data = {
      statusLogin: statusLogin,
      messageLogin: messageLogin,
      infoUser: infoUser,
      infoPet: infoPet,
      foodPet: foodPet,
    };

    return callback(null, data);
  },

  //Deleted account
  async deleted(params, callback) {
    const email = params.email;
    const version = params.version;
    let password = params.password;

    let msgDeleted = "Xóa tài khoản thành công, cảm ơn bạn đã sử dụng ứng dụng";
    let statusDeleted = true;
    //Check version client + server
    if (version == MONGO_DB_CONFIG.SERVER_VERSION) {
      let isUserExist = await User.findOne({ 'email': email, 'password': password});
      if (isUserExist) {
        isUserExist.status = 'deleted';
        await isUserExist.save();
      } else {
        msgDeleted = "Tài khoản hoặc mật khẩu không chính xác";
        statusDeleted = false;
      }
    } else {
      msgDeleted = "Phiên bản hiện tại không phù hợp, vui lòng cập nhật phiên bản mới bạn nhé <3";
      statusDeleted = false;
    }

    let data = {
      msgDeleted: msgDeleted,
      statusDeleted: statusDeleted,
    };
    return callback(null, data);
  },

  //Reset VideoViewsToday của user hàng ngày
  async resetVideoViewsTodayUser() {
    try {
      const result = await User.updateMany({}, { $set: { videoViewsToday: 0 } });
      console.log(`✅ Đã reset VideoViewsToday của ${result.modifiedCount} users thành công!`);
    } catch (error) {
      console.log("❌ Lỗi khi reset VideoViewsToday:", error);
    }
  },

};

export default UserServices;
