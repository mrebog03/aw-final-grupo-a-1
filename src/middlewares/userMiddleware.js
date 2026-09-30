//IMPORTAMOS MODULOS
const JWTtokens = require("jsonwebtoken");

const userMiddleware = async (req, res, next) => {
  try {
    //Obtenemos el token de las cookies
    const token = req.cookies.JWTtokens;

    //Comprobamos si existe el token
    if (!token) {
      throw new Error("No existe el token, inicie sesion");
    }

    //Verificamos el token
    const tokenDecoded = JWTtokens.verify(token, process.env.JWT_SECRET);
    if (!tokenDecoded){
      throw new Error("Token invalido, inicie sesion de nuevo");
    }

    //Guarmos la infromacion del token
    req.user = {id: tokenDecoded.id, rol: tokenDecoded.rol};

    //Pasamos a la siguiente ruta
    next();

  } catch (error) {
    console.error(error.message);
    res.status(401).json({message: "No autorizado"});
  }
};

module.exports = {userMiddleware};