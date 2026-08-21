<?php
require_once 'auth.php';

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    header('Location: admin.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = $_POST['username'] ?? '';
    $pass = $_POST['password'] ?? '';
    
    // Proteção contra brute force básica (delay)
    sleep(1);

    if ($user === ADMIN_USER && hash_equals(ADMIN_PASS_HASH, hash('sha256', $pass))) {
        // Rotaciona o ID da sessão para evitar Session Fixation
        session_regenerate_id(true);
        $_SESSION['logged_in'] = true;
        // Gerar CSRF token
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        header('Location: admin.php');
        exit;
    } else {
        $error = 'Usuário ou senha incorretos.';
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Painel de Controle</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Outfit', sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
        }
        .login-card {
            background-color: #1e293b;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 400px;
            border: 1px solid #334155;
        }
        .login-card h2 {
            margin-top: 0;
            color: #f97316;
            text-align: center;
        }
        .form-group {
            margin-bottom: 1.5rem;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            color: #94a3b8;
        }
        input {
            width: 100%;
            padding: 0.75rem;
            border-radius: 6px;
            background-color: #0f172a;
            border: 1px solid #334155;
            color: #fff;
            box-sizing: border-box;
            font-family: inherit;
        }
        input:focus {
            outline: none;
            border-color: #f97316;
        }
        button {
            width: 100%;
            padding: 0.75rem;
            background-color: #f97316;
            color: #fff;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        button:hover {
            background-color: #ea580c;
        }
        .error {
            color: #ef4444;
            font-size: 0.85rem;
            margin-bottom: 1rem;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <h2>Acesso Administrativo</h2>
        <?php if ($error): ?>
            <div class="error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        <form method="POST" action="login.php">
            <div class="form-group">
                <label for="username">Usuário</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="password">Senha</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Entrar no Painel</button>
        </form>
    </div>
</body>
</html>
