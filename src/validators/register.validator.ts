import { checkSchema } from 'express-validator'

export default checkSchema({
    firstName: {
        trim: true,
        notEmpty: {
            errorMessage: 'First name is required.',
        },
    },
    lastName: {
        trim: true,
        notEmpty: {
            errorMessage: 'last name is required.',
        },
    },
})
