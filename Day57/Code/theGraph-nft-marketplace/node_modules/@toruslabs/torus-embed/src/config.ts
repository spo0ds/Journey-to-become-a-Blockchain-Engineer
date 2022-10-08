import { EMBED_TRANSLATION_ITEM, IPaymentProvider, LocaleLinks, PAYMENT_PROVIDER, SUPPORTED_PAYMENT_NETWORK, WALLET_VERIFIERS } from "./interfaces";
import { supportedFiatCurrencies } from "./supportedCurrencies";

const paymentProviders = {
  [PAYMENT_PROVIDER.MOONPAY]: {
    line1: "Credit/ Debit Card/ Apple Pay",
    line2: "4.5% or 5 USD",
    line3: "2,000€/day, 10,000€/mo",
    supportPage: "https://help.moonpay.io/en/",
    minOrderValue: 24.99,
    maxOrderValue: 50_000,
    validCurrencies: supportedFiatCurrencies(PAYMENT_PROVIDER.MOONPAY),
    validCryptoCurrenciesByChain: {
      [SUPPORTED_PAYMENT_NETWORK.MAINNET]: [
        { value: "aave", display: "AAVE" },
        { value: "bat", display: "BAT" },
        { value: "dai", display: "DAI" },
        { value: "eth", display: "ETH" },
        { value: "mkr", display: "MKR" },
        { value: "matic", display: "MATIC" },
        { value: "usdt", display: "USDT" },
        { value: "usdc", display: "USDC" },
      ],
      [SUPPORTED_PAYMENT_NETWORK.MATIC]: [
        { value: "eth_polygon", display: "ETH" },
        { value: "matic_polygon", display: "MATIC" },
        { value: "usdc_polygon", display: "USDC" },
      ],
      [SUPPORTED_PAYMENT_NETWORK.BSC_MAINNET]: [
        { value: "bnb_bsc", display: "BNB" },
        { value: "busd_bsc", display: "BUSD" },
      ],
      [SUPPORTED_PAYMENT_NETWORK.AVALANCHE_MAINNET]: [{ value: "avax_cchain", display: "AVAX" }],
    },
    includeFees: true,
    api: true,
    enforceMax: false,
  } as IPaymentProvider,
  [PAYMENT_PROVIDER.WYRE]: {
    line1: "Apple Pay/ Debit/ Credit Card",
    line2: "4.9% + 30¢ or 5 USD",
    line3: "$250/day",
    supportPage: "https://support.sendwyre.com/en/",
    minOrderValue: 5,
    maxOrderValue: 500,
    validCurrencies: supportedFiatCurrencies(PAYMENT_PROVIDER.WYRE),
    validCryptoCurrenciesByChain: {
      [SUPPORTED_PAYMENT_NETWORK.MAINNET]: [
        { value: "AAVE", display: "AAVE" },
        { value: "BAT", display: "BAT" },
        { value: "BUSD", display: "BUSD" },
        { value: "DAI", display: "DAI" },
        { value: "ETH", display: "ETH" },
        { value: "MKR", display: "MKR" },
        { value: "UNI", display: "UNI" },
        { value: "USDC", display: "USDC" },
        { value: "USDT", display: "USDT" },
      ],
      [SUPPORTED_PAYMENT_NETWORK.MATIC]: [{ value: "MUSDC", display: "USDC" }],
      // AVAXC? or AVAX?
      [SUPPORTED_PAYMENT_NETWORK.AVALANCHE_MAINNET]: [{ value: "AVAXC", display: "AVAXC" }],
    },
    includeFees: false,
    api: true,
    enforceMax: false,
  } as IPaymentProvider,
  [PAYMENT_PROVIDER.RAMPNETWORK]: {
    line1: "Debit Card/ <br>Apple Pay/ Bank transfer",
    line2: "0.49% - 2.9%",
    line3: "5,000€/purchase, 20,000€/mo",
    supportPage: "https://instant.ramp.network/",
    minOrderValue: 50,
    maxOrderValue: 20_000,
    validCurrencies: supportedFiatCurrencies(PAYMENT_PROVIDER.RAMPNETWORK),
    validCryptoCurrenciesByChain: {
      [SUPPORTED_PAYMENT_NETWORK.MAINNET]: [
        { value: "ETH", display: "ETH" },
        { value: "DAI", display: "DAI" },
        { value: "USDC", display: "USDC" },
        { value: "USDT", display: "USDT" },
      ],
      [SUPPORTED_PAYMENT_NETWORK.MATIC]: [
        { value: "MATIC_DAI", display: "DAI" },
        { value: "MATIC_MATIC", display: "MATIC" },
        { value: "MATIC_USDC", display: "USDC" },
      ],
      // what about AVAXC?
      [SUPPORTED_PAYMENT_NETWORK.AVALANCHE_MAINNET]: [{ value: "AVAX", display: "AVAX" }],
      // Temporary unavailable
      // [SUPPORTED_PAYMENT_NETWORK.XDAI]: [{ value: 'XDAI_XDAI', display: 'XDAI' }],
    },
    includeFees: true,
    api: true,
    receiveHint: "walletTopUp.receiveHintRamp",
    enforceMax: false,
  } as IPaymentProvider,
  [PAYMENT_PROVIDER.XANPOOL]: {
    line1: "PayNow/ InstaPay/ FPS/ GoJekPay/ UPI/ PromptPay/ <br>ViettelPay/ DuitNow",
    line2: "2.5% buying, 3% selling",
    line3: "$2,500 / day",
    supportPage: "mailto:support@xanpool.com",
    minOrderValue: 100,
    maxOrderValue: 2500,
    validCurrencies: supportedFiatCurrencies(PAYMENT_PROVIDER.XANPOOL),
    validCryptoCurrenciesByChain: {
      [SUPPORTED_PAYMENT_NETWORK.MAINNET]: [
        { value: "ETH", display: "ETH" },
        { value: "USDT", display: "USDT" },
      ],
    },
    includeFees: true,
    api: true,
    sell: true,
    enforceMax: false,
  } as IPaymentProvider,
  [PAYMENT_PROVIDER.MERCURYO]: {
    line1: "Credit/ Debit Card/ Apple Pay",
    line2: "3.95% or 4 USD",
    line3: "10,000€/day, 25,000€/mo",
    supportPage: "mailto:support@mercuryo.io",
    minOrderValue: 30,
    maxOrderValue: 5000,
    validCurrencies: supportedFiatCurrencies(PAYMENT_PROVIDER.MERCURYO),
    validCryptoCurrenciesByChain: {
      [SUPPORTED_PAYMENT_NETWORK.MAINNET]: [
        { value: "ETH", display: "ETH" },
        { value: "BAT", display: "BAT" },
        { value: "USDT", display: "USDT" },
        { value: "DAI", display: "DAI" },
      ],
      [SUPPORTED_PAYMENT_NETWORK.BSC_MAINNET]: [
        { value: "BNB", display: "BNB" },
        { value: "BUSD", display: "BUSD" },
        { value: "1INCH", display: "1INCH" },
      ],
    },
    includeFees: true,
    api: true,
    enforceMax: false,
  } as IPaymentProvider,
  [PAYMENT_PROVIDER.TRANSAK]: {
    line1: "Apple & Google Pay / Credit/Debit Card<br/>Bangkok Bank Mobile & iPay<br/>Bank Transfer (sepa/gbp) / SCB Mobile & Easy",
    line2: "0.99% - 5.5% or 5 USD",
    line3: "$5,000/day, $28,000/mo",
    supportPage: "https://support.transak.com/hc/en-US",
    minOrderValue: 30,
    maxOrderValue: 500,
    validCurrencies: supportedFiatCurrencies(PAYMENT_PROVIDER.TRANSAK),
    validCryptoCurrenciesByChain: {
      [SUPPORTED_PAYMENT_NETWORK.MAINNET]: [
        { value: "AAVE", display: "AAVE" },
        { value: "DAI", display: "DAI" },
        { value: "ETH", display: "ETH" },
        { value: "USDC", display: "USDC" },
        { value: "USDT", display: "USDT" },
      ],
      [SUPPORTED_PAYMENT_NETWORK.MATIC]: [
        { value: "AAVE", display: "AAVE" },
        { value: "DAI", display: "DAI" },
        { value: "MATIC", display: "MATIC" },
        { value: "USDC", display: "USDC" },
        { value: "USDT", display: "USDT" },
        { value: "WETH", display: "WETH" },
      ],
      [SUPPORTED_PAYMENT_NETWORK.BSC_MAINNET]: [
        { value: "BNB", display: "BNB" },
        { value: "BUSD", display: "BUSD" },
      ],
      [SUPPORTED_PAYMENT_NETWORK.AVALANCHE_MAINNET]: [{ value: "AVAX", display: "AVAX" }],
    },
    includeFees: true,
    enforceMax: true,
  } as IPaymentProvider,
};

const translations = {
  en: {
    embed: {
      continue: "Continue",
      actionRequired: "Authorization required",
      pendingAction: "Click continue to proceed with your request in a popup",
      cookiesRequired: "Cookies Required",
      enableCookies: "Please enable cookies in your browser preferences to access Torus",
      clickHere: "More Info",
    },
  },
  de: {
    embed: {
      continue: "Fortsetzen",
      actionRequired: "Autorisierung erforderlich",
      pendingAction: "Klicken Sie in einem Popup auf Weiter, um mit Ihrer Anfrage fortzufahren",
      cookiesRequired: "Cookies benötigt",
      enableCookies: "Bitte aktivieren Sie Cookies in Ihren Browsereinstellungen, um auf Torus zuzugreifen",
      clickHere: "Mehr Info",
    },
  },
  ja: {
    embed: {
      continue: "継続する",
      actionRequired: "認証が必要です",
      pendingAction: "続行をクリックして、ポップアップでリクエストを続行します",
      cookiesRequired: "必要なクッキー",
      enableCookies: "Torusにアクセスするには、ブラウザの設定でCookieを有効にしてください。",
      clickHere: "詳しくは",
    },
  },
  ko: {
    embed: {
      continue: "계속하다",
      actionRequired: "승인 필요",
      pendingAction: "팝업에서 요청을 진행하려면 계속을 클릭하십시오.",
      cookiesRequired: "쿠키 필요",
      enableCookies: "브라우저 환경 설정에서 쿠키를 활성화하여 Torus에 액세스하십시오.",
      clickHere: "더 많은 정보",
    },
  },
  zh: {
    embed: {
      continue: "继续",
      actionRequired: "需要授权",
      pendingAction: "单击继续以在弹出窗口中继续您的请求",
      cookiesRequired: "必填Cookie",
      enableCookies: "请在您的浏览器首选项中启用cookie以访问Torus。",
      clickHere: "更多信息",
    },
  },
} as LocaleLinks<{ embed: EMBED_TRANSLATION_ITEM }>;

export default {
  supportedVerifierList: Object.values(WALLET_VERIFIERS),
  paymentProviders,
  api: "https://api.tor.us",
  translations,
  prodTorusUrl: "",
  localStorageKeyPrefix: `torus-`,
};
