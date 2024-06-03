import SizeBook from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const redirect = window.runCushion ?? false;

  const options = {
    // リファラに保持する他のクエリパラメータを配列で指定 ex.) ["keyword", ...]

    otherKeyList: [],
    // atagに保持したdata属性の値をリファラに追加する場合 ex.) ["positionIndex", ...]

    reffererList: [
      "positionIndex",
      /**
       * "hogehoge"
       */
    ], // ex.) atagに直書きしたdata-hogehogeの値を取得する、など
    // 広告クリック時にリダイレクトするならtrue

    redirect
    // オプションを追加する際は以下に記述
    
  };

  // 処理の実行（インスタンス作成）
  new SizeBook(options);
});
