// Обработка создания, удаления и переименования файлов и папок
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];
    $path = $_POST['path'] ?? '';
    $newName = $_POST['newName'] ?? '';

    if ($action === 'createFile' && $path && $newName) {
        if (file_put_contents($path . DIRECTORY_SEPARATOR . $newName, '') !== false) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Не удалось создать файл']);
        }
        exit;
    }

    if ($action === 'createFolder' && $path && $newName) {
        if (mkdir($path . DIRECTORY_SEPARATOR . $newName)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Не удалось создать папку']);
        }
        exit;
    }

    if ($action === 'rename' && $path && $newName) {
        $newPath = dirname($path) . DIRECTORY_SEPARATOR . $newName;
        if (rename($path, $newPath)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Не удалось переименовать']);
        }
        exit;
    }

    if ($action === 'delete' && $path) {
        if (is_dir($path)) {
            function rrmdir($dir) { 
                if (is_dir($dir)) { 
                    $objects = scandir($dir);
                    foreach ($objects as $object) { 
                    if ($object != "." && $object != "..") { 
                        if (is_dir($dir. DIRECTORY_SEPARATOR .$object) && !is_link($dir."/".$object))
                        rrmdir($dir. DIRECTORY_SEPARATOR .$object);
                        else
                        unlink($dir. DIRECTORY_SEPARATOR .$object); 
                    } 
                    }
                    return rmdir($dir); 
                } 
            }
            if (rrmdir($path)) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Не удалось удалить папку']);
            }
        } else {
            if (unlink($path)) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Не удалось удалить файл']);
            }
        }
        exit;
    }
}