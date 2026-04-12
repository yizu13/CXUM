export const statements = [
  {
    Effect: "Allow",
    Action: [
      "cognito-idp:AdminGetUser",
      "cognito-idp:AdminSetUserPassword",
    ],
    Resource: "*",
  },
];
