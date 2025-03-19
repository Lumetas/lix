{
    if (!document.querySelector('style[data-tabs-styles]')) {
        const styles = `
    <style data-tabs-styles>
        .tabs {
            display: flex;
            background: #2f3129;
            padding: 5px;
            border-bottom: 1px solid #3e3d32;
            flex-direction: row;
            flex-wrap: wrap;
            align-content: center;
            width: max-content;
            height: max-content;
        }
        .tab {
            padding: 5px 10px;
            margin-right: 5px;
            background: #3e3d32;
            color: #f8f8f2;
            cursor: pointer;
        }
        .tab.active {
            background: #4a4941;
        }
        .tab-close {
            margin-left: 10px;
            cursor: pointer;
        }
    </style>
    `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    // Контейнер для вкладок
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs';
    document.body.insertBefore(tabsContainer, document.getElementById('editor'));

    // Текущие вкладки
    let tabs = [];
    let activeTab = null;

    // Функция для открытия файла во вкладке
    function openFileInTab(path) {
        const existingTab = tabs.find(tab => tab.path === path);
        if (existingTab) {
            setActiveTab(existingTab);
            return;
        }

        const tab = { path, name: path.split(/[\\/]/).pop() };
        tabs.push(tab);
        renderTabs();
        setActiveTab(tab);
    }

    // Функция для закрытия вкладки
    function closeTab(tab) {
        tabs = tabs.filter(t => t !== tab);
        renderTabs();
        if (activeTab === tab) {
            activeTab = tabs[0] || null;
            if (activeTab) {
                loadFileWithoutTab(activeTab.path);
            } else {
                editor.setValue('');
            }
        }
    }

    // Функция для отрисовки вкладок
    function renderTabs() {
        tabsContainer.innerHTML = '';
        tabs.forEach(tab => {
            const tabElement = document.createElement('div');
            tabElement.className = 'tab' + (tab === activeTab ? ' active' : '');
            tabElement.textContent = tab.name;

            const closeButton = document.createElement('span');
            closeButton.className = 'tab-close';
            closeButton.textContent = '×';
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                closeTab(tab);
            });

            tabElement.appendChild(closeButton);
            tabElement.addEventListener('click', () => setActiveTab(tab));

            tabsContainer.appendChild(tabElement);
        });
        resizeEditor();


    }

    // Функция для установки активной вкладки
    function setActiveTab(tab) {
        activeTab = tab;
        renderTabs();
        loadFileWithoutTab(tab.path);
    }

    // Функция для загрузки файла без создания новой вкладки
    function loadFileWithoutTab(path) {
        fetch(`?file=${encodeURIComponent(path)}`)
            .then(response => response.text())
            .then(content => {
                editor.setValue(content);
                setSyntaxMode(path);
            })
            .catch(error => {
                console.error('Ошибка при загрузке файла:', error);
            });
    }

    // Перехватываем открытие файлов
    const originalLoadFile = loadFile;
    loadFile = function (path) {
        openFileInTab(path);
        originalLoadFile(path);
    };
    function resizeEditor() {
        if (tabs.length == 0) {
            document.getElementById('editor').style.position = 'absolute';
            document.getElementById('editor').style.left = document.getElementById('sidebar').offsetWidth + 'px';
            document.getElementById('editor').style.top = '0';
            document.getElementById('editor').style.width = window.innerWidth - document.getElementById('sidebar').offsetWidth + 'px';
            document.getElementById('editor').style.height = window.innerHeight + 'px';
            editor.resize()
        } else {
            document.getElementById('editor').style.position = 'absolute';
            document.getElementById('editor').style.left = document.getElementById('sidebar').offsetWidth + 'px';
            document.getElementById('editor').style.top = document.querySelector('.tabs').offsetHeight + 'px';
            document.getElementById('editor').style.width = window.innerWidth - document.getElementById('sidebar').offsetWidth + 'px';
            document.getElementById('editor').style.height = window.innerHeight - document.querySelector('.tabs').offsetHeight + 'px';
            editor.resize()
        }
    }
    window.onresize = resizeEditor;
    resizeEditor();
}