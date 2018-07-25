import assert from 'power-assert';
import 'mocha/mocha';
import '../src/app';

mocha.setup({
  ui: 'bdd',
  reporter: 'json'
});

describe('sample spec', () => {
  it('check variable', () => {
    window.func();
    assert.equal(1 + 1, 2);
  });
});

mocha.run()
.on('end', (failures) => {
  window.__mocha__ = mocha.testResults;
});
