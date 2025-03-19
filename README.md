Склонируйте репозиторий, откройте `config.php` Включите или выключите vim mode запустите `build.php`. Редактор соберётся в один файл `index.php`. Используйте

Например вы переименуете файл в `editor.php`, тогда чтобы открыть папку вам будет необходимо открыть `example.com/editor.php?folder=<folder>`

Так же в конфиге необходимо указать будет ли редактор запускаться на windows, это необходимо для правильной установки путей.

### Плагины
Файл  `plugins/<name>/<name>.lix` Должен возвращать код плагина. Вот так например:
```
return [
    "server" => [
        "before" => file_get_contents(__DIR__."/server-before.php"),
        "after" => '//after',
    ],

    "client" => [
        "before" => '//before',
        "after" => file_get_contents(__DIR__."/client-after.js")
    ]

];
```

Серверный код обрабатывается на сервере. Клиентский на клиенте. before до выполнения кода редактора, after поле.
Так же в конфиге необходимо включить этот плагин:
```
"plugins" => [
    "example"
]
```

После сборки код плагина будет так же подключен в этот один файл.

## Встроенные плагины:
- tabs - Добавляет вкладки
- auth - Добавляет аутентификацию по паролю
- file-manager - Позволяет создавать, удалять, переименовывать, перемещать файлы и папки
Если какие-то из встроенных плагинов вам не нужны откличите их в `config.php` перед сборкой.