const path = require('path');
const webpack = require("webpack");
const connect = require("connect");
const serveStatic = require('serve-static');
const MemoryFs = require("memory-fs");
const puppeteer = require('puppeteer');

const fs = new MemoryFs();

// 1. テスト対象をwebpackビルド
// 2. ビルド結果はオンメモリ
// 3. connectサーバを起動
// ---- ここまでで、テスト対象が動くダミーのhtmlが見れる状態になってる
//      - ブラウザで見れる
//      - テストは特に何も動かない
// 4. mochaを実行
// ---- ここまでがこのスクリプト内の仕事
// 5. mochaからpupetterを利用してテストを実行する
// 6. json-reporterで出力されているので、それをevaluateで拾い上げる

const config = require(path.resolve('webpack.config.js'));

config.entry = path.resolve('spec/spec.js');
config.output = {
  path: '/',
  filename: 'bundle.js',
};
config.mode = 'development';
config.devtool = 'inline-source-map';

const compiler = webpack(config);
compiler.outputFileSystem = fs;

const runTest = async () => {
  let server = null;

  try {
    const app = connect();
    app.use("/bundle.js", (req, res) => res.end(fs.readFileSync("/bundle.js")));
    app.use(serveStatic(path.resolve('spec/')));
    server = app.listen(30001);;  

    // puppeteerでアクセスして結果を待つ
    // window.__result に入ってるはず
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
      for (let i = 0; i < msg.args().length; ++i)
        console.log(`${i}: ${msg.args()[i]}`);
    });

    await page.goto('http://localhost:30001/');

    await page.waitForFunction(() => window.__mocha__);

    const result = await page.evaluate(() => window.__mocha__);

    console.log(result);

    browser.close()

  } catch(e) {
    return 'fail';
  } finally {
    if (server) {
      server.close();
    }
  }

  return 'done';
}

compiler.run((err, stats) => {
  if (err || stats.hasErrors()) {
    console.error(err);
    return;
  }

  runTest();
});
