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
    email: {
        trim: true,
        notEmpty: {
            errorMessage: 'Email is required.',
        },
        isEmail: {
            errorMessage: 'Email must be valid',
        },
    },
})
