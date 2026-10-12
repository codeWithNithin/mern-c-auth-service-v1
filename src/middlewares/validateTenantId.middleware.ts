import createHttpError from 'http-errors'
import type { Request, Response, NextFunction } from 'express'

export const validateTenantId = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id } = req.params

    if (isNaN(Number(id))) {
        next(createHttpError(400, 'Invalid URL param.'))
        return
    }

    next()
}
