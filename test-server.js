const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// Configuração da senha em Base64 (buffon:buffon@123)
const validAuth = 'Basic ' + Buffer.from('buffon:buffon@123').toString('base64');

const server = http.createServer((req, res) => {
    // Intercepta a rota /admin.html para pedir senha
    if (req.url === '/admin.html') {
        const authHeader = req.headers.authorization;
        if (!authHeader || authHeader !== validAuth) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Acesso Restrito"');
            res.writeHead(401, { 'Content-Type': 'text/html' });
            res.end('<h1>Acesso Negado</h1><p>Autenticacao necessaria.</p>');
            return;
        }
    }

    // Serve os arquivos estáticos normalmente
    let filePath = '.' + req.url.split('?')[0]; // Ignora query strings como ?v=1.0
    if (filePath === './') filePath = './index.html';

    const extname = path.extname(filePath).toLowerCase();
    let contentType = 'text/html';
    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': 
        case '.jpeg': contentType = 'image/jpeg'; break;
        case '.svg': contentType = 'image/svg+xml'; break;
        case '.webp': contentType = 'image/webp'; break;
        case '.woff': contentType = 'font/woff'; break;
        case '.woff2': contentType = 'font/woff2'; break;
        case '.ttf': contentType = 'font/ttf'; break;
        case '.ico': contentType = 'image/x-icon'; break;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code == 'ENOENT') {
                res.writeHead(404);
                res.end('Arquivo nao encontrado.');
            } else {
                res.writeHead(500);
                res.end('Erro interno do servidor: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor de teste rodando em: http://localhost:${PORT}`);
    console.log(`Abra http://localhost:${PORT}/admin.html para testar o bloqueio de senha!`);
});
