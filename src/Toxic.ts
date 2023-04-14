import Proxy from "./Proxy";
import {
  ICreateToxicBody,
  IGetToxicResponse,
  IUpdateToxicBody,
  IUpdateToxicResponse,
} from "./interfaces";

export type Direction = "upstream" | "downstream";

export type Type =
  | "latency"
  | "down"
  | "bandwidth"
  | "slow_close"
  | "timeout"
  | "slicer";

export interface Latency {
  latency: number;
  jitter: number;
}

export interface Down {}

export interface Bandwidth {
  rate: number;
}

export interface Slowclose {
  delay: number;
}

export interface Timeout {
  timeout: number;
}

export interface Slicer {
  average_size: number;
  size_variation: number;
  delay: number;
}

export type AttributeTypes =
  | Latency
  | Down
  | Bandwidth
  | Slowclose
  | Timeout
  | Slicer;

export interface ToxicJson<T> {
  name: string;
  type: Type;
  stream: Direction;
  toxicity: number;
  attributes: T;
}

export default class Toxic<T> {
  proxy: Proxy;

  name: string;
  type: Type;
  stream: Direction;
  toxicity: number;
  attributes: T;

  constructor(proxy: Proxy, body: ICreateToxicBody<T>) {
    this.proxy = proxy;
    this.parseBody(body);
  }

  parseBody(body: ICreateToxicBody<T>) {
    const { name, type, stream, toxicity, attributes } = body;
    this.name = name;
    this.type = type;
    this.stream = stream;
    this.toxicity = toxicity;
    this.attributes = attributes;
  }

  toJson(): ToxicJson<T> {
    return <ToxicJson<T>>{
      attributes: this.attributes,
      name: this.name,
      stream: this.stream,
      toxicity: this.toxicity,
      type: this.type,
    };
  }

  getHost() {
    return this.proxy.getHost();
  }

  getPath() {
    return `${this.proxy.getPath()}/toxics/${this.name}`;
  }

  async remove(): Promise<void> {
    const response = await fetch(this.getPath(), { method: "DELETE" });
    if (response.status !== 204) {
      throw new Error(
        `Response status was not 204 No Content: ${response.status} ${response.statusText}`
      );
    }

    for (const key in this.proxy.toxics) {
      const toxic = this.proxy.toxics[key];
      if (toxic.name === this.name) {
        delete this.proxy.toxics[key];
      }
    }
  }

  async refresh(): Promise<void> {
    const response = await fetch(this.getPath());
    if (!response.ok) {
      throw new Error(
        `Response status was not 200 OK: ${response.status} ${response.statusText}`
      );
    }
    const body = (await response.json()) as IGetToxicResponse<any>;
    this.parseBody(body);
  }

  async update(): Promise<void> {
    const body = <IUpdateToxicBody<T>>this.toJson();
    const response = await fetch(this.getPath(), {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `Response status was not 200 OK: ${response.status} ${response.statusText}`
      );
    }

    const responseBody = (await response.json()) as IUpdateToxicResponse<any>;
    this.parseBody(responseBody);
  }
}
