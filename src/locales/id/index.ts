import home from './home-locale';
import labels from './labels-locale';
import signIn from './sign-in-locale';
import signUp from './sign-up-locale';
import forgotPassword from './forgot-password-locale';

const localeId = {
  translation: {
    home: home,
    labels: labels,
    signIn: signIn,
    signUp: signUp,
    forgotPassword: forgotPassword
  }
}

export default {
  language: 'id',
  country: 'id',
  name: 'Indonesia',
  embeddedLocale: localeId
}