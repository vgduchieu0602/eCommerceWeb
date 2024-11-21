import User from '../models/user.model.js'

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

        res.status(201).json({user, message:'User registered successfully'})
    } catch (error) {
        res
            .status(500)
            .json({message:error.message})
    }
}

export const login = async (req, res) => {
    res.send("Sign up router")
}

export const logout = async (req, res) => {
    res.send("Sign up router")
}