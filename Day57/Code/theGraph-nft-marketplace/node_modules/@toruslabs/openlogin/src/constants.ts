export const modalDOMElementID = "openlogin-modal";

export const storeKey = "openlogin_store";

export const UX_MODE = {
  POPUP: "popup",
  REDIRECT: "redirect",
} as const;

export const OPENLOGIN_METHOD = {
  LOGIN: "openlogin_login",
  LOGOUT: "openlogin_logout",
  CHECK_3PC_SUPPORT: "openlogin_check_3PC_support",
  SET_PID_DATA: "openlogin_set_pid_data",
  GET_DATA: "openlogin_get_data",
} as const;

export const ALLOWED_INTERACTIONS = {
  POPUP: "popup",
  REDIRECT: "redirect",
  JRPC: "jrpc",
} as const;

export const OPENLOGIN_NETWORK = {
  MAINNET: "mainnet",
  TESTNET: "testnet",
  CYAN: "cyan",
  DEVELOPMENT: "development",
} as const;

export const SUPPORTED_KEY_CURVES = {
  SECP256K1: "secp256k1",
  ED25519: "ed25519",
} as const;

export const LOGIN_PROVIDER = {
  GOOGLE: "google",
  FACEBOOK: "facebook",
  REDDIT: "reddit",
  DISCORD: "discord",
  TWITCH: "twitch",
  APPLE: "apple",
  LINE: "line",
  GITHUB: "github",
  KAKAO: "kakao",
  LINKEDIN: "linkedin",
  TWITTER: "twitter",
  WEIBO: "weibo",
  WECHAT: "wechat",
  EMAIL_PASSWORDLESS: "email_passwordless",
  WEBAUTHN: "webauthn",
  JWT: "jwt",
} as const;

export const MFA_LEVELS = {
  DEFAULT: "default",
  OPTIONAL: "optional",
  MANDATORY: "mandatory",
  NONE: "none",
} as const;
