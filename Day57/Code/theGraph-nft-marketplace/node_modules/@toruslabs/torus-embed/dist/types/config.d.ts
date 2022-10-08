import { EMBED_TRANSLATION_ITEM, IPaymentProvider, LocaleLinks } from "./interfaces";
declare const _default: {
    supportedVerifierList: ("google" | "facebook" | "twitch" | "reddit" | "discord" | "torus-auth0-email-passwordless")[];
    paymentProviders: {
        moonpay: IPaymentProvider;
        wyre: IPaymentProvider;
        rampnetwork: IPaymentProvider;
        xanpool: IPaymentProvider;
        mercuryo: IPaymentProvider;
        transak: IPaymentProvider;
    };
    api: string;
    translations: LocaleLinks<{
        embed: EMBED_TRANSLATION_ITEM;
    }>;
    prodTorusUrl: string;
    localStorageKeyPrefix: string;
};
export default _default;
