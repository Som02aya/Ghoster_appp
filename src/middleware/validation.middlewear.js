import joi from "joi"
import { signup } from "../modules/auth/auth.validation.js"
import { login } from "../modules/auth/auth.validation.js"
export const validation = (schema) => {
  return (req, res, next) => {

    const validationArray = [];

    if (schema.body) {
      validationArray.push(
        schema.body.validate(req.body)
      );
    }

    if (schema.query) {
      validationArray.push(
        schema.query.validate(req.query)
      );
    }

    if (schema.params) {
      validationArray.push(
        schema.params.validate(req.params)
      );
    }

    for (const result of validationArray) {
      if (result.error) {
        return res.json({
          message: result.error.details[0].message
        });
      }
    }

    next();
  };
};