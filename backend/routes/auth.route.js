import express from 'express'

const router = express.Router()

import { register, login, logout } from '../controllers/auth.controller.js'

router.post('/signup', register)

router.post('/logout', logout)

router.post('/login', login)

export default router