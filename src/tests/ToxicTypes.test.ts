import { createProxy, createToxic } from "../TestHelper";
import { Latency } from "../Toxic";
require("isomorphic-fetch");
import { randomUUID } from "crypto";

test("Toxic Should remove a toxic", async () => {
  const uuid = randomUUID();
  const { proxy } = await createProxy(`remove-toxic-test-${uuid}`);

  const attributes = { latency: 1000, jitter: 100 } as Latency;
  const toxic = await createToxic(proxy, "latency", attributes);
  await toxic.remove();

  // verifying that the toxic has been removed from the proxy's toxic list
  const hasToxic = proxy.toxics.reduce((hasToxic, proxyToxic) => {
    if (toxic.name === proxyToxic.name) {
      return true;
    }

    return hasToxic;
  }, false);
  expect(hasToxic).toBe(false);

  return proxy.remove();
});

test("Toxic Should refresh", async () => {
  const uuid = randomUUID();
  const { proxy } = await createProxy(`refresh-toxic-test-${uuid}`);

  const attributes = { latency: 1000, jitter: 100 } as Latency;
  const toxic = await createToxic(proxy, "latency", attributes);

  const prevToxicity = toxic.toxicity;
  toxic.toxicity = 5;
  await toxic.refresh();
  expect(prevToxicity).toEqual(toxic.toxicity);

  return proxy.remove();
});

test("Toxic Should update", async () => {
  const uuid = randomUUID();
  const { proxy } = await createProxy(`refresh-toxic-test-${uuid}`);

  const attributes = { latency: 1000, jitter: 100 } as Latency;
  const toxic = await createToxic(proxy, "latency", attributes);
  const newLatency = (toxic.attributes.latency = 2000);
  await toxic.update();
  expect(newLatency).toEqual(toxic.attributes.latency);

  return proxy.remove();
});
