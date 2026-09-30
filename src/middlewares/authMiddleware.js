//VERIFICACION DE AUTORIZACION
const authMiddleware = (req, res, next) => {
  //Comprobamos que el usuario ha iniciado sesion y su rol es Admin
  if (req.user && req.user.rol === 'Admin') {
    next();
  } else {
    return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de administrador." });
  }
};

//EXPORTAMOS MODULOS
module.exports = {authMiddleware};