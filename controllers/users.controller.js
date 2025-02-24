import UserServices from "../services/users.services.js";

const UserController = {
    //Register
    register: (req, res, next) => {
        const email = req.body.email;
        const fullName = req.body.fullName;
        const passWord = req.body.password;
        const version = req.body.version;
        let model = {
            email: email,
            fullName: fullName,
            passWord: passWord,
            version: version,
        }
        UserServices.register(model, (error, results) => {
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

    //Login
    login: (req, res, next) => {
        const email = req.body.email;
        const passWord = req.body.password;
        const version = req.body.version;
        let model = {
            email: email,
            password: passWord,
            version: version,
        }
        //console.log(model);
        UserServices.login(model, (error, results) => {
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

    //Deleted account
    deleted: (req, res, next) => {
        const email = req.body.email;
        const password = req.body.password;
        const version = req.body.version;
        let model = {
            email: email,
            password: password,
            version: version,
        }
        UserServices.deleted(model, (error, results) => {
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

export default UserController;
