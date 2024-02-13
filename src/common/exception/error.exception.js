const ErrorExceptionHandler = (app) => {
    app.use((error, req, res, next) => {
        const status = error.status || 500;
        const message = error.message || "Internal Server Error";
        res.status(status).send({
            status,
            message,
        });
    });
};

module.exports = ErrorExceptionHandler;
