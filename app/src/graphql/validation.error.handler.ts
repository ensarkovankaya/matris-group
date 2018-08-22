import { GraphQLError } from "graphql";
import { ArgumentValidationError } from "./validatable";

export const formatArgumentValidationError = (err: GraphQLError) => {
    const formattedError: { [key: string]: any } = {};

    formattedError.message = err.message;
    formattedError.locations = err.locations;
    formattedError.path = err.path;

    if (err.originalError instanceof ArgumentValidationError) {
        formattedError.validationErrors = err.originalError.errors;
    }

    return formattedError;
};
