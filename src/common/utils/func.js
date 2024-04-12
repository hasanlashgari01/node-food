const findUniqueField = (message) =>
    message.split("{")[1].split("}")[0].replace(/"/g, "").split(":").slice(-1)[0].trim();

const randomId = () => Math.random().toString(36).substring(2);

module.exports = {
    findUniqueField,
    randomId,
};
