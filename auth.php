<?php
session_start();

// Configurações de Segurança
define('ADMIN_USER', 'admin');
// Hash SHA-256 de "BuffonAdmin!2026"
define('ADMIN_PASS_HASH', 'c9639d0b07319d01ec017e1d23a0da085497d6d43bd7dcad2b515d404bd961a0'); 

function checkAuth() {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        header('Location: login.php');
        exit;
    }
}
?>
