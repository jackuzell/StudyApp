const jwt = require('jsonwebtoken');

module.exports = function(req , res, next){
    // Get token out of header (supports x-auth-token or Authorization Bearer)
    let token = req.header('x-auth-token');
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if it exists
    if(!token){
        return res.status(401).json({message:'No token, authorization denied'});
    }

    //Verify token
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; //{id: user.id}
        next();
    }catch(err){
        res.status(401).json({message:'Token is not valid '});
    }
};