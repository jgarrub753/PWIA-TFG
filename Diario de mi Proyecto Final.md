## 20/03/2025
He instalado Ollama desde su página web para poder usar la IA de Gemma en su versión 2b. 
Para ello, he tenido que entrar al CMD de mi equipo, y ya con Ollama instalado he ejecutado el comando `ollama run gemma:2b`. 
Ya puedo usar su IA para seguir mi proyecto. Lo siguiente será buscar información detallada sobre los equipos de LaLiga. Para facilitar el uso de estos, usaremos una API.
## 23/03/2025
Estoy intentando no tener que usar el cmd para utilizar Gemma a través de un archivo app.py
## 24/03/2025
He conseguido instalar Gemma en mi equipo y estoy intentando de poder usarla sin el CMD a base de python. Hoy he conseguido crear una página que me dejaba mandar el prompt pero daba error en la respuesta.
1º error: tenía que usar forzadamente al principo el CMD, ya que solo había instalado Ollama y no tenía instlado Gemma en mi equipo.
## 25/03/2025
He intentado crear una página con python y HTML para escribirle un prompt y que la respuesta sea dada por Gemma, pero no lo he conseguido ya que no se configura Gemma con la página.
## 26/03/2025
He conseguido crear la página, pero las respuesta con Gemma no he conseguido optimizarla, ya que da respuestas raras o errores.
## 27/03/2025
He conseguido optimizar un poco la página y estoy buscando información y probando cuál es la mejor API futbolística para mi proyecto.
## 28/03/2025
He conseguido instalar Gemma bien e integrarla en una página. He creado los archivos de la página: index.html, style.css y app.py
## 29/03/2025
Estoy buscando API de fútbol para ver cual se adapta mejor a la finalidad de mi página.
## 31/03/2025
Me he decantado por usar API Football, ya que se adapta perfectamente a las necesidades de mi página web y he conseguido insertarla a través de mi clave API.
Ya he conseguido que me de resultado de partidos anteriores y algún pronóstico, pero hay que pulirlo para que de mejores datos y resultados de partidos.
## 01/04/2025
He conseguido que me de la probabilidad de que empate, gane o pierda un equipo. También me devuelve los datos de los partidos de local y visitante. Por último, devuelve los goles a favor y en contra jugando como local y como visitante.
Errores: no encontraba a veces los equipos o los porcentajes ponía lo mismo para todos los resultados.
## 05/04/2025
He conseguido hacer una tabla que me da la probabilidad de victoria, derrota y empate. Y otras dos tablas en las cuales me da la información en la que se basa para dar dichos pronósticos.
Estas tablas llevan detalladamente la información divididas en temporadas y dentro de estas están las victorias, derrotas, empates, goles a favor y goles en contra.
## 07/04/2025
He seguido entenando la IA y he cambiado el CSS para hacer la página más vistosa.
Errores: he cambiado el codigo app.py porque siempre me daba al equipo visitante como ganador, esto se debía a que no recogía bien las estadísticas del equipo visitante y lo ponía como ganador con un porcentaje
aleatorio. Después del cambio en el código me da un pronóstico de partido más coherente.
## 08/04/2025
He editado el css metiendo una foto de background. He insertado un botón para borrar las predicciones y lo que haya escrito para que el usuario no lo tenga que hacer manualmente.
## 09/04/2025
He metido un aviso para cuando el usuario meta algo que no esta separado por una ",".
