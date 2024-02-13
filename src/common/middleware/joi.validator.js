const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.validateAsync(req.body);

            next();
        } catch (error) {
            if (error.isJoi) {
                const errUnknown = {};
                const errDetails = error.details[0];

                errUnknown[errDetails.context.key] = errDetails.message.replace(/"/g, "");
                return res.status(400).json(error);
            }
            return res.status(500).json(error);
        }
    };
};

module.exports = validate;
