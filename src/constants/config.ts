import AppLogo from "@/assets/app/logo.png";
export const APP_CONFIG = {
  prefixStore: "sicerdas",
  isDev: false,
  dayFormat: "yyyy-MM-dd",
  app: {
    name: "SiCerdas",
    description: "SiCerdas",
    logo: AppLogo,
    version: "1.0.0",
  },
  demoUser: {
    email: "",
    password: "",
  },
  path: {
    defaultPublic: "/login",
    defaultPrivate: "/",
  },
  cloud: 'https://s3.nevaobjects.id/sicerdas'
}