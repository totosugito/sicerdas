import app from './app-locale';
import home from './home-locale';
import labels from './labels-locale';
import signIn from './sign-in-locale';
import signUp from './sign-up-locale';
import forgotPassword from './forgot-password-locale';
import resetPassword from './reset-password-locale';
import message from './message-locale';

const localeId = {
  translation: {
    app: app,
    home: home,
    labels: labels,
    signIn: signIn,
    signUp: signUp,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword,
    message: message
  }
}

export default {
  language: 'id',
  country: 'id',
  name: 'Indonesia',
  embeddedLocale: localeId
}