import { BroadcastChannel } from "@toruslabs/broadcast-channel";
import log from "loglevel";

import { BROADCAST_CHANNELS, BROADCAST_CHANNELS_MSGS } from "../enums";
import { broadcastChannelOptions } from "../utils";
import {
  AccountImportedChannelData,
  BasePopupChannelData,
  NetworkChangeChannelData,
  PopupData,
  PopupStoreChannelHandlers,
  SelectedAddresssChangeChannelData,
  ThemeChannelData,
} from "./interfaces";

export default class PopupStoreChannel {
  private handleLogout: PopupStoreChannelHandlers["handleLogout"];

  private handleAccountImport: PopupStoreChannelHandlers["handleAccountImport"];

  private handleNetworkChange: PopupStoreChannelHandlers["handleNetworkChange"];

  private handleThemeChange: PopupStoreChannelHandlers["handleThemeChange"];

  private handleSelectedAddressChange: PopupStoreChannelHandlers["handleSelectedAddressChange"];

  private instanceId: string;

  constructor({
    instanceId,
    handleLogout,
    handleAccountImport,
    handleNetworkChange,
    handleSelectedAddressChange,
    handleThemeChange,
  }: {
    instanceId: string;
    handleLogout: PopupStoreChannelHandlers["handleLogout"];
    handleAccountImport: PopupStoreChannelHandlers["handleAccountImport"];
    handleNetworkChange: PopupStoreChannelHandlers["handleNetworkChange"];
    handleSelectedAddressChange: PopupStoreChannelHandlers["handleSelectedAddressChange"];
    handleThemeChange: PopupStoreChannelHandlers["handleThemeChange"];
  }) {
    this.instanceId = instanceId;
    this.handleLogout = handleLogout;
    this.handleAccountImport = handleAccountImport;
    this.handleNetworkChange = handleNetworkChange;
    this.handleSelectedAddressChange = handleSelectedAddressChange;
    this.handleThemeChange = handleThemeChange;
  }

  public setupStoreChannels(): void {
    this.logoutChannel();
    this.importAccountChannel();
    this.networkChangeChannel();
    this.selectedAddressChangeChannel();
    this.themeChangedChannel();
  }

  private logoutChannel(): void {
    const logoutChannel = new BroadcastChannel<PopupData<BasePopupChannelData>>(
      `${BROADCAST_CHANNELS.WALLET_LOGOUT_CHANNEL}_${this.instanceId}`,
      broadcastChannelOptions
    );
    logoutChannel.addEventListener("message", (ev) => {
      log.info("received logout message", ev);
      if (!ev.error && ev.data?.type === BROADCAST_CHANNELS_MSGS.LOGOUT) {
        log.info("Logging Out");
        this.handleLogout();
      }
    });
  }

  private importAccountChannel(): void {
    const walletAccountImportChannel = new BroadcastChannel<PopupData<AccountImportedChannelData>>(
      `${BROADCAST_CHANNELS.WALLET_ACCOUNT_IMPORT_CHANNEL}_${this.instanceId}`,
      broadcastChannelOptions
    );
    walletAccountImportChannel.addEventListener("message", (ev) => {
      if (!ev.error && ev.data?.type === BROADCAST_CHANNELS_MSGS.ACCOUNT_IMPORTED) {
        this.handleAccountImport(ev.data?.privKey);
      }
    });
  }

  private networkChangeChannel(): void {
    const walletAccountImportChannel = new BroadcastChannel<PopupData<NetworkChangeChannelData>>(
      `${BROADCAST_CHANNELS.WALLET_NETWORK_CHANGE_CHANNEL}_${this.instanceId}`,
      broadcastChannelOptions
    );
    walletAccountImportChannel.addEventListener("message", (ev) => {
      if (!ev.error && ev.data?.type === BROADCAST_CHANNELS_MSGS.NETWORK_CHANGE) {
        this.handleNetworkChange(ev.data?.network);
      }
    });
  }

  private themeChangedChannel(): void {
    const walletAccountImportChannel = new BroadcastChannel<PopupData<ThemeChannelData>>(
      `${BROADCAST_CHANNELS.THEME_CHANGE}_${this.instanceId}`,
      broadcastChannelOptions
    );
    walletAccountImportChannel.addEventListener("message", (ev) => {
      log.info({ ev });
      if (!ev.error && ev.data?.type === BROADCAST_CHANNELS_MSGS.SET_THEME) {
        this.handleThemeChange(ev.data?.theme);
      }
    });
  }

  private selectedAddressChangeChannel(): void {
    const walletAccountImportChannel = new BroadcastChannel<PopupData<SelectedAddresssChangeChannelData>>(
      `${BROADCAST_CHANNELS.WALLET_SELECTED_ADDRESS_CHANNEL}_${this.instanceId}`,
      broadcastChannelOptions
    );
    walletAccountImportChannel.addEventListener("message", (ev) => {
      if (!ev.error && ev.data?.type === BROADCAST_CHANNELS_MSGS.SELECTED_ADDRESS_CHANGE) {
        this.handleSelectedAddressChange(ev.data?.selectedAddress);
      }
    });
  }
}
