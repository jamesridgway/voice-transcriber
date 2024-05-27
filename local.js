let app = require('./app/app');
let port = process.env.PORT || 8080;

// Server
 app.listen(port, () => {
    console.log(`Listening on: http://localhost:${port}`);
});
