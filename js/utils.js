/**
 * SizeBookの機能を管理するためのユーティリティクラスです。
 */
export default class SizeBook {
  #adElemList;
  #idKey;
  #IDKEY_LIST = ["gclid", "yclid", "wbraid", "msclkid"];
  #query;
  #suid;

  /**
   * SizeBookのインスタンスを作成します。
   * @param {Object} options - SizeBookのオプション。
   */
  constructor(options) {
    // ローカルストレージの値でURLを更新
    this.#updateByStorage("suid");
    this.#updateByStorage("otherParams");

    // プロパティの初期化
    this.#adElemList = Utils.getTargetList("https://tr.threeate.jp/ad/p/r?");
    this.#query = this.#__query();
    this.#idKey = this.#__idKey();
    this.#suid = this.#query.get(this.#idKey);

    // threeateリンクの書き換え
    this.#run();

    // オプションに応じた処理
    this.#runOption(options);

    // ローカルストレージに保存
    this.#save();
  }

  /**
   * ローカルストレージの値に基づいてURLを更新します。
   * @private
   * @param {string} key - 更新するキー。
   */
  #updateByStorage(key) {
    // ページ遷移によるID剥がれ防止
    const idStr = localStorage.getItem(key);
    if (!idStr) return;

    const idObj = JSON.parse(idStr);
    const url = Object.keys(idObj).reduce((acc, curr) => {
      return Utils.addUrlParam(acc, curr, idObj[curr]);
    }, location.href);
    history.replaceState(null, null, url);

    if (key === "suid") {
      this.#idKey = Object.keys(idObj)[0];
      this.#suid = idObj[this.#idKey];
    }
  }

  /**
   * 現在のURLに基づいてクエリパラメータを返します。
   * @private
   * @returns {URLSearchParams} クエリパラメータ。
   */
  #__query() {
    const query = new URLSearchParams(location.search);
    if (query.has("utm_refferer")) {
      const refUrl = new URL(query.get("utm_refferer"));
      return new URLSearchParams(refUrl.search);
    }
    if (this.#idKey) {
      // storageから取得した値で上書き
      query.set(this.#idKey, this.#suid);
    }
    return query;
  }

  /**
   * クエリパラメータに基づいてIDキーを返します。
   * @private
   * @returns {string} IDキー。
   */
  #__idKey() {
    if (this.#idKey) return this.#idKey;
    return this.#IDKEY_LIST.filter((key) => this.#query.has(key))[0]; // idKeyを1つしか持たない前提
  }

  /**
   * 広告要素のhref属性にsuidを追加します。
   * @private
   */
  #run() {
    // suidをhref属性に追加
    this.#adElemList.forEach((elem) => {
      elem.href = Utils.addUrlParam(elem.href, "suid", this.#suid);
    });
  }

  /**
   * オプションに基づいてSizeBookの処理を実行します。
   * @private
   * @param {Object} options - SizeBookのオプション。
   */
  #runOption(options) {
    if (!options) {
      console.log('optionsがないです');
      return;
    }

    // リファラに保存するクエリパラメータを追加で指定
    if (options.otherKeyList.length > 0) {
      const values = {};
      options.otherKeyList.map((key) => {
        if (this.#query.has(key)) values[key] = this.#query.get(key);
      });
      this.#save("otherParams", values);
    }

    // atagに付与したdata属性の値を一時的にリファラに追加
    // 【positionIndexの値を付与】
    if (options.reffererList.includes("positionIndex")) {
      PositionIndex.run(this.#adElemList);
    }
    // 【何かしらの値をatagに付与する】※atagに直書きした値を読み取る場合は不要
    // if (options.reffererList.includes("hogehoge")) {
    //   HogeHoge.run(this.#adElemList); // HogeHogeクラスは別途定義してください
    // }
    if (!options.redirect && options.reffererList.length > 0) {
      new AddRefferer(this.#adElemList, options);
    }

    if (options.redirect) {
      new Redirect(document.querySelectorAll("a"), options);
    }
  }

  /**
   * 値をローカルストレージに保存します。
   * @private
   * @param {string} [key="suid"] - 保存するキー。
   * @param {string|Object} [value] - 保存する値。
   */
  #save(key = "suid", value) {
    if (!location.search) return;

    if (!value) value = JSON.stringify({ [this.#idKey]: this.#suid });
    else if (typeof value !== "string") value = JSON.stringify(value);

    localStorage.setItem(key, value);
  }
}

/**
 * PositionIndexに関連するユーティリティクラスです。
 */
class PositionIndex {
  /**
   * 広告要素に位置インデックスを追加します。
   * @static
   * @param {NodeList} adElemList - 広告要素。
   */
  static run(adElemList) {
    adElemList.forEach((elem, index) => {
      elem.dataset.positionIndex = index + 1;
    });
  }
}

/**
 * 必要に応じて継承してください。
 */
class Web {
  #atagList;
  #beforeUrlStr;
  #options;

  /**
   * Webのインスタンスを作成します。
   * @param {NodeList} atagList - atagのリスト。
   * @param {Object} options - オプションのリファラ。
   */
  constructor(atagList, options) {
    this.#atagList = atagList;
    this.#beforeUrlStr = location.href;
    this.#options = options;
  }

  /**
   * atagリストを取得します。
   * @returns {NodeList} atagリスト
   */
  get atagList() {
    return this.#atagList;
  }

  /**
   * 処理前のURLを取得します。
   * @returns {string} 処理前のURL。
   */
  get beforeUrlStr() {
    return this.#beforeUrlStr;
  }

  /**
   * オプションを取得します。
   * @returns {Array} オプション。
   */
  get options() {
    return this.#options;
  }
}

/**
 * リファラに値を追加するためのユーティリティクラスです。
 */
class AddRefferer extends Web {
  /**
   * AddReffererのインスタンスを作成します。
   * @param {NodeList} adElemList - threeateリンクをもつatagリスト。
   * @param {Object} options - オプション。
   */
  constructor(adElemList, options) {
    super(adElemList, options);
    if (options.redirect) {
      console.log("リダイレクト実施中につき");
      return;
    }
    this.#run();
  }

  /**
   * atagクリック時にリファラを追加します。
   * @private
   */
  #run() {
    this.atagList.forEach((atag) => {
      atag.addEventListener("click", (e) => {
        // リンククリック時の挙動をキャンセル
        e.preventDefault();

        // リファラにクエリパラメータを追加
        const afterUrlStr = this.#addToReferrer(atag);
        // 新しいタブで開く
        open(atag.href, "_blank");

        console.log(afterUrlStr);
        // リファラに追加したクエリパラメータを削除
        history.replaceState(null, null, this.beforeUrlStr);
      });
    });
  }

  /**
   * データセットの値をリファラのURLに追加します。
   * @private
   * @param {HTMLElement} atag - アンカー要素。
   * @returns {string} 変更されたリファラのURL。
   */
  #addToReferrer(atag) {
    return this.options.reduce((acc, curr) => {
      const dataset = atag.dataset[curr];
      if (!dataset) return acc;
      return Utils.addUrlParam(acc, curr, atag.dataset[curr]);
    }, this.beforeUrlStr);
  }
}

/**
 * クッションページにリダイレクトするためのユーティリティクラスです。
 */
class Redirect extends Web {
  #redirectUrl =
    "https://my-select.biz/wp-content/plugins/_sbjs/js/redirect.html";
  /**
   * Redirectのインスタンスを作成します。
   * @param {NodeList} atagList - アンカー要素。
   * @param {Object} options - オプションのリファラ。
   */
  constructor(atagList, options) {
    super(atagList, options);
    this.#updateHref();
    this.#run();
  }

  /**
   * atagリスト内の全href属性をリダイレクト先に変更して遷移先を追加します。
   * @private
   */
  #updateHref() {
    this.atagList.forEach((atag) => {
      // クッションページを挟むべきでないatagの選別
      if (!this.#checkAtag(atag)) return;

      atag.dataset.toLink = atag.href;
      atag.href = this.#redirectUrl;
    });
  }

  /**
   * リダイレクトする必要があるatagかどうかをチェックします。
   * @private
   * @param {HTMLElement} atag - アンカー要素。
   * @returns {boolean} アンカー要素がリダイレクトする必要がある場合はtrue、それ以外の場合はfalse。
   */
  #checkAtag(atag) {
    if (
      atag.classList.contains("js__cushion") || // js__cushionクラスを持つ要素
      atag.pathname.includes("redirect") // リダイレクトページ
    )
      return true;
    // リダイレクト対象外の要素
    return !(
      (
        atag.href === "" || // href属性が空
        atag.href.startsWith(location.origin) || // 同一ドメイン（下層ページ）
        atag.href.startsWith("#") || // ページ内リンク
        atag.classList.contains("js__no_cushion")
      ) // js__no_cushionクラスを持つ
    );
  }

  /**
   * atagのリダイレクトを実行します。
   * @private
   */
  #run() {
    this.atagList.forEach((atag) => {
      if (!this.#checkAtag(atag)) return;

      atag.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.setItem("clickedDataset", JSON.stringify(atag.dataset));
        open(atag.href, "_blank");
      });
    });
  }
}

/**
 * 共通の機能を提供するためのユーティリティクラスです。
 */
class Utils {
  /**
   * 指定されたURLに一致する要素を取得します。
   * @static
   * @param {string} needle - 対象のURL。
   * @returns {NodeList} 対象の要素。
   */
  static getTargetList(needle) {
    const result = document.querySelectorAll(`a[href^='${needle}']`);
    if (result.length === 0) {
      console.log(`対象が見つかりませんでした(対象：${needle})`);
    }
    return result;
  }

  /**
   * 指定されたURLにパラメータを追加します。
   * @static
   * @param {string|URL} url - 変更するURL。
   * @param {string} key - パラメータのキー。
   * @param {string} value - パラメータの値。
   * @returns {string} 変更されたURL。
   */
  static addUrlParam(url, key, value) {
    if (!url) return;
    if (typeof url === "string") url = new URL(url);
    url.searchParams.set(key, value);
    return url.href;
  }
}
