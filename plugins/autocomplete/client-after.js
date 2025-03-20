editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true,
});

{
    document.head.insertAdjacentHTML('beforeend', `
    <style>
                .ace_editor.ace_autocomplete {
            background: #272822; /* Фон Monokai */
            border: 1px solid #75715E; /* Граница Monokai */
            color: #F8F8F2; /* Основной текст Monokai */
        }

        .ace_editor.ace_autocomplete .ace_completion-highlight {
            color: #FD971F; /* Подсветка совпадений (оранжевый) */
        }

        .ace_editor.ace_autocomplete .ace_line {
            color: #F8F8F2; /* Цвет текста */
        }

        .ace_editor.ace_autocomplete .ace_selected {
            background: #49483E; /* Цвет выделенного элемента */
            color: #F8F8F2;
        }

        .ace_editor.ace_autocomplete .ace_marker-layer .ace_active-line {
            background: #49483E; /* Цвет активной строки */
        }
    </style>
        `);
}