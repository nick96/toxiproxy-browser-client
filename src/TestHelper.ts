import { ContextualTestContext } from "ava";
import Toxiproxy from "./Toxiproxy";
import Proxy from "./Proxy";
import Toxic, { AttributeTypes as ToxicAttributeTypes } from "./Toxic";
import { ICreateProxyBody, ICreateToxicBody } from "./interfaces";
// import Toxic, { Type as ToxicType, IBody as IToxicBody } from "../src/Toxic";

export interface ICreateProxyHelper {
  proxy: Proxy;
  toxiproxy: Toxiproxy;
}

export const toxiproxyUrl = "http://localhost:8474";

export const createProxy = async (t: ContextualTestContext, name: string): Promise<ICreateProxyHelper> => {
  const toxiproxy = new Toxiproxy(toxiproxyUrl);
  const body = <ICreateProxyBody>{
    listen: "localhost:0",
    name: name,
    upstream: "localhost:6379"
  };
  const proxy = await toxiproxy.createProxy(body);
  t.is(body.name, proxy.name);

  return { proxy, toxiproxy };
};

export const createToxic = async (t: ContextualTestContext, proxy: Proxy, type: string, attributes: ToxicAttributeTypes): Promise<Toxic<ToxicAttributeTypes>> => {
  const body = <ICreateToxicBody<ToxicAttributeTypes>>{
    attributes: attributes,
    type: type
  };

  const toxic = <Toxic<ToxicAttributeTypes>>await proxy.addToxic(body);
  t.is(body.type, toxic.type);

  const hasToxic = proxy.toxics.reduce((hasToxic, v) => {
    if (hasToxic) {
      return hasToxic;
    }

    if (toxic.name === v.name) {
      return true;
    }

    return hasToxic;
  }, false);
  t.is(true, hasToxic);

  return toxic;
};