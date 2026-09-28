const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 8080;
const SESSIONS = new Set();
const CSRF_TOKEN = crypto.randomBytes(16).toString('hex');

const ADMIN_USER = 'admin';
const ADMIN_PASS_HASH = 'c9639d0b07319d01ec017e1d23a0da085497d6d43bd7dcad2b515d404bd961a0'; // BuffonAdmin!2026

function parseCookies(req) {
    const list = {};
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(';').forEach(cookie => {
        let [name, ...rest] = cookie.split('=');
        name = name?.trim();
        if (!name) return;
        const value = rest.join('=').trim();
        list[name] = decodeURIComponent(value);
    });
    return list;
}

function isAuthenticated(req) {
    const cookies = parseCookies(req);
    return cookies.session_id && SESSIONS.has(cookies.session_id);
}

const server = http.createServer((req, res) => {
    const parsedUrl = req.url.split('?')[0];
    const urlPath = parsedUrl === '/' ? '/index.php' : parsedUrl;

    // Redirecionamento de logout
    if (urlPath === '/logout.php') {
        const cookies = parseCookies(req);
        if (cookies.session_id) SESSIONS.delete(cookies.session_id);
        res.writeHead(302, {
            'Set-Cookie': 'session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
            'Location': '/login.php'
        });
        return res.end();
    }

    // Tela e processamento de Login
    if (urlPath === '/login.php') {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                const params = new URLSearchParams(body);
                const username = params.get('username') || '';
                const password = params.get('password') || '';
                const passHash = crypto.createHash('sha256').update(password).digest('hex');

                if (username === ADMIN_USER && passHash === ADMIN_PASS_HASH) {
                    const sessionId = crypto.randomBytes(24).toString('hex');
                    SESSIONS.add(sessionId);
                    res.writeHead(302, {
                        'Set-Cookie': `session_id=${sessionId}; Path=/; HttpOnly`,
                        'Location': '/admin.php'
                    });
                    return res.end();
                }

                // Renderiza login com erro
                fs.readFile(path.join(__dirname, 'login.php'), 'utf-8', (err, html) => {
                    if (err) {
                        res.writeHead(500);
                        return res.end('Erro ao carregar login.php');
                    }
                    const rendered = html
                        .replace(/<\?php[\s\S]*?\?>/g, '')
                        .replace('<div class="login-card">', '<div class="login-card">\n<div class="error">Usuário ou senha incorretos.</div>');
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(rendered);
                });
            });
            return;
        }

        if (isAuthenticated(req)) {
            res.writeHead(302, { 'Location': '/admin.php' });
            return res.end();
        }

        fs.readFile(path.join(__dirname, 'login.php'), 'utf-8', (err, html) => {
            if (err) {
                res.writeHead(500);
                return res.end('Erro ao carregar login.php');
            }
            const rendered = html.replace(/<\?php[\s\S]*?\?>/g, '');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(rendered);
        });
        return;
    }

    // Proteção da rota do painel admin
    if (urlPath === '/admin.php' || urlPath === '/admin.html') {
        if (!isAuthenticated(req)) {
            res.writeHead(302, { 'Location': '/login.php' });
            return res.end();
        }

        fs.readFile(path.join(__dirname, 'admin.php'), 'utf-8', (err, html) => {
            if (err) {
                res.writeHead(500);
                return res.end('Erro ao carregar admin.php');
            }
            const hasDataJs = fs.existsSync(path.join(__dirname, 'js', 'data.js'));
            const dataFile = hasDataJs ? 'js/data.js' : 'js/data.default.js';
            const timestamp = Date.now();

            let rendered = html
                .replace(/<\?php\s+require_once\s+'auth\.php';\s+checkAuth\(\);\s*\?>/g, '')
                .replace(/<\?php\s+echo\s+\$_SESSION\['csrf_token'\]\s*\?\?\s*'';\s*\?>/g, CSRF_TOKEN)
                .replace(/<\?php\s+echo\s+time\(\);\s*\?>/g, timestamp)
                .replace(/<\?php\s+\$dataFile[\s\S]*?\?>/g, '')
                .replace(/<\?php\s+echo\s+\$dataFile;\s*\?>/g, dataFile);

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(rendered);
        });
        return;
    }

    // Endpoint de publicação / salvar dados
    if (urlPath === '/publish.php') {
        if (!isAuthenticated(req)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Não autorizado' }));
        }

        if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        }

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const localPath = path.join(__dirname, 'js', 'data.js');

                if (data.action === 'reset') {
                    if (fs.existsSync(localPath)) {
                        fs.unlinkSync(localPath);
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: true }));
                }

                if (!data.content) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Conteúdo não fornecido.' }));
                }

                fs.writeFileSync(localPath, data.content, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // Servir página inicial (index.php ou index.html)
    if (urlPath === '/index.php' || urlPath === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.php'), 'utf-8', (err, html) => {
            if (err) {
                res.writeHead(500);
                return res.end('Erro ao carregar index.php');
            }
            const hasDataJs = fs.existsSync(path.join(__dirname, 'js', 'data.js'));
            const dataFile = hasDataJs ? 'js/data.js' : 'js/data.default.js';
            const timestamp = Date.now();

            let rendered = html
                .replace(/<\?php\s+echo\s+time\(\);\s*\?>/g, timestamp)
                .replace(/<\?php\s+\$dataFile[\s\S]*?\?>/g, '')
                .replace(/<\?php\s+echo\s+\$dataFile;\s*\?>/g, dataFile);

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(rendered);
        });
        return;
    }

    // Servir arquivos estáticos (CSS, JS, imagens, etc.)
    let filePath = path.join(__dirname, urlPath.replace(/^\//, ''));
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
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Arquivo não encontrado: ' + urlPath);
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Erro interno do servidor: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Servidor Buffon iniciado com sucesso!`);
    console.log(`🌐 Site Principal:     http://localhost:${PORT}/`);
    console.log(`⚙️  Painel de Controle: http://localhost:${PORT}/admin.php`);
    console.log(`🔑 Login:              admin | Senha: BuffonAdmin!2026`);
    console.log(`======================================================\n`);
});
