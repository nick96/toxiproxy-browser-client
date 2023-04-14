import Proxy from "./Proxy";
import {
  ICreateProxyBody,
  ICreateProxyResponse,
  IGetProxyResponse,
  IPopulateProxiesBody,
  IPopulateProxiesResponse,
  IGetProxiesResponse,
} from "./interfaces";

export interface Proxies {
  [name: string]: Proxy;
}

export default class Toxiproxy {
  host: string;
  constructor(host: string) {
    this.host = host;
  }

  async createProxy(body: ICreateProxyBody): Promise<Proxy> {
    const resp = await fetch(`${this.host}/proxies`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (resp.status == 409) {
      throw new Error(`Proxy ${body.name} already exists`);
    } else if (resp.status != 201) {
      throw new Error(
        `Response status was not 201 Created: ${resp.status} ${resp.statusText}`
      );
    }
    const proxy = (await resp.json()) as ICreateProxyResponse;
    return new Proxy(this, proxy);
  }

  async populate(body: IPopulateProxiesBody): Promise<Proxies> {
    const resp = await fetch(`${this.host}/populate`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (resp.status != 201) {
      throw new Error(
        `Response status was not 201 Created: ${resp.status} ${resp.statusText}`
      );
    }
    const responseBody = (await resp.json()) as IPopulateProxiesResponse;
    const proxies: Proxies = {};
    for (const proxy of responseBody.proxies) {
      proxies[proxy.name] = new Proxy(this, proxy);
    }
    return proxies;
  }

  async get(name: string): Promise<Proxy> {
    const resp = await fetch(`${this.host}/proxies/${name}`);
    if (!resp.ok) {
      throw new Error(
        `Response status was not 200 OK: ${resp.status} ${resp.statusText}`
      );
    }
    const body = (await resp.json()) as IGetProxyResponse;
    return new Proxy(this, body);
  }

  async getVersion(): Promise<string> {
    const resp = await fetch(`${this.host}/version`);
    const version = await resp.text();
    return version;
  }

  async reset(): Promise<void> {
    const resp = await fetch(`${this.host}/reset`, { method: "POST" });
    if (resp.status !== 204) {
      throw new Error(
        `Response status was not 204 No Content: ${resp.status} ${resp.statusText}`
      );
    }
  }

  async getAll(): Promise<Proxies> {
    const resp = await fetch(`${this.host}/proxies`);
    if (resp.status !== 200) {
      throw new Error(
        `Response status was not 200 OK: ${resp.status} ${resp.statusText}`
      );
    }
    const body = (await resp.json()) as IGetProxiesResponse;
    const proxies: Proxies = {};
    for (const name in body) {
      proxies[name] = new Proxy(this, body[name]);
    }
    return proxies;
  }
}
