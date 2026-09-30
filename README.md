# Planificador de viajes en grupo

[comment]: # (Incluir una breve descripción del proyecto en una o dos frases como mucho)

Aplicación web basada en Express.js que permite a los usuarios crear viajes colaborativos, proponer actividades, gestionar las reservas de alojamientos, asignar responsables a cada tarea y llevar un presupuesto común. Se podrán registrar gastos compartidos con detalle.

[comment]: # (Incluir un GIF o una captura de pantalla de la página principal del proyecto. Utilizar el directorio docs para almacenar dicha imagen)

![Funcionamiento de la aplicación web](docs/overview.png)

## Tabla de contenidos

* [Características](#características)
  * [Tecnologías](#tecnologías)
  * [Roles y Permisos](#roles-y-permisos)
* [Uso de la aplicación](#uso-de-la-aplicación)
  * [Instalación](#instalación)
  * [Configuración](#configuración)
  * [Ejecución](#ejecución)
* [Despliegue](#despliegue)
* [División del trabajo](#división-del-trabajo)

### Características

[comment]: # (Enumerar las principales características que ofrece la aplicación web, siguiendo el formato:)

* **Gestión colaborativa de viajes**: Creación, edición y administración de itinerarios grupales accesibles para múltiples usuarios.
* **Control de actividades**: Propuesta y planificación de eventos, excursiones o visitas con control de cupos máximos y cronograma por fechas.
* **Inscripción semántica a eventos**: Sistema dinámico para que los clientes se apunten o cancelen su plaza en actividades específicas en tiempo real.
* **Organización y delegación de tareas**: Tablón de responsabilidades con estados variables ("Pendiente" / "Hecho") filtrables por viaje y usuario.
* **Auditoría de alojamientos y estancias**: Módulo centralizado para coordinar las reservas hoteleras y detalles de pernoctación del grupo.
* **Presupuesto común y reparto de gastos**: Registro pormenorizado de costes compartidos y balances de cuentas entre los miembros del viaje.
* **Control de accesos por roles**: Separación estricta de interfaces y permisos entre perfiles de Administrador y Cliente.

### Tecnologías

[comment]: # (Enumerar todas las APIs o librerías externas utilizadas en el proyecto pero sin mencionar las APIs DOM y fetch, Express ni Mongoose. El formato será como sigue:)

Este proyecto ha sido desarrollado utilizando:

* [Express](https://expressjs.com/) - Framework web para el backend
* [Mongoose](https://mongoosejs.com/) - ODM para trabajar con una base de datos MongoDB
* [Pico.css](https://picocss.com/) - Framework CSS minimalista y semántico para el diseño de la interfaz
* [FontAwesome](https://fontawesome.com/) - Biblioteca de iconos vectoriales para la maquetación visual
* [Dotenv](https://www.npmjs.com/package/dotenv) - Módulo para la carga y gestión de variables de entorno de forma segura
* [Cookie-parser](https://www.npmjs.com/package/cookie-parser) - Middleware para el almacenamiento y lectura de credenciales de sesión en el navegador

### Roles y Permisos

El sistema implementa dos niveles de acceso mediante JSON Web Tokens (JWT):

* **Usuario Cliente (Estándar):** Puede crear viajes, unirse a viajes existentes mediante código, proponer gastos, gestionar sus propias reservas y marcar tareas como completadas. 
  * **Nota importante:** Para inscribirse en las actividades, el usuario debe acceder obligatoriamente desde el panel interno de un viaje específico para garantizar la correcta vinculación de la reserva.
* **Usuario Administrador:** Además de todos los permisos estándar, el rol `Admin` tiene privilegios exclusivos protegidos por middleware para la gestión del sistema:
  * **Catálogo de Alojamientos:** Control total sobre la oferta hotelera. Solo los administradores pueden crear (`POST`), actualizar (`PUT`) y eliminar (`DELETE`) alojamientos del sistema.
  * **Catálogo de Actividades:** Gestión centralizada de la base de datos de actividades. Posee permisos exclusivos para dar de alta nuevas actividades, modificar sus detalles o cupos, y eliminarlas del sistema. Para que una actividad quede vinculada automáticamente a un itinerario, el administrador debe crearla desde el panel interno del viaje correspondiente.
  * **Auditoría Global:** Capacidad para visualizar todos los viajes creados en la plataforma, incluyendo el desglose de sus gastos, tareas y miembros, sin necesidad de ser un usuario apuntado.
  * **Gestión de Tareas:** Permiso para crear y supervisar tareas en cualquier viaje, facilitando la coordinación global del sistema.


## Uso de la aplicación

[comment]: # (Describir cómo instalar, configurar, ejecutar y desplegar la aplicación web. El formato será como sigue:)

### Instalación

Clonar este repositorio y ejecutar desde el directorio raíz el siguiente comando para instalar las dependencias:

```bash
npm install
```
Por si aparece algún tipo de error durante la instalación del comando anterior, podemos ejecutar el siguiente comando para resolver cualquier conflico que haya podido suceder:
```bash
npm audit fix --force
```

[comment]: # (Si es necesario hacer alguna tarea más compleja, como por ejemplo compilar código SASS, indicar a continuación cómo se debería hacer. Este tipo de tareas deberán estar automatizadas con npm build)

Antes de desplegar la aplicación, es necesario generar el frontend utilizando el siguiente comando desde el directorio raíz:

```bash
npm build
```

### Configuración

[comment]: # (Enumerar todos los parámetros configurables de la aplicación web, sin incluir ningún dato sensible)

Crear un fichero `.env` en el directorio raíz que defina las siguientes variables de entorno:

```bash
# Puerto del servidor
WEBAPP_PORT=5500
#MongoDB
MONGO_URI=mongodb://root:12341234@database:27017/aw-final-grupo-a-1?authSource=admin
#JWT
JWT_SECRET=3fd278c53776b0b6f4309a3b97b440f370ddde8a3f5574e0f69de4c7de6507dfb9a2676add757e4d3b99a8d1047fe9e3b834
```

El token anterior se puede conseguir ejecutando el siguiente comando:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Ejecución

Para ejecutar la aplicación web, ejecutar el siguiente comando desde el directorio raíz:

```bash
npm run dev
```

## Despliegue

Para facilitar el despliegue de la aplicación web se ha contenerizado la misma mediante el uso de Docker. En el directorio `docker` se encuentran los recursos necesarios para crear la imagen y desplegar la aplicación web en este entorno.

Para desplegar la aplicación web completa por primera vez ejecutar el siguiente comando:

```bash
docker compose -f ./docker/docker-compose.yml up -d --build
```

Se podrá acceder a la aplicación web a través de la URL
```
localhost:5500/login.html
```

### Usuarios por defecto (Base de Datos inicial)
Para facilitar las pruebas y el uso inicial de la aplicación, la base de datos incluye un conjunto de usuarios predefinidos.
Todos los usuarios comparten la misma contraseña: "viajes1234"
| Rol     | Email                 | Contraseña     |
|--------|-----------------------|----------------|
| Admin   | admin@viajes.com      | viajes1234     |
| Cliente | cliente1@viajes.com   | viajes1234     |
| Cliente | cliente2@viajes.com   | viajes1234     |
| Cliente | cliente3@viajes.com   | viajes1234     |


## División del trabajo

[comment]: # (Rellenar la tabla con los nombres de los diferentes bloques, una breve descripción de los mismos y el alumno responsable)

|          Bloque         |                   Descripcion                  | Responsabilidad |
|:-----------------------:|:----------------------------------------------:|:---------------:|
| Usuarios                | Gestion de usuarios y permisos                 |    Compartida   |
| Gestión de Viajes       | Creación, edición y listado                    |      Pedro      |
| Actividades y Tareas    | Proponer actividades y crear tareas            |     Martín      |
| Alojamientos y Reservas | Gestionar las estancias                        |       Ana       |
| Presupuesto y Gastos    | Registrar los gastos compartidos               |      Sonia      |
