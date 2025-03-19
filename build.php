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

$plugin_server_before = '<?php';
$plugin_server_after = '<?php';

$plugin_client_before = '<script>';
$plugin_client_after = '<script>';


if (isset($config['plugins']) && count($config['plugins']) !== 0){
    foreach ($config['plugins'] as $plugin){
        $plugin = require "plugins/$plugin/$plugin.lix";
        if (isset($plugin['server'])){
            if (isset($plugin['server']['before'])){$plugin_server_before .= "\n\n".$plugin['server']['before'];}
            if (isset($plugin['server']['after'])){$plugin_server_after .= "\n\n".$plugin['server']['after'];}
        }
        if (isset($plugin['client'])){
            if (isset($plugin['client']['before'])){$plugin_client_before .= "\n\n".$plugin['client']['before'];}
            if (isset($plugin['client']['after'])){$plugin_client_after .= "\n\n".$plugin['client']['after'];}
        }
    }

    $plugin_server_before .= "\n?>";
    $plugin_server_after .= "\n?>";
    $plugin_client_before .= "\n</script>";
    $plugin_client_after .= "\n</script>";
    $code = str_replace([
        "%server-before-plugins%",
        "%server-after-plugins%",
        "%client-before-plugins%",
        "%client-after-plugins%"
    ],
    [
        $plugin_server_before,
        $plugin_server_after,
        $plugin_client_before,
        $plugin_client_after
    ], $code);
} else {
    $code = str_replace([
        "%server-before-plugins%",
        "%server-after-plugins%",
        "%client-before-plugins%",
        "%client-after-plugins%"
    ],
    "", $code);
}


file_put_contents('index.php', $code);