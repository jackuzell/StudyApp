const jwt = require('jsonwebtoken');

module.exports = functions(req , resizeBy, next) {
    //Get token out of header
    const token = req.header('x-auth-token');

    //check if it exists
    if(!token){
        return res.status(401).json({message:'No token, authorization denied'});
    }

    //Verify token
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; //{id: user.id}
        next();
    }catch(err){
        res.status(401).json({message:'Token is not valid'});
    }
};