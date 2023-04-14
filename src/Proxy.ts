import Toxiproxy from "./Toxiproxy";
import Toxic, {
  AttributeTypes as ToxicAttributeTypes,
  ToxicJson,
} from "./Toxic";
import {
  ICreateProxyResponse,
  IGetProxyResponse,
  IUpdateProxyBody,
  IUpdateProxyResponse,
  ICreateToxicBody,
  ICreateToxicResponse,
  IGetToxicsResponse,
} from "./interfaces";

export interface ProxyJson {
  name: string;
  listen: string;
  upstream: string;
  enabled: boolean;
  toxics: ToxicJson<any>[];
}

export default class Proxy {
  toxiproxy: Toxiproxy;

  name: string;
  listen: string;
  upstream: string;
  enabled: boolean;
  toxics: Toxic<ToxicAttributeTypes>[];

  constructor(
    toxiproxy: Toxiproxy,
    body: ICreateProxyResponse | IGetProxyResponse
  ) {
    this.toxiproxy = toxiproxy;

    const { name, listen, upstream, enabled, toxics } = body;
    this.name = name;
    this.listen = listen;
    this.upstream = upstream;
    this.enabled = enabled;
    this.toxics = toxics.map(
      (v: any) => new Toxic<ToxicAttributeTypes>(this, v)
    );
    this.setToxics(toxics);
  }

  toJson(): ProxyJson {
    return <ProxyJson>{
      enabled: this.enabled,
      listen: this.listen,
      name: this.name,
      toxics: this.toxics.map((toxic) => toxic.toJson()),
      upstream: this.upstream,
    };
  }

  setToxics(toxics: IGetToxicsResponse<any>) {
    this.toxics = toxics.map(
      (v: any) => new Toxic<ToxicAttributeTypes>(this, v)
    );
  }

  getHost() {
    return this.toxiproxy.host;
  }

  getPath() {
    return `${this.getHost()}/proxies/${this.name}`;
  }

  async remove(): Promise<void> {
    const response = await fetch(this.getPath(), {
      method: "DELETE",
    });
    if (response.status != 204) {
      throw new Error(
        `Response status was not 204 No Content: ${response.status} ${response.statusText}`
      );
    }
  }

  async update(): Promise<Proxy> {
    const body = <IUpdateProxyBody>{
      enabled: this.enabled,
      listen: this.listen,
      upstream: this.upstream,
    };

    const resp = await fetch(this.getPath(), {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      throw new Error(
        `Response status was not ok: ${resp.status} ${resp.text()}`
      );
    }

    function isUpdateProxyResponse(r: any): r is IUpdateProxyResponse {
      return (
        r.name !== undefined &&
        r.listen !== undefined &&
        r.upstream !== undefined &&
        r.enabled !== undefined
      );
    }
    const json = await resp.json();
    if (!isUpdateProxyResponse(json)) {
      throw new Error(
        `Response body was not the expected response type: ${json}`
      );
    }

    return new Proxy(this.toxiproxy, json);
  }

  async refreshToxics(): Promise<void> {
    const resp = await fetch(`${this.getPath()}/toxics`);
    if (!resp.ok) {
      throw new Error(
        `Response status was not ok: ${resp.status} ${resp.text()}`
      );
    }
    const json = await resp.json();
    this.setToxics(json as IGetToxicsResponse<any>);
  }

  async addToxic<T>(body: ICreateToxicBody<T>): Promise<Toxic<T>> {
    const resp = await fetch(`${this.getPath()}/toxics`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      throw new Error(
        `Response status was not ok: ${resp.status} ${resp.text()}`
      );
    }
    const json = await resp.json();
    const responseBody = json as ICreateToxicResponse<any>;
    const toxic = new Toxic(this, responseBody);
    this.toxics.push(toxic);
    return toxic;
  }
}
