import { createProxy, createToxic } from "../TestHelper";
import { Latency } from "../Toxic";
import { randomUUID } from "crypto";
require("isomorphic-fetch");

test("Proxy Should update a proxy", async () => {
  const uuid = randomUUID();
  const { proxy } = await createProxy(`update-proxy-test-${uuid}`);

  proxy.enabled = false;
  const updatedProxy = await proxy.update();
  expect(proxy.enabled).toBe(updatedProxy.enabled);

  return proxy.remove();
});

test("Proxy Should remove a proxy", async () => {
  const { proxy } = await createProxy("remove-test");

  return proxy.remove();
});

test("Proxy Should refresh toxics", async () => {
  const uuid = randomUUID();
  const { proxy } = await createProxy(`remove-test-${uuid}`);

  const attributes = { latency: 1000, jitter: 100 } as Latency;
  const toxic = await createToxic(proxy, "latency", attributes);
  await proxy.refreshToxics();
  const hasToxic = proxy.toxics.reduce((hasToxic, proxyToxic) => {
    if (proxyToxic.name === toxic.name) {
      return true;
    }

    return hasToxic;
  }, false);
  expect(hasToxic).toBe(true);

  return proxy.remove();
});
