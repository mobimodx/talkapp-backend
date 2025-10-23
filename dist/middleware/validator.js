"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const errors_1 = require("../utils/errors");
const validateRequest = (schema, target = 'body') => {
    return (req, _res, next) => {
        try {
            const dataToValidate = req[target];
            const { error, value } = schema.validate(dataToValidate, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const errors = error.details.map(detail => detail.message).join(', ');
                throw new errors_1.ValidationError(errors);
            }
            req[target] = value;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validator.js.map