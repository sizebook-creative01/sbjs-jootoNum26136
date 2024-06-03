<?php
/*
Plugin Name: @from cushion to threeate
Description: クッションページを経由してthreeateに遷移します
Version: 1.0.0
Author: sizebook
Author URI: https://sizebook.co.jp/
*/

if (!defined('ABSPATH')) exit;

require_once plugin_dir_path(__FILE__) . 'edit_page.php';

function cushion_plugin_load_scripts()
{
  // 投稿ページのみでスクリプトを読み込む
  if (is_single()) {
    global $post;
    $value = get_post_meta($post->ID, 'run_cushion', true);
    // $value の値をログとして出力
    echo '<script>';
    echo 'console.log(' . ($value ? 'true' : 'false') . ');';
    echo '</script>';
    wp_enqueue_script('my-cushion-script', plugins_url('js/sizebook.js', __FILE__), [], null, true);
    if ($value) {
      wp_add_inline_script('my-cushion-script', 'window.runCushion = true;');
    } else {
      wp_add_inline_script('my-cushion-script', 'window.runCushion = false;');
    }
  }
}
add_action('wp_enqueue_scripts', 'cushion_plugin_load_scripts');

// スクリプトタグにtype="module"を追加するフィルター
function add_type_attribute($tag, $handle, $src) {
    // 特定のスクリプトハンドルに対してtype="module"を追加
    if ('my-cushion-script' === $handle) {
        $tag = '<script type="module" src="' . esc_url($src) . '"></script>';
    }
    return $tag;
}
add_filter('script_loader_tag', 'add_type_attribute', 10, 3);
