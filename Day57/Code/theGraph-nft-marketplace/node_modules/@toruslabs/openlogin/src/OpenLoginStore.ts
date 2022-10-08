import { storeKey } from "./constants";
import { IStore } from "./IStore";
import { MemoryStore } from "./MemoryStore";
import { localStorageAvailable, sessionStorageAvailable } from "./utils";

export default class OpenLoginStore {
  // eslint-disable-next-line no-use-before-define
  private static instance: OpenLoginStore;

  private _storeKey: string = storeKey;

  public storage: IStore;

  private constructor(storage: IStore, _storeKey?: string) {
    this.storage = storage;
    this._storeKey = _storeKey || storeKey;
    try {
      if (!storage.getItem(_storeKey || storeKey)) {
        this.resetStore();
      }
    } catch (error) {
      // Storage is not available
    }
  }

  static getInstance(storeNamespace: string, storageKey: "session" | "local" = "local"): OpenLoginStore {
    if (!this.instance) {
      let storage: Storage | MemoryStore = new MemoryStore();
      if (storageKey === "local" && localStorageAvailable) {
        storage = localStorage;
      }
      if (storageKey === "session" && sessionStorageAvailable) {
        storage = sessionStorage;
      }
      const finalStoreKey = storeNamespace ? `${storeKey}_${storeNamespace}` : storeKey;
      this.instance = new this(storage, finalStoreKey);
    }
    return this.instance;
  }

  toJSON(): string {
    return this.storage.getItem(this._storeKey);
  }

  resetStore(): Record<string, unknown> {
    const currStore = this.getStore();
    this.storage.setItem(this._storeKey, JSON.stringify({}));
    return currStore;
  }

  getStore(): Record<string, unknown> {
    return JSON.parse(this.storage.getItem(this._storeKey));
  }

  get<T>(key: string): T {
    const store = JSON.parse(this.storage.getItem(this._storeKey));
    return store[key];
  }

  set<T>(key: string, value: T): void {
    const store = JSON.parse(this.storage.getItem(this._storeKey));
    store[key] = value;
    this.storage.setItem(this._storeKey, JSON.stringify(store));
  }
}
