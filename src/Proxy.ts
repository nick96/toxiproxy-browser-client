/// <reference path="../typings/main.d.ts" />
import * as request from "superagent";
import * as HttpStatus from "http-status";
import { Promise } from "es6-promise";
import Toxiproxy from "./Toxiproxy";

export default class Proxy {
  toxiproxy: Toxiproxy;

  name: string;
  listen: string;
  upstream: string;
  enabled: boolean;
  upstream_toxics: any;
  downstream_toxics: any;

  constructor(toxiproxy: Toxiproxy, body: any) {
    this.toxiproxy = toxiproxy;

    const { name, listen, upstream, enabled, upstream_toxics, downstream_toxics } = body;
    this.name = name;
    this.listen = listen;
    this.upstream = upstream;
    this.enabled = enabled;
    this.upstream_toxics = upstream_toxics;
    this.downstream_toxics = downstream_toxics;
  }

  getHost() {
      return this.toxiproxy.host;
  }

  remove(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      request
        .delete(`${this.getHost()}/proxies/${this.name}`)
        .end((err, res) => {
          if (err) {
            reject(new Error(err.response.error.text));
            return;
          } else if (res.status !== HttpStatus.NO_CONTENT) {
            reject(new Error(`Response status was not ${HttpStatus.OK}: ${res.status}`));
            return;
          }

          resolve();
        });
    });
  }

  update(): Promise<Proxy> {
    return new Promise<Proxy>((resolve, reject) => {
      const payload = {
        enabled: this.enabled,
        listen: this.listen,
        name: this.name,
        upstream: this.upstream
      };
      request
        .post(`${this.getHost()}/proxies/${this.name}`)
        .send(payload)
        .end((err, res) => {
          if (err) {
            reject(err);
            return;
          } else if (res.status !== HttpStatus.OK) {
            reject(new Error(`Response status was not ${HttpStatus.OK}: ${res.status}`));
            return;
          }

          resolve(new Proxy(this.toxiproxy, res.body));
        });
    });
  }
}