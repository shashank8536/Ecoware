import jwt from 'jsonwebtoken'

export const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'ecoware_jwt_super_secret_key_member3_2026',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  )
}

export default generateToken
