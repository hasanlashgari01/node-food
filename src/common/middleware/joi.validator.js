const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.validate(req.body);
            next();
        } catch (error) {
            if (error.isJoi) {
                console.log(error);
                const errUnknown = {};
                const errDetails = error.details[0];

                errUnknown[errDetails.context.key] = errDetails.context.label.replace(/"/g, "");
                return res.status(400).json(errUnknown);
            }
            return res.status(500).json(error);
        }
    };
};

module.exports = validate;
