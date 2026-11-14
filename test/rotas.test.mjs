// Testes de integração: rodam contra o servidor em execução (npm start) com um banco MySQL real.
// Uso: npm test  (BASE_URL opcional, padrão http://localhost:3000)
import { test, after } from "node:test";
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const JSON_HEADERS = { "Content-Type": "application/json" };
const criados = [];

const req = (caminho, opcoes = {}) => fetch(BASE + caminho, { redirect: "manual", ...opcoes });
const ordemValida = (extra = {}) => ({
  cliente: "Cliente Teste", veiculo: "Fiat Uno 2015", placa: "TST1A23", descricao: "Troca de óleo", valor: "180.50", ...extra,
});

async function criarOrdem(dados = ordemValida()) {
  const r = await req("/servicos", { method: "POST", body: new URLSearchParams(dados) });
  const id = Number(r.headers.get("location")?.match(/servicos\/(\d+)/)?.[1]);
  if (id) criados.push(id);
  return { r, id };
}

after(async () => {
  for (const id of criados) await req(`/servicos/${id}`, { method: "DELETE" });
});

test("CREATE: POST /servicos grava e redireciona para a ordem", async () => {
  const { r, id } = await criarOrdem();
  assert.equal(r.status, 302);
  assert.ok(id > 0);
  const ordem = await (await req(`/api/servicos/${id}`)).json();
  assert.equal(ordem.cliente, "Cliente Teste");
  assert.equal(ordem.valor, "180.5");
});

test("READ: listagem e detalhes respondem em HTML", async () => {
  const { id } = await criarOrdem();
  const lista = await req("/servicos");
  assert.equal(lista.status, 200);
  assert.match(lista.headers.get("content-type"), /text\/html/);
  const detalhes = await req(`/servicos/${id}`);
  assert.equal(detalhes.status, 200);
  assert.match(await detalhes.text(), /Fiat Uno 2015/);
});

test("READ: API responde em JSON", async () => {
  const { id } = await criarOrdem();
  const lista = await req("/api/servicos");
  assert.equal(lista.status, 200);
  assert.match(lista.headers.get("content-type"), /application\/json/);
  assert.ok((await lista.json()).some((s) => s.id === id));
});

test("UPDATE: PUT real e PUT via formulário (method-override)", async () => {
  const { id } = await criarOrdem();
  let r = await req(`/servicos/${id}`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify(ordemValida({ cliente: "Via PUT" })) });
  assert.equal(r.status, 302);
  assert.equal((await (await req(`/api/servicos/${id}`)).json()).cliente, "Via PUT");
  r = await req(`/servicos/${id}?_method=PUT`, { method: "POST", body: new URLSearchParams(ordemValida({ cliente: "Via formulário" })) });
  assert.equal(r.status, 302);
  assert.equal((await (await req(`/api/servicos/${id}`)).json()).cliente, "Via formulário");
});

test("DELETE: exclui uma vez e a segunda tentativa devolve 404", async () => {
  const { id } = await criarOrdem();
  assert.equal((await req(`/servicos/${id}`, { method: "DELETE" })).status, 302);
  assert.equal((await req(`/api/servicos/${id}`)).status, 404);
  assert.equal((await req(`/servicos/${id}`, { method: "DELETE" })).status, 404);
});

test("DELETE: dois pedidos simultâneos, só um exclui", async () => {
  const { id } = await criarOrdem();
  const status = (await Promise.all([1, 2].map(() => req(`/servicos/${id}`, { method: "DELETE" })))).map((r) => r.status).sort();
  assert.deepEqual(status, [302, 404]);
});

test("GET com ?_method=DELETE não exclui", async () => {
  const { id } = await criarOrdem();
  await req(`/servicos/${id}?_method=DELETE`);
  assert.equal((await req(`/api/servicos/${id}`)).status, 200);
});

test("Validação: dados inválidos devolvem 400", async () => {
  const invalidos = [
    {}, ordemValida({ cliente: "   " }), ordemValida({ valor: "abc" }), ordemValida({ valor: "-1" }),
    ordemValida({ valor: "1e3" }), ordemValida({ placa: "ABCDEFGHIJK" }), ordemValida({ descricao: "x".repeat(2001) }),
  ];
  for (const dados of invalidos) {
    const r = await req("/servicos", { method: "POST", body: new URLSearchParams(dados) });
    if (r.status === 302) criados.push(Number(r.headers.get("location").match(/\d+/)[0]));
    assert.equal(r.status, 400, `esperava 400 para ${JSON.stringify(dados).slice(0, 60)}`);
  }
});

test("Erros: id inválido 400, inexistente 404, JSON malformado 400, corpo grande 413", async () => {
  for (const id of ["abc", "1abc", "-1", "0"]) {
    const r = await req(`/api/servicos/${id}`);
    assert.equal(r.status, 400);
    assert.deepEqual(await r.json(), { erro: "ID inválido." });
  }
  assert.equal((await req("/api/servicos/2147483647")).status, 404);
  assert.equal((await req("/servicos/2147483647", { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify(ordemValida()) })).status, 404);
  assert.equal((await req("/rota-que-nao-existe")).status, 404);
  assert.equal((await req("/servicos", { method: "POST", headers: JSON_HEADERS, body: "{quebrado" })).status, 400);
  assert.equal((await req("/servicos", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(ordemValida({ descricao: "x".repeat(200000) })) })).status, 413);
});

test("Segurança: HTML digitado é escapado nas páginas", async () => {
  const { id } = await criarOrdem(ordemValida({ cliente: "<script>alert(1)</script>" }));
  for (const caminho of ["/servicos", `/servicos/${id}`, `/servicos/${id}/editar`]) {
    assert.ok(!(await (await req(caminho)).text()).includes("<script>alert(1)</script>"), caminho);
  }
});

test("Páginas: painel, formulário e documentação abrem", async () => {
  for (const caminho of ["/", "/servicos/novo", "/documentacao"]) {
    assert.equal((await req(caminho)).status, 200, caminho);
  }
});
