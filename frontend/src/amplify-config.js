import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_xgJKqLcvZ", // Keep your real pool ID here
      userPoolClientId: "k1q6fq0b39763tei91qa1iarg", // Keep your real client ID here
      loginWith: {
        email: true,
      },
    },
  },
});

console.log("Amplify is initialized!");
