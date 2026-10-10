export const isValidJWT = (token: string | null) => {
    if (!token) return null

    const parts = token.split('.')
    if (parts.length != 3) return false

    try {
        parts.forEach((part) => {
            Buffer.from(part, 'base64').toString('utf-8')
        })
        return true
    } catch {
        return false
    }
}
