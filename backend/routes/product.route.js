import express from 'express'
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js'
import { getAllProducts, getFeaturedProducts, createProduct } from '../controllers/product.controller.js'

const router = express.Router()

router.get('/', protectRoute, adminRoute, getAllProducts)
router.get('/featured', getFeaturedProducts)
router.post('/createProduct', protectRoute, adminRoute, createProduct)

export default router