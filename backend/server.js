const http = require('http');
const app = require('./app');

const normalizePort = val => { // prend une valeur et la renvoie
  const port = parseInt(val, 10); 

  if (isNaN(port)) { // valeur d'origine
    return val;
  }
  if (port >= 0) { // nombre 
    return port;
  }
  return false; // nombre negatif
};
const port = normalizePort(process.env.PORT ||'4000'); // port défini ou 4000
app.set('port', port); // Définit le port de l'application

const errorHandler = error => { // gère les erreurs liées a l'écoute du serveur
  if (error.syscall !== 'listen') {
    throw error; // Si l'erreur n'est pas liée à l'écoute (listen), elle est lancée à nouveau
  }
  const address = server.address(); // Récupère l'adresse
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port; // crée une chaine de caractère pour l'adresse serv
  switch (error.code) { // quitte le processus en fonction de l'erreur
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app); // Crée le serveur http

server.on('error', errorHandler); // gestionnaire d'erreur 
server.on('listening', () => { // Ecoute les requetes : recupère adresse + crée chaine de caractère ( port du serveur )
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port); // ecoute les requete du port