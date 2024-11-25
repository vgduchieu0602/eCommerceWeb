import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import { redis } from '../lib/redis.js'

const generateToken = (userId) => {
    //accessToken sử dụng để xác thực người dùng và ủy quyền truy cập vào các tài nguyên bảo mật
    //tạo ra token có thời hạn 15p và chứa thông tin userId
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m'
    })

    //refreshToken làm mới accessToken khi hết hạn, giúp hệ thống cấp quyền truy cập tiếp mà không cần phải đăng nhập lại
    //tạo ra token có thời hạn 7 ngày và chứa thông tin userId
    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d'
    })

    return { accessToken, refreshToken }
}

//lưu trữ token vào redis(một hệ thống lưu trữ dữ liệu phân tán)
const storeRefreshToken = async(userId, refreshToken) => {
    await redis.set(`refresh_token_${userId}`, refreshToken, "EX", 7*24*60*60)
}

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, //ngăn chặn XSS không cho phép JS truy cập cookie này
        secure: process.env.NODE_ENV === "production", //chỉ cho phép cookie được truyền qua HTTPs khi ở môi trường production
        sameSite: "strict", //ngăn chặn CSRF chỉ cho phép cookie gửi cùng yêu cầu từ cùng 1 origin
        maxAge: 15 * 60 * 1000, //15 minutes
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, //ngăn chặn XSS không cho phép JS truy cập cookie này
        secure: process.env.NODE_ENV === "production", //chỉ cho phép cookie được truyền qua HTTPs khi ở môi trường production
        sameSite: "strict", //ngăn chặn CSRF chỉ cho phép cookie gửi cùng yêu cầu từ cùng 1 origin
        maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    })
}

export const register = async (req, res) => {
    const {name, email, password} = req.body
    try {
        const userExists = await User.findOne({ email })

        if(userExists) {
            return res.status(400).json({message:'User already exists'})
        }

        const user = await User.create({
            name,
            email,
            password
        })

        //Authenticate
        const {accessToken, refreshToken} = generateToken(user._id)
        await storeRefreshToken(user._id, refreshToken)

        setCookies(res, accessToken, refreshToken)

        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }, 
            message:'User registered successfully'
        })
    } catch (error) {
        console.log(`Error in register: ${error.message}`)
        res
            .status(500)
            .json({message:error.message})
    }
}

export const login = async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})

        if(user && (await user.comparePassword(password))) {
            const {accessToken, refreshToken} = generateToken(user._id)

            await storeRefreshToken(user._id, refreshToken)
            setCookies(res, accessToken, refreshToken)

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            })
        } else {
            res.status(401).json({message: "Invalid email or password"})
        }
    } catch (error) {
        console.log(`Error in login: ${error.message}`)
        res
            .status(500)
            .json({message: error.message})
    }
}

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if(refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            await redis.del(`refresh_token: ${decoded.userId}`)
        }

        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")

        res.status(200).json({message: "Logout successfully"})
    } catch (error) {
        console.log(`Error in logout: ${error.message}`)
        res.status(500).json(`Error in logout: ${error.message}`)
    }
}