<?php
// Обработка сохранения файла
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $filename = $data['filename'] ?? '';
    $content = $data['content'] ?? '';

    if ($filename && $content) {
        if (file_put_contents($filename, $content)) {
            echo "Файл сохранён: " . $filename;
        } else {
            http_response_code(500);
            echo "Ошибка: не удалось сохранить файл";
        }
    } else {
        http_response_code(400);
        echo "Ошибка: неверные данные";
    }
    exit;
}

// Обработка загрузки дерева директорий
if (isset($_GET['folder-path'])) {
    $folder = $_GET['folder-path'];
    $files = [];

    if (is_dir($folder)) {
        foreach (scandir($folder) as $item) {
            if ($item === '.' || $item === '..') continue;
            $path = $folder . DIRECTORY_SEPARATOR . $item;
            $files[] = [
                'name' => $item,
                'type' => is_dir($path) ? 'folder' : 'file',
                'path' => $path
            ];
        }
    }

    header('Content-Type: application/json');
    echo json_encode($files);
    exit;
}

// Обработка загрузки файла
if (isset($_GET['file'])) {
    $file = $_GET['file'];
    if (file_exists($file) && is_file($file)) {
        echo file_get_contents($file);
    } else {
        http_response_code(404);
        echo "Файл не найден";
    }
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <title>Ace Editor with Vim and Monokai Theme</title>
    <style type="text/css">
        body {
            margin: 0;
            padding: 0;
            display: flex;
            height: 100vh;
        }
        #sidebar {
            width: 250px;
            background: #2f3129;
            color: #f8f8f2;
            overflow-y: auto;
            padding: 10px;
        }
        #sidebar * {
            user-select: none;
        }
        #editor {
            flex: 1;
            /* background: #272822; Цвет фона Monokai */
        }
        .file-item {
            padding: 5px;
            cursor: pointer;
        }
        .file-item:hover {
            background: #3e3d32;
        }
        .folder {
            font-weight: bold;
        }
        .folder::before {
            content: "📁 ";
        }
        .file::before {
            content: "📄 ";
        }
        .folder-contents {
            margin-left: 20px;
            display: none;
        }
        .folder-contents.visible {
            display: block;
        }
    </style>
</head>

<body>
    <!-- Боковая панель с деревом директорий -->
    <div id="sidebar">
        <h3>Files</h3>
        <div id="file-tree"></div>
    </div>

    <!-- Редактор -->
    <div id="editor"></div>

    <!-- Подключаем Ace Editor -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/keybinding-vim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/mode-html.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/mode-php.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/mode-javascript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/mode-css.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/theme-monokai.js"></script>
    <script>
        // Инициализация редактора
        var editor = ace.edit("editor");
        
        editor.setTheme("ace/theme/monokai"); // Устанавливаем тему Monokai
        editor.setValue("Начните писать здесь...");

        Раскладка
        editor.setKeyboardHandler("ace/keyboard/vim");
        var Vim = ace.require("ace/keyboard/vim").CodeMirror.Vim;
        Vim.defineEx("write", "w", function (cm, input) {
            saveFile();
        });

        file = '';
        function saveFile(){
            var filename = file; // Имя файла из аргументов команды
            var content = editor.getValue();

            // Отправляем содержимое на сервер для сохранения
            fetch("index.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ filename: filename, content: content })
            })
            .then(response => response.text())
            .then(message => {
                console.log(message); // Сообщение от сервера
            })
            .catch(error => {
                console.error("Ошибка при сохранении файла:", error);
            });
        }

        // Добавляем команду :w


        // Функция для загрузки дерева директорий
        function loadFileTree(folder, parentElement) {
            fetch(`index.php?folder-path=${encodeURIComponent(folder)}`)
                .then(response => response.json())
                .then(data => {
                    parentElement.innerHTML = '';
                    renderFileTree(data, parentElement);
                })
                .catch(error => {
                    console.error("Ошибка при загрузке дерева директорий:", error);
                });
        }

        // Функция для отрисовки дерева директорий
        function renderFileTree(tree, parentElement) {
            tree.forEach(item => {
                var div = document.createElement("div");
                div.className = item.type === "folder" ? "file-item folder" : "file-item file";
                div.textContent = item.name;

                if (item.type === "folder") {
                    
                    var contents = document.createElement("div");
                    contents.className = "folder-contents";
                    div.appendChild(contents);

                    div.onclick = (e) => {
                        e.stopPropagation(); // Останавливаем всплытие события
                        contents.classList.toggle("visible");
                        if (contents.classList.contains("visible")) {
                            loadFileTree(item.path, contents);
                        }
                    };
                } else {
                    div.onclick = () => {
                        file = item.path;
                        loadFile(item.path);
                        
                        
                    };
                }

                parentElement.appendChild(div);
            });
        }

        // Функция для загрузки файла в редактор
        function loadFile(path) {
            fetch(`index.php?file=${encodeURIComponent(path)}`)
                .then(response => response.text())
                .then(content => {
                    editor.setValue(content);
                    setSyntaxMode(path); // Устанавливаем режим подсветки синтаксиса
                    // document.getElementById("ace_content").focus();
                    editor.focus()
                })
                .catch(error => {
                    console.error("Ошибка при загрузке файла:", error);
                });
        }

        // Функция для установки режима подсветки синтаксиса
        function setSyntaxMode(path) {
            var mode;
            if (path.endsWith(".html")) {
                mode = "ace/mode/html";
            } else if (path.endsWith(".js")) {
                mode = "ace/mode/javascript";
            } else if (path.endsWith(".php")) {
                mode = "ace/mode/php";
            } else if (path.endsWith(".css")) {
                mode = "ace/mode/css";
            } else {
                mode = "ace/mode/text"; // Режим по умолчанию для неизвестных файлов
            }
            editor.session.setMode(mode);
        }

        // Загружаем дерево директорий при загрузке страницы
        var folder = new URLSearchParams(window.location.search).get("folder") || ".";
        var fileTree = document.getElementById("file-tree");
        loadFileTree(folder, fileTree);
    </script>
</body>

</html>