import { checkSchema } from 'express-validator'

export default checkSchema({
    firstName: {
        trim: true,
        notEmpty: true,
        errorMessage: 'First Name is required !!',
    },
})
