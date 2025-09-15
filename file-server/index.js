const http = require('http'); 
const fs = require('fs');
const path = require('path');

const hostname = 'localhost';
const port = 3000;

const server = http.createServer((req, res) => {
    console.log(`Request for ${req.method} ${req.url}`);

    let filePath = './public';
    let fileName = req.url === '/' ? 'index.html' : req.url + '.html';
    filePath = path.resolve(filePath + fileName);

    const ext = path.extname(filePath);
     
    if (ext !== '.html') {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'text/plain');
        res.end('403 - Only HTML files are allowed');
        return;
    }

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            const errorPath = path.resolve('./public/404.html');
            fs.readFile(errorPath, (err, data) => {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/html');
                res.end(data);
            });
        } else {
            fs.readFile(filePath, (err, data) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(data);
            });
        }
    });

});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});