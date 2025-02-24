import foodPetServices from "../services/foodPets.services.js";

const foodPetController = {
    //Chọn thức ăn nhận
    selectedReceiveFoodPet: (req, res, next) => {
        //user
        const email = req.body.email;
        const password = req.body.password;
        //food selected
        const nameFood = req.body.nameFood;
        const type = req.body.type;
        const version = req.body.version;

        let model = {
            email: email,
            password: password,
            nameFood: nameFood,
            type: type,
            version: version,
        }
        //console.log(model);
        foodPetServices.selectedReceiveFoodPet(model, (error, results) => {
            if (error) {
                return next(error);
            } else {
                return res.status(200).send({
                    message: "Register Success",
                    data: results,
                });
            }
        });
    },
}

export default foodPetController;
