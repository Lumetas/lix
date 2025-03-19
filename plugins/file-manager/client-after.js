// Стили для контекстного меню, модального окна и drag'n'drop
const styles = `
<style>
    .context-menu {
        position: absolute;
        background: #272822;
        border: 1px solid #3e3d32;
        color: #f8f8f2;
        font-family: monospace;
        z-index: 1000;
        padding: 5px 0;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
    }
    .context-menu-item {
        padding: 5px 10px;
        cursor: pointer;
    }
    .context-menu-item:hover {
        background: #3e3d32;
    }
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
    }
    .modal {
        background: #272822;
        padding: 20px;
        border: 1px solid #3e3d32;
        color: #f8f8f2;
        font-family: monospace;
    }
    .modal input {
        background: #3e3d32;
        border: 1px solid #3e3d32;
        color: #f8f8f2;
        padding: 5px;
        margin-top: 10px;
    }
    .modal button {
        background: #3e3d32;
        border: 1px solid #3e3d32;
        color: #f8f8f2;
        padding: 5px 10px;
        margin-left: 10px;
        cursor: pointer;
    }
    .modal button:hover {
        background: #4a4941;
    }
    .dragging {
        opacity: 0.5;
    }
    .drag-over {
        background: #3e3d32 !important;
    }
</style>
`;
document.head.insertAdjacentHTML('beforeend', styles);

// Удаляем существующее контекстное меню
function removeExistingContextMenu() {
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
}

// Функция для отображения контекстного меню
function showContextMenu(event, type, path) {
    removeExistingContextMenu(); // Удаляем предыдущее меню

    const menu = document.createElement('div');
    menu.className = 'context-menu';

    if (type === 'folder') {
        menu.innerHTML = `
            <div class="context-menu-item" data-action="createFile" data-path="${path}">Создать файл</div>
            <div class="context-menu-item" data-action="createFolder" data-path="${path}">Создать папку</div>
            <div class="context-menu-item" data-action="rename" data-path="${path}">Переименовать</div>
            <div class="context-menu-item" data-action="delete" data-path="${path}">Удалить</div>
        `;
    } else if (type === 'file') {
        menu.innerHTML = `
            <div class="context-menu-item" data-action="rename" data-path="${path}">Переименовать</div>
            <div class="context-menu-item" data-action="delete" data-path="${path}">Удалить</div>
        `;
    } else {
        menu.innerHTML = `
            <div class="context-menu-item" data-action="createFile" data-path="${path}">Создать файл</div>
            <div class="context-menu-item" data-action="createFolder" data-path="${path}">Создать папку</div>
        `;
    }

    menu.style.left = `${event.pageX}px`;
    menu.style.top = `${event.pageY}px`;
    document.body.appendChild(menu);

    // Закрытие меню при клике вне его
    const closeMenu = (e) => {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };
    document.addEventListener('click', closeMenu);

    // Обработка выбора пункта меню
    menu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('data-action');
            const path = item.getAttribute('data-path');
            handleAction(action, path);
            menu.remove();
        });
    });
}

// Функция для отображения модального окна
function showModal(action, path, oldName = '') {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div>Введите новое имя:</div>
        <input type="text" id="newNameInput" value="${oldName}">
        <button id="confirmButton">ОК</button>
        <button id="cancelButton">Отмена</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const confirmButton = modal.querySelector('#confirmButton');
    const cancelButton = modal.querySelector('#cancelButton');
    const newNameInput = modal.querySelector('#newNameInput');

    // Обработка нажатия Enter
    newNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const newName = newNameInput.value.trim();
            if (newName) {
                performAction(action, path, newName);
                overlay.remove();
            }
        }
    });

    confirmButton.addEventListener('click', () => {
        const newName = newNameInput.value.trim();
        if (newName) {
            performAction(action, path, newName);
        }
        overlay.remove();
    });

    cancelButton.addEventListener('click', () => {
        overlay.remove();
    });
}

// Функция для выполнения действия
function performAction(action, path, newName = '') {
    let body = `action=${action}&path=${encodeURIComponent(path)}`;
    if (newName) {
        body += `&newName=${encodeURIComponent(newName)}`;
    }

    fetch('', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Обновляем дерево файлов
            const folder = new URLSearchParams(window.location.search).get("folder") || ".";
            loadFileTree(folder, document.getElementById('file-tree'));
        } else {
            alert(data.error || 'Ошибка');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
}

// Обработка действий
function handleAction(action, path) {
    if (action === 'rename') {
        const oldName = path.split(/[\\/]/).pop(); // Получаем старое имя файла/папки
        showModal(action, path, oldName);
    } else if (action === 'delete') {
        const name = path.split(/[\\/]/).pop(); // Получаем имя файла/папки
        if (confirm(`Вы уверены, что хотите удалить "${name}"?`)) {
            performAction(action, path);
        }
    } else if (action === 'createFile' || action === 'createFolder') {
        showModal(action, path);
    }
}

// Добавляем обработчики для контекстного меню
document.getElementById('sidebar').addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const target = event.target.closest('.file-item');
    if (!target) { // Открываем меню только если кликнули не на файл/папку
        showContextMenu(event, null, new URLSearchParams(window.location.search).get("folder") || ".");
    }
});

document.getElementById('file-tree').addEventListener('contextmenu', (event) => {
    const target = event.target.closest('.file-item');
    if (target) {
        event.preventDefault();
        const type = target.classList.contains('folder') ? 'folder' : 'file';
        const path = target.getAttribute('data-path');
        showContextMenu(event, type, path);
    }
});

// Добавляем обработчики для drag'n'drop
document.getElementById('file-tree').addEventListener('dragstart', (event) => {
    const target = event.target.closest('.file-item');
    if (target) {
        const path = target.getAttribute('data-path');
        event.dataTransfer.setData('text/plain', path); // Сохраняем путь перетаскиваемого элемента
        event.target.classList.add('dragging'); // Добавляем класс для визуального выделения
    }
});

document.getElementById('file-tree').addEventListener('dragend', (event) => {
    const target = event.target.closest('.file-item');
    if (target) {
        target.classList.remove('dragging'); // Убираем класс после завершения перетаскивания
    }
});

document.getElementById('file-tree').addEventListener('dragover', (event) => {
    event.preventDefault(); // Разрешаем перетаскивание
    const target = event.target.closest('.file-item.folder, #file-tree');
    if (target) {
        target.classList.add('drag-over'); // Подсвечиваем папку или корневую папку
    }
});

document.getElementById('file-tree').addEventListener('dragleave', (event) => {
    const target = event.target.closest('.file-item.folder, #file-tree');
    if (target) {
        target.classList.remove('drag-over'); // Убираем подсветку, когда элемент уходит
    }
});

document.getElementById('file-tree').addEventListener('drop', (event) => {
    event.preventDefault();
    const target = event.target.closest('.file-item.folder, #file-tree');
    if (target) {
        const sourcePath = event.dataTransfer.getData('text/plain'); // Получаем путь перетаскиваемого элемента
        const targetPath = target.classList.contains('folder') ? target.getAttribute('data-path') : new URLSearchParams(window.location.search).get("folder") || ".";

        if (sourcePath && targetPath) {
            const newName = basename(sourcePath); // Получаем имя файла/папки
            performAction('rename', sourcePath, `${targetPath}/${newName}`); // Перемещаем через rename
        }

        target.classList.remove('drag-over'); // Убираем подсветку
    }
});

// Вспомогательная функция для получения имени файла/папки
function basename(path) {
    return path.split(/[\\/]/).pop();
}

// Обновляем функцию renderFileTree
const originalRenderFileTree = renderFileTree;
renderFileTree = function(tree, parentElement) {
    parentElement.innerHTML = '';
    tree.forEach(item => {
        const div = document.createElement('div');
        div.className = 'file-item ' + (item.type === 'folder' ? 'folder' : 'file'); // Добавляем класс file-item
        div.textContent = item.name;
        div.setAttribute('data-path', item.path); // Добавляем data-path
        div.setAttribute('draggable', true); // Делаем элемент перетаскиваемым

        if (item.type === 'folder') {
            const contents = document.createElement('div');
            contents.className = 'folder-contents';
            div.appendChild(contents);

            div.onclick = (e) => {
                e.stopPropagation();
                contents.classList.toggle('visible');
                if (contents.classList.contains('visible')) {
                    loadFileTree(item.path, contents);
                }
            };
        } else {
            div.onclick = (e) => {
                e.stopPropagation();
                file = item.path;
                basenameFile = item.path.split(pathSeperator).reverse()[0];
                document.querySelector('title').innerText = basenameFile;
                loadFile(item.path);
            };
        }

        parentElement.appendChild(div);
    });
};