import AppLogo from "../assets/app/logo.png";
export const APP_CONFIG = {
  prefixStore: "sicerdas",
  isDev: false,
  dayFormat: "yyyy-MM-dd",
  app: {
    name: "SiCerdas",
    description: "SiCerdas",
    logo: AppLogo,
    version: "1.0.0",
    mailTo: "totosugito@gmail.com",
    discord: "https://discord.gg/fahimedu",
    playStore: "https://play.google.com/store/apps/details?id=fahim_edu.bse",
    youtubeChannel: "https://www.youtube.com/@fahim_edu",
    youtubeDemo: "https://youtu.be/N0OoWUIwYZM",
    androidImages: [
      'https://play-lh.googleusercontent.com/diMgdPI72CC1slQcMxmSRzLEPNNAvotZQQupK0e64tTjmJwatHcv3hV24_RGrfQY3ZQ',
      'https://play-lh.googleusercontent.com/G8qnro6AyGsqr5wXN19cZRKN4nmRZR3vdbYjR_57z0A3tCjf6pPgkWpn5j3reWSesnM',
      'https://play-lh.googleusercontent.com/ZuGzWJl31CAkaBvNlJ3dnb9RxbAi0Qgwfmvb4DjMO8ZS56z2YDZ8YHTmp9y01jjOQE4',
      'https://play-lh.googleusercontent.com/D3cdvy1gi3ZMTaKb_qpFlAWMeTBLKVPp1-qCmzu9izCr10g_r5fUimRsOX4Ncj_RVYs',
      'https://play-lh.googleusercontent.com/r1dAwUEjXyaG7p6ACF_5qPOgD_w0WlNLGQpZwl9sjyFCMhFVtJSKsh0N9yK7uob3'
    ]
  },
  demoUser: {
    email: "",
    password: "",
  },
  path: {
    defaultPublic: "/",
    defaultPrivate: "/",
  },
  RESEND_OTP_DELAY: 120, // 2 minutes
  book: {
    samplePages: 6
  }
}