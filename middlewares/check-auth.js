import jwt from "jsonwebtoken";


export default class checkAuth {

  async checkMe() {
    console.log('hi friendss')
    return 'yea'
  }

/*module.exports = (req, res, next) => {
  try {
    console.log(req.headers)
    const token = req.headers.authorization.split(" ")[1];
    console.log(token)
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    req.userData = { email: decodedToken.email, userId: decodedToken.id };
    next();
  } catch (error) {
    res.status(401).json({ message: "Auth failed!" });
  }
};*/

}
