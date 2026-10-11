import { checkSchema } from 'express-validator'

export default checkSchema({
    email: {
        trim: true,
        notEmpty: {
            errorMessage: 'Email is required',
        },
        isEmail: {
            errorMessage: 'Email is not valid',
        },
    },

    password: {
        trim: true,
        notEmpty: {
            errorMessage: 'Password is required',
        },
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password should be at least 8 chars',
        },
    },
})
