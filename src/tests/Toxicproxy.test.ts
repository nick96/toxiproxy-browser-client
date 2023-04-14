import { createProxy, toxiproxyUrl } from "../TestHelper";
import Toxiproxy from "../Toxiproxy";
require("isomorphic-fetch");
import { randomUUID } from "crypto";

test("Toxiproxy Should create a proxy", async () => {
  const uuid = randomUUID();
  const { proxy } = await createProxy(`create-test-${uuid}`);

  return proxy.remove();
});

test("Toxiproxy Should get a proxy", async () => {
  const uuid = randomUUID();
  const { proxy: createdProxy, toxiproxy } = await createProxy(
    `get-test-${uuid}`
  );

  const fetchedProxy = await toxiproxy.get(createdProxy.name);
  expect(createdProxy.name).toEqual(fetchedProxy.name);

  return createdProxy.remove();
});

test("Toxiproxy Should get version", async () => {
  const toxiproxy = new Toxiproxy(toxiproxyUrl);

  return toxiproxy.getVersion();
});

test("Toxiproxy Should reset", async () => {
  const toxiproxy = new Toxiproxy(toxiproxyUrl);

  return toxiproxy.reset();
});

test("Toxiproxy Should populate", async () => {
  const toxiproxy = new Toxiproxy(toxiproxyUrl);

  const uuid = randomUUID();
  const proxyName = `get-all-test-${uuid}`;
  const proxyBodies = {};
  proxyBodies[proxyName] = {
    listen: "localhost:0",
    name: proxyName,
    upstream: "localhost:6379",
  };

  const populateBody = Object.keys(proxyBodies).map(
    (name) => proxyBodies[name]
  );
  const proxies = await toxiproxy.populate(populateBody);

  // clearing them all out
  return Promise.all(
    Object.keys(proxies).map((name) => proxies[name].remove())
  );
});

test("Toxiproxy Should get all proxies", async () => {
  const toxiproxy = new Toxiproxy(toxiproxyUrl);

  const uuid = randomUUID();
  const proxyName = `get-all-test-${uuid}`;
  const proxyBodies = {};
  proxyBodies[proxyName] = {
    listen: "localhost:0",
    name: proxyName,
    upstream: "localhost:6379",
  };
  const populateBody = Object.keys(proxyBodies).map(
    (name) => proxyBodies[name]
  );
  await toxiproxy.populate(populateBody);

  // fetching them all
  const proxies = await toxiproxy.getAll();
  for (const proxyName in proxyBodies) {
    debugger;
    expect(proxyBodies[proxyName].name).toBe(proxies[proxyName].name);
  }

  // clearing them all out
  return Promise.all(
    Object.keys(proxies).map((name) => proxies[name].remove())
  );
});
