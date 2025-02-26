import { StringValue } from '../types/jwt'

export const jwtConfig: {
  secret: string | undefined
  expiresIn: StringValue | undefined
} = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN as StringValue | undefined,
}

export const cryptoConfig = {
  saltRounds: Number(process.env.SALT_ROUNDS),
}
