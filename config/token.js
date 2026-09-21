import jwt from "jsonwebtoken"

export const genToken = async (userId) => {
   try {
    let token = await jwt.sign({userId, role: "user"} , process.env.JWT_SECRET , {expiresIn:"7d"})
    return token
   } catch (error) {
     console.log("token error")
   }

    
}
export const genToken1 = async (email) => {
   try {
    let token = await jwt.sign({email, role: "admin"} , process.env.JWT_SECRET , {expiresIn:"7d"})
    return token
   } catch (error) {
     console.log("token error")
   }

    
}

