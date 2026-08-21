<?php
require_once 'auth.php';

// Retornar JSON para requisições não autorizadas
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit;
}

// Permitir apenas requisições POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

// Ler o JSON enviado
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// Verificar CSRF Token
if (!isset($input['csrf_token']) || !hash_equals($_SESSION['csrf_token'] ?? '', $input['csrf_token'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Token de segurança inválido']);
    exit;
}

$localPath = __DIR__ . '/js/data.js';

// Função de resetar para o estado inicial
if (isset($input['action']) && $input['action'] === 'reset') {
    if (file_exists($localPath)) {
        if (unlink($localPath)) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Não foi possível apagar o arquivo de dados local. Verifique as permissões.']);
        }
    } else {
        // Já está no estado inicial
        echo json_encode(['success' => true]);
    }
    exit;
}

// Fluxo normal de salvar
if (!isset($input['content'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Conteudo não fornecido.']);
    exit;
}

// O conteúdo raw do data.js (já montado no frontend)
$fileContent = $input['content'];

// Salvar localmente no servidor
if (file_put_contents($localPath, $fileContent) !== false) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Falha ao gravar arquivo no servidor. Verifique as permissões de pasta.']);
}
?>
