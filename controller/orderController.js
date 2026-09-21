import Order from "../model/orderModel.js";
import User from "../model/userModel.js";
import razorpay from 'razorpay'
import dotenv from 'dotenv'
import crypto from 'crypto'
import Product from '../model/productModel.js'
dotenv.config()
const currency = 'inr'
const DELIVERY_FEE = 40
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

const buildOrderItems = async (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('An order must contain at least one item')
    }

    let amount = DELIVERY_FEE
    const validatedItems = []

    for (const item of items) {
        const quantity = Number(item?.quantity)
        if (!item?._id || !Number.isSafeInteger(quantity) || quantity < 1) {
            throw new Error('Invalid order item')
        }

        const product = await Product.findById(item._id)
        if (!product || !product.sizes.includes(item.size)) {
            throw new Error('Product or selected size is unavailable')
        }

        const productSnapshot = product.toObject()
        validatedItems.push({ ...productSnapshot, size: item.size, quantity })
        amount += product.price * quantity
    }

    return { items: validatedItems, amount }
}

// for User
export const placeOrder = async (req,res) => {

     try {
         const {items , address} = req.body;
         const userId = req.userId;
         const validatedOrder = await buildOrderItems(items)
         const orderData = {
            items: validatedOrder.items,
            amount: validatedOrder.amount,
            userId,
            address,
            paymentMethod:'COD',
            payment:false,
            date: Date.now()
         }

         const newOrder = new Order(orderData)
         await newOrder.save()

         await User.findByIdAndUpdate(userId,{cartData:{}})

         return res.status(201).json({message:'Order Place'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:'Order Place error'})
    }
    
}


export const placeOrderRazorpay = async (req,res) => {
    try {
        
         const {items , address} = req.body;
         const userId = req.userId;
         const validatedOrder = await buildOrderItems(items)
         const orderData = {
            items: validatedOrder.items,
            amount: validatedOrder.amount,
            userId,
            address,
            paymentMethod:'Razorpay',
            payment:false,
            date: Date.now()
         }

         const newOrder = new Order(orderData)
         await newOrder.save()

         const options = {
            amount:validatedOrder.amount * 100,
            currency: currency.toUpperCase(),
            receipt : newOrder._id.toString()
         }
         await razorpayInstance.orders.create(options, (error,order)=>{
            if(error) {
                console.log(error)
                return res.status(500).json(error)
            }
            res.status(200).json(order)
         })
    } catch (error) {
        console.log(error)
        res.status(500).json({message:error.message
            })
    }
}


export const verifyRazorpay = async (req,res) =>{
    try {
        const userId = req.userId
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Incomplete payment verification data' })
        }

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex')
        if (
            expectedSignature.length !== razorpay_signature.length ||
            !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature))
        ) {
            return res.status(400).json({ message: 'Invalid payment signature' })
        }

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        const localOrder = await Order.findById(orderInfo.receipt)
        if (!localOrder || localOrder.userId !== userId) {
            return res.status(403).json({ message: 'Payment does not belong to this user' })
        }
        if(orderInfo.status === 'paid'){
            await Order.findByIdAndUpdate(orderInfo.receipt,{payment:true});
            await User.findByIdAndUpdate(userId , {cartData:{}})
            res.status(200).json({message:'Payment Successful'
            })
        }
        else{
            res.json({message:'Payment Failed'
            })
        }
    } catch (error) {
        console.log(error)
         res.status(500).json({message:error.message
            })
    }
}






export const userOrders = async (req,res) => {
      try {
        const userId = req.userId;
        const orders = await Order.find({userId})
        return res.status(200).json(orders)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"userOrders error"})
    }
    
}




//for Admin



    
export const allOrders = async (req,res) => {
    try {
        const orders = await Order.find({})
        res.status(200).json(orders)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"adminAllOrders error"})
        
    }
    
}
    
export const updateStatus = async (req,res) => {
    
try {
    const {orderId , status} = req.body

    await Order.findByIdAndUpdate(orderId , { status })
    return res.status(201).json({message:'Status Updated'})
} catch (error) {
     return res.status(500).json({message:error.message
            })
}
}

