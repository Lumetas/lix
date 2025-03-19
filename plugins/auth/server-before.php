session_start();

// Пароль по умолчанию (замени на свой)
$defaultPassword = 'admin';
$hashedPassword = password_hash($defaultPassword, PASSWORD_DEFAULT);

// Проверка аутентификации
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'login') {
        $password = $_POST['password'] ?? '';
        if (password_verify($password, $hashedPassword)) {
            $_SESSION['authenticated'] = true;
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Неверный пароль']);
        }
        exit;
    }
}

// Проверка доступа
if (!isset($_SESSION['authenticated'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['login'])) {
        header('Location: ?login');
        exit;
    }
}