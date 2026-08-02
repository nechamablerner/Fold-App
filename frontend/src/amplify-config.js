import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_09qgNGF6c",
      userPoolClientId: "64v5hjuq65698ukkl0iidjrlbo",
      loginWith: {
        email: true,
      },
    },
  },
});
