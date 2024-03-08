const findUniqueField = (message) =>
    message.split("{")[1].split("}")[0].replace(/"/g, "").split(":").slice(-1)[0].trim();

module.exports = {
    findUniqueField,
};
