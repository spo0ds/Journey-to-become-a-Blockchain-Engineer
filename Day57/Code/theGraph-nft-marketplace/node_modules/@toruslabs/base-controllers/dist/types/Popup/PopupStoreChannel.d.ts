import { PopupStoreChannelHandlers } from "./interfaces";
export default class PopupStoreChannel {
    private handleLogout;
    private handleAccountImport;
    private handleNetworkChange;
    private handleThemeChange;
    private handleSelectedAddressChange;
    private instanceId;
    constructor({ instanceId, handleLogout, handleAccountImport, handleNetworkChange, handleSelectedAddressChange, handleThemeChange, }: {
        instanceId: string;
        handleLogout: PopupStoreChannelHandlers["handleLogout"];
        handleAccountImport: PopupStoreChannelHandlers["handleAccountImport"];
        handleNetworkChange: PopupStoreChannelHandlers["handleNetworkChange"];
        handleSelectedAddressChange: PopupStoreChannelHandlers["handleSelectedAddressChange"];
        handleThemeChange: PopupStoreChannelHandlers["handleThemeChange"];
    });
    setupStoreChannels(): void;
    private logoutChannel;
    private importAccountChannel;
    private networkChangeChannel;
    private themeChangedChannel;
    private selectedAddressChangeChannel;
}
