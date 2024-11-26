import mongoose from 'mongoose'

const {Schema} = mongoose

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: 0
    },
    image: {
        type: String,
        required: [true, "Image is required"]
    },
    category: {
        type: String,
        required: [true, "Category is required"]
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const Product = mongoose.model('Product', productSchema)

export default Product