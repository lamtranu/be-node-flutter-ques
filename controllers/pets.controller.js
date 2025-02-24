import PetServices from "../services/pets.services.js";

const PetController = {
    //Chọn nhận pet (free hoặc xem quảng cáo)
    selectedReceivedPet: (req, res, next) => {
        //user
        const email = req.body.email;
        const password = req.body.password;
        //pet selected
        const typedSelectedReceivedPet = req.body.typedSelectedReceivedPet;
        const typePet = req.body.typePet;
        const version = req.body.version;

        let model = {
            email: email,
            password: password,
            typedSelectedReceivedPet: typedSelectedReceivedPet,
            typePet: typePet,
            version: version,
        }
        //console.log(model);
        PetServices.selectedReceivedPet(model, (error, results) => {
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
    //Cho pet ăn
    sendFoodToPet: (req, res, next) => {
        //user
        const email = req.body.email;
        const password = req.body.password;
        //pet 
        const petID = req.body.petID;
        const version = req.body.version;

        let model = {
            email: email,
            password: password,
            petID: petID,
            version: version,
        }
        //console.log(model);
        PetServices.sendFoodToPet(model, (error, results) => {
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

export default PetController;
