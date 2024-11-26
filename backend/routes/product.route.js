import express from 'express'
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js'
import { getAllProducts, getFeaturedProducts } from '../controllers/product.controller.js'

const router = express.Router()

router.get('/', protectRoute, adminRoute, getAllProducts)
router.get('/featured', getFeaturedProducts)

export default router