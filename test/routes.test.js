const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../app');

let server;
let baseUrl;

function getBuffer(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}${urlPath}`, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks)
        });
      });
    }).on('error', reject);
  });
}

describe('scih-nuvem binary and health routes', () => {
  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('GET /health returns status ok and file presence flags', async () => {
    const res = await getBuffer('/health');
    assert.equal(res.statusCode, 200);
    const json = JSON.parse(res.body.toString('utf8'));
    assert.deepEqual(json, {
      status: 'ok',
      arquivos: {
        pdf: true,
        reporteXlsx: true,
        relatorioPermanenciaXls: true
      }
    });
  });

  for (const route of ['/real/reporte', '/real/planilha']) {
    it(`GET ${route} returns Reporte_Exemplo_Mock.xlsx with valid headers and PK signature`, async () => {
      const res = await getBuffer(route);
      assert.equal(res.statusCode, 200);
      assert.match(res.headers['content-type'], /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/);
      assert.equal(res.headers['content-disposition'], 'attachment; filename="Reporte_Exemplo_Mock.xlsx"');
      assert.equal(res.headers['cache-control'], 'no-store');
      assert.equal(res.body.length, 21170);
      assert.equal(res.body[0], 0x50);
      assert.equal(res.body[1], 0x4B);
    });
  }

  for (const route of ['/integrasus/relatorio-permanencia', '/integrasus/planilha']) {
    it(`GET ${route} returns relatorio_permanencia_Exemplo_Mock.xls with valid headers and OLE2 signature`, async () => {
      const res = await getBuffer(route);
      assert.equal(res.statusCode, 200);
      assert.match(res.headers['content-type'], /application\/vnd\.ms-excel/);
      assert.equal(res.headers['content-disposition'], 'attachment; filename="relatorio_permanencia_Exemplo_Mock.xls"');
      assert.equal(res.headers['cache-control'], 'no-store');
      assert.equal(res.body.length, 34304);
      assert.deepEqual([...res.body.subarray(0, 4)], [0xD0, 0xCF, 0x11, 0xE0]);
    });
  }

  for (const route of ['/real/laudos', '/real/laudos/PRT-001234']) {
    it(`GET ${route} returns r.e.a.l_exemplo-1.pdf with valid headers and %PDF- signature`, async () => {
      const res = await getBuffer(route);
      assert.equal(res.statusCode, 200);
      assert.match(res.headers['content-type'], /application\/pdf/);
      assert.equal(res.headers['content-disposition'], 'inline; filename="r.e.a.l_exemplo-1.pdf"');
      assert.equal(res.headers['cache-control'], 'no-store');
      assert.equal(res.body.subarray(0, 5).toString('ascii'), '%PDF-');
    });
  }

  it('GET /real/rota-inexistente returns JSON 404 error', async () => {
    const res = await getBuffer('/real/rota-inexistente');
    assert.equal(res.statusCode, 404);
    assert.match(res.headers['content-type'], /application\/json/);
    const json = JSON.parse(res.body.toString('utf8'));
    assert.ok(json.erro);
  });
});
