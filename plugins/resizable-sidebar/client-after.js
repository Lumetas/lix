{
    // Проверяем, есть ли уже стили для плагина
if (!document.querySelector('style[data-resizable-sidebar-styles]')) {
    const styles = `
    <style data-resizable-sidebar-styles>
        #sidebar {
            position: relative;
            min-width: 100px;
            max-width: 80%;
        }
        .resizer {
            position: absolute;
            top: 0;
            right: -5px;
            width: 17.5px;
            height: 100%;
            cursor: col-resize;
            background: transparent;
            z-index: 1000;
            transition:0.2s;
        }
        .resizer:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Функция для сохранения ширины sidebar в localStorage
function saveSidebarWidth(width) {
    localStorage.setItem('sidebarWidth', width);
}

// Функция для загрузки ширины sidebar из localStorage
function loadSidebarWidth() {
    return localStorage.getItem('sidebarWidth');
}

// Инициализация ширины sidebar
const sidebar = document.getElementById('sidebar');
const savedWidth = loadSidebarWidth();
if (savedWidth) {
    sidebar.style.width = savedWidth;
}

// Создаём разделитель
const resizer = document.createElement('div');
resizer.className = 'resizer';
sidebar.appendChild(resizer);

// Переменные для управления перетаскиванием
let isResizing = false;
let startX = 0;
let startWidth = 0;

// Обработчик начала перетаскивания
resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = sidebar.offsetWidth - getComputedStyle(sidebar)['padding'].replace('px','')*2;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    if (typeof(TabsResizeEditor) === 'function'){TabsResizeEditor();}
});

// Обработчик перемещения мыши
function handleMouseMove(e) {
    if (!isResizing) return;
    const dx = e.clientX - startX;
    const newWidth = startWidth + dx;
    sidebar.style.width = `${newWidth}px`;
    if (typeof(TabsResizeEditor) === 'function'){TabsResizeEditor();}
}

// Обработчик завершения перетаскивания
function handleMouseUp() {
    isResizing = false;
    saveSidebarWidth(sidebar.style.width);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
}
}