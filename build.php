<?php
$config = require "config.php";
$code = file_get_contents('src/index.php');
if ($config['vimEnable']) {
    $vimcode = file_get_contents("src/vim.js");
    $code = str_replace("%vim%", "<script>$vimcode</script>", $code);
    $code = str_replace("%layout%", 'editor.setKeyboardHandler("ace/keyboard/vim"); var Vim = ace.require("ace/keyboard/vim").CodeMirror.Vim; Vim.defineEx("write", "w", function (cm, input) { saveFile(); });', $code);
} else {
    $code = str_replace("%vim%", "", $code);
    $code = str_replace("%layout%", "editor.commands.addCommand({
    name: 'save', // название команды
    bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
    exec: function(editor) {
        saveFile();
    },
    readOnly: false
});", $code);
}

$code = str_replace([
    "%ace%",
    "%mode-html%",
    "%mode-css%", 
    "%mode-php%",
    "%mode-javascript%",
    "%theme-monokai%"
], [
    file_get_contents("src/ace.js"),
    file_get_contents("src/mode-html.min.js"),
    file_get_contents("src/mode-css.min.js"),
    file_get_contents("src/mode-php.min.js"),
    file_get_contents("src/mode-javascript.min.js"),
    file_get_contents("src/theme-monokai.js")

], $code);

if ($config['windows']){
    $code = str_replace("%path-seperator%", "\\\\", $code);
} else {
    $code = str_replace("%path-seperator%", "/", $code);
}

file_put_contents('index.php', $code);