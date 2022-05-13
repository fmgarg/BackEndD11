# Desafío "Formulario LogIn". 

Este proyecto se encuentra realizado utilizando JS, NodeJS, express, express-handlebars, express-session, sockets.io y bootstrap, entre otras.

Al ingresar a la ruta localhost:8080 te vas a encontrar con el formulario de login.
Todos los usuarios tienen acceso a la ruta '/home' donde se encuentran las vistas del socket de  productos y mensajes. 
Al hacer login se puede ver el nombre del user en el margen superior de la pagina junto a un boton de logout. El desde ahí puede agregar productos y mensajes en el chat.

Si se agota la sesión la página se recarga (usando window.location.reload del lado del front) y vuelve al login.

Si el user hace un logout, visualiza durante 2 segundos el mensaje de despedida y es redirigido a la ruta del login (se utilizó un setTimeout con window.location hacia la ruta '/login')

## Consideraciones generales

El proyecto corresponde al desafío de la clase 24 del curso de Back End en Coderhouse.

El nombre del usuario en los saludos NO esta hardcodeado sino que se obtiene a traves de socket desde una variable pusheada con req.session.user.

#### `Acerca de mi`

Mi nombre es Francisco González, tengo 42 años y en la actualidad me encuentro estudiando en Coder para ser desarrollador Full Stack. 

Me pueden contactar a través de mi email: [fmgarg@gmail.com](mailto:fmgarg@gmail.com) y/o por whatsapp: +549 11 5412 2848.