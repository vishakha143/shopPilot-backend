import jwt from 'jsonwebtoken'

const adminAuth = async (req,res,next) => {
    try {
        let {token} = req.cookies

    if(!token) {
        return res.status(401).json({message:"Not Authorized Login Again"})
    }
    
    let verifyToken =  jwt.verify(token,process.env.JWT_SECRET)

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
    if (!verifyToken || verifyToken.role !== "admin" || verifyToken.email?.toLowerCase() !== adminEmail) {
         return res.status(403).json({message:"Admin access is required"})
    }
    req.adminEmail = adminEmail

    next()
        
    } catch (error) {
           console.log("adminAuth error")
    return res.status(500).json({message:`adminAuth error ${error}`})
    }


}

export default adminAuth

