<?php
session_start();

// Configurações de Segurança
define('ADMIN_USER', 'admin');
// Hash SHA-256 de "BuffonAdmin!2026"
define('ADMIN_PASS_HASH', 'b7804473e318f77af456c6d042129e96f1d9313a9de0cc473d09a800d072e9c2'); 

function checkAuth() {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        header('Location: login.php');
        exit;
    }
}
?>
