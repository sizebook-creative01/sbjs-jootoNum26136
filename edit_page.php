<?php

function create_cushion_toggle($post_id)
{
  $run_cushion = get_post_meta($post_id, "run_cushion", true);
  $run_text = $run_cushion ? '使用する' : '未使用';
  $checked = $run_cushion ? 'checked' : '';
  return <<<EOM
    <div style="margin:20px 0;">
      クッションページを使用しますか？ - $run_text
      <input id="run_cushion" name="run_cushion" class="toggle_input" type="checkbox" $checked />
      <label for="run_cushion" class="toggle_label"/>
    </div>
    <style>
    .toggle_input {
      opacity: 0;
    }
    .toggle_label {
      width: 65px;
      height: 25px;
      background: #ccc;
      position: relative;
      display: inline-block;
      border-radius: 40px;
      transition: 0.4s;
      box-sizing: border-box;
    }
    .toggle_label:after {
      content: "";
      position: absolute;
      width: 25px;
      height: 25px;
      border-radius: 100%;
      left: 0;
      top: 0;
      z-index: 2;
      background: #fff;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
      transition: 0.4s;
    }
    .toggle_input:checked + .toggle_label {
      background-color: #4BD865;
    }
    .toggle_input:checked + .toggle_label:after {
      left: 40px;
    }
    </style>
    EOM;
}

// メタボックスのコールバック関数
function cushion_fields_callback($post)
{
  wp_nonce_field('save_cushion_fields_data', 'cushion_fields_meta_box_nonce');
  echo create_cushion_toggle($post->ID);
}

function add_cushion_fields_meta_box()
{
  // 投稿にカスタムフィールドを追加
  add_meta_box('cuchion_fields_meta_box', 'Custom Fields', 'cushion_fields_callback', 'post');
}
add_action('add_meta_boxes', 'add_cushion_fields_meta_box');

// カスタムフィールドのデータ保存
function save_cushion_fields_data($post_id)
{
  if (!isset($_POST['cushion_fields_meta_box_nonce'])) return;
  if (!wp_verify_nonce($_POST['cushion_fields_meta_box_nonce'], 'save_cushion_fields_data')) return;

  update_post_meta($post_id, 'run_cushion', isset($_POST['run_cushion']) ? 1 : 0);
}
add_action('save_post', 'save_cushion_fields_data');
