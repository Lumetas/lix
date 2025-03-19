// Проверяем, есть ли уже стили
if (!document.querySelector('style[data-auth-styles]')) {
    const styles = `
    <style data-auth-styles>
        .auth-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1002;
        }
        .auth-modal {
            background: #272822;
            padding: 20px;
            border: 1px solid #3e3d32;
            color: #f8f8f2;
            font-family: monospace;
        }
        .auth-modal input {
            background: #3e3d32;
            border: 1px solid #3e3d32;
            color: #f8f8f2;
            padding: 5px;
            margin-top: 10px;
        }
        .auth-modal button {
            background: #3e3d32;
            border: 1px solid #3e3d32;
            color: #f8f8f2;
            padding: 5px 10px;
            margin-left: 10px;
            cursor: pointer;
        }
        .auth-modal button:hover {
            background: #4a4941;
        }
    </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Показываем форму входа, если пользователь не аутентифицирован
if (new URLSearchParams(window.location.search).has('login')) {
    const overlay = document.createElement('div');
    overlay.className = 'auth-overlay';

    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div>Введите пароль:</div>
        <input type="password" id="passwordInput">
        <button id="loginButton">Войти</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const loginButton = modal.querySelector('#loginButton');
    const passwordInput = modal.querySelector('#passwordInput');

    loginButton.addEventListener('click', () => {
        const password = passwordInput.value.trim();
        if (password) {
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=login&password=${encodeURIComponent(password)}`,
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = "?folder=.";
                } else {
                    alert(data.error || 'Ошибка');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
        }
    });
}