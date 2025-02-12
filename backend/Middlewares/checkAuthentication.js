const jwt=require("jsonwebtoken")
const userModel=require("../models/userModel")

const checkAuthentication=async(req,res,next)=>{
    const token=req.header("Authorization")
    try {
       const user=jwt.verify(token,process.env.TOKEN_SECRET)
       const person=await userModel.findOne({email:user.email})
       req.user=person
       next();
    } catch (error) {
        res.status(401).json({message:"token expired"})
    }
}


module.exports=checkAuthentication;