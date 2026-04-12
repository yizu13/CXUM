import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as authorizers from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import * as path from "path";

const COGNITO_USER_POOL_ID = "us-east-2_jjcAqBdVn";
const COGNITO_APP_CLIENT_ID = "18n7rhj63h6modf5ol9m637ism";
const REGION = "us-east-2";

export class CxumStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ─── DynamoDB Tables ──────────────────────────────────────────────────────
    const centrosTable = new dynamodb.Table(this, "CentrosTable", {
      tableName: "cxum-centros",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const noticiasTable = new dynamodb.Table(this, "NoticiasTable", {
      tableName: "cxum-noticias",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const solicitudesTable = new dynamodb.Table(this, "SolicitudesTable", {
      tableName: "cxum-solicitudes",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const contactosTable = new dynamodb.Table(this, "ContactosTable", {
      tableName: "cxum-contactos",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const inviteTokensTable = new dynamodb.Table(this, "InviteTokensTable", {
      tableName: "cxum-invite-tokens",
      partitionKey: { name: "token", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      // TTL nativo de DynamoDB — limpia tokens expirados automáticamente
      timeToLiveAttribute: "expiresAtEpoch",
    });

    const activityTable = new dynamodb.Table(this, "ActivityTable", {
      tableName: "cxum-activity",
      partitionKey: { name: "pk",        type: dynamodb.AttributeType.STRING },
      sortKey:      { name: "createdAt", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const profilesTable = new dynamodb.Table(this, "ProfilesTable", {
      tableName: "cxum-user-profiles",
      partitionKey: { name: "username", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ─── S3 Bucket para imágenes ─────────────────────────────────────────────
    const imagesBucket = new s3.Bucket(this, "ImagesBucket", {
      bucketName: `cxum-images-${this.account}`,
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ─── S3 Bucket para el frontend ──────────────────────────────────────────
    const frontendBucket = new s3.Bucket(this, "FrontendBucket", {
      bucketName: `cxum-frontend-${this.account}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    // ─── CloudFront Distribution ─────────────────────────────────────────────
    const distribution = new cloudfront.Distribution(this, "FrontendDistribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      comment: "CXUM Frontend Distribution",
    });

    // ─── Deploy del frontend (comentado por defecto) ─────────────────────────
    // Descomentar después de hacer build del frontend
    // new s3deploy.BucketDeployment(this, "DeployFrontend", {
    //   sources: [s3deploy.Source.asset(path.join(__dirname, "../frontend/dist"))],
    //   destinationBucket: frontendBucket,
    //   distribution,
    //   distributionPaths: ["/*"],
    // });

    // ─── Lambdas existentes (importadas) ──────────────────────────────────────
    const authorizerAdminFn = lambda.Function.fromFunctionName(this, "CxumAuthorizerAdmin", "AuthorizerAdminCXUM");

    // ─── Helper: crear lambda con env comunes ─────────────────────────────────
    const makeFn = (id: string, name: string, dir: string, extraEnv: Record<string, string> = {}) =>
      new lambda.Function(this, id, {
        functionName: name,
        runtime: lambda.Runtime.NODEJS_22_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset(path.join(__dirname, `../lambdas/${dir}`)),
        timeout: cdk.Duration.seconds(30),
        environment: {
          COGNITO_USER_POOL_ID,
          COGNITO_APP_CLIENT_ID,
          CENTROS_TABLE: centrosTable.tableName,
          NOTICIAS_TABLE: noticiasTable.tableName,
          SOLICITUDES_TABLE: solicitudesTable.tableName,
          CONTACTOS_TABLE: contactosTable.tableName,
          INVITE_TOKENS_TABLE: inviteTokensTable.tableName,
          ACTIVITY_TABLE: activityTable.tableName,
          PROFILES_TABLE: profilesTable.tableName,
          IMAGES_BUCKET: imagesBucket.bucketName,
          ...extraEnv,
        },
      });

    // ─── Authorizer multi-rol (nuevo) ─────────────────────────────────────────
    const authorizerMultiRoleFn = makeFn("AuthorizerMultiRole", "AuthorizerMultiRoleCXUM", "authorizerMultiRole");

    // ─── Lambdas nuevas ───────────────────────────────────────────────────────
    const getCentrosFn      = makeFn("GetCentros",      "getCentrosCXUM",      "getCentros");
    const mutateCentroFn    = makeFn("MutateCentro",    "mutateCentroCXUM",    "mutateCentro");
    const getNoticiasFn     = makeFn("GetNoticias",     "getNoticiasCXUM",     "getNoticias");
    const mutateNoticiaFn   = makeFn("MutateNoticia",   "mutateNoticiaCXUM",   "mutateNoticia");
    const modifyUserRoleFn  = makeFn("ModifyUserRole",  "modifyUserRoleCXUM",  "modifyUserRole");
    // listUsers ya existe — la importamos y actualizamos su código manualmente vía consola o CLI
    const listUsersFn = lambda.Function.fromFunctionName(this, "ListUsersCXUM", "listUsersCXUM");
    const getSolicitudesFn  = makeFn("GetSolicitudes",  "getSolicitudesCXUM",  "getSolicitudes");
    const mutateSolicitudFn = makeFn("MutateSolicitud", "mutateSolicitudCXUM", "mutateSolicitud");
    const submitVolunteerFn = makeFn("SubmitVolunteer", "submitVolunteerCXUM", "submitVolunteer");
    const submitContactFn   = makeFn("SubmitContact",   "submitContactCXUM",   "submitContact");
    const inviteUserFn      = makeFn("InviteUser",      "inviteUserCXUM",      "inviteUser");
    const getActivityFn     = makeFn("GetActivity",     "getActivityCXUM",     "getActivity");
    const generateInviteTokenFn = makeFn("GenerateInviteToken", "generateInviteTokenCXUM", "generateInviteToken");
    const validateInviteTokenFn = makeFn("ValidateInviteToken", "validateInviteTokenCXUM", "validateInviteToken");
    const consumeInviteTokenFn  = makeFn("ConsumeInviteToken",  "consumeInviteTokenCXUM",  "consumeInviteToken");
    const uploadImageFn         = makeFn("UploadImage",         "uploadImageCXUM",         "uploadImage");
    const listImagesFn          = makeFn("ListImages",          "listImagesCXUM",          "listImages");

    // ─── Permisos S3 ──────────────────────────────────────────────────────────
    imagesBucket.grantPut(uploadImageFn);
    imagesBucket.grantRead(listImagesFn);
    imagesBucket.grantDelete(listImagesFn);
    imagesBucket.grantPublicAccess();

    // ─── Permisos DynamoDB ────────────────────────────────────────────────────
    centrosTable.grantReadData(getCentrosFn);
    centrosTable.grantWriteData(mutateCentroFn);
    centrosTable.grantReadData(mutateCentroFn);

    noticiasTable.grantReadData(getNoticiasFn);
    noticiasTable.grantWriteData(mutateNoticiaFn);
    noticiasTable.grantReadData(mutateNoticiaFn);

    solicitudesTable.grantReadData(getSolicitudesFn);
    solicitudesTable.grantWriteData(mutateSolicitudFn);
    solicitudesTable.grantReadData(mutateSolicitudFn);
    solicitudesTable.grantWriteData(submitVolunteerFn);

    contactosTable.grantWriteData(submitContactFn);

    // ─── Permisos Cognito ─────────────────────────────────────────────────────
    const cognitoArn = `arn:aws:cognito-idp:${REGION}:${this.account}:userpool/${COGNITO_USER_POOL_ID}`;

    // Profiles — modifyUserRole escribe
    // listUsers lee profiles y Cognito — permisos gestionados manualmente en consola AWS
    profilesTable.grantReadWriteData(modifyUserRoleFn);

    inviteTokensTable.grantReadWriteData(generateInviteTokenFn);
    inviteTokensTable.grantReadWriteData(validateInviteTokenFn);
    inviteTokensTable.grantReadWriteData(consumeInviteTokenFn);

    // Activity — lectura para getActivity, escritura para todas las lambdas que loguean
    activityTable.grantReadData(getActivityFn);
    for (const fn of [mutateCentroFn, mutateNoticiaFn, modifyUserRoleFn, mutateSolicitudFn, inviteUserFn]) {
      activityTable.grantWriteData(fn);
    }

    // ─── Permisos Cognito (continuación) ─────────────────────────────────────
    const cognitoAdminPolicy = new iam.PolicyStatement({
      actions: [
        "cognito-idp:AdminAddUserToGroup",
        "cognito-idp:AdminRemoveUserFromGroup",
        "cognito-idp:AdminUpdateUserAttributes",
        "cognito-idp:AdminDisableUser",
        "cognito-idp:AdminEnableUser",
      ],
      resources: [cognitoArn],
    });

    inviteUserFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "cognito-idp:AdminCreateUser",
          "cognito-idp:AdminAddUserToGroup",
        ],
        resources: [cognitoArn],
      })
    );

    modifyUserRoleFn.addToRolePolicy(cognitoAdminPolicy);
    mutateSolicitudFn.addToRolePolicy(cognitoAdminPolicy);
    mutateSolicitudFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ["cognito-idp:AdminListGroupsForUser"],
      resources: [cognitoArn],
    }));

    // ─── HTTP API Gateway ─────────────────────────────────────────────────────
    const httpApi = new apigwv2.HttpApi(this, "CxumBackend", {
      apiName: "cxumBACKEND",
      corsPreflight: {
        allowHeaders: ["Authorization", "Content-Type"],
        allowMethods: [apigwv2.CorsHttpMethod.ANY],
        allowOrigins: ["*"],
      },
    });

    // Authorizer admin (solo administradores) — rutas existentes
    const adminOnlyAuthorizer = new authorizers.HttpLambdaAuthorizer("AdminOnlyAuthorizer", authorizerAdminFn, {
      authorizerName: "adminOnlyAuthorizer",
      responseTypes: [authorizers.HttpLambdaResponseType.SIMPLE],
      identitySource: ["$request.header.Authorization"],
      resultsCacheTtl: cdk.Duration.seconds(0),
    });

    // Authorizer multi-rol — rutas nuevas
    const multiRoleAuthorizer = new authorizers.HttpLambdaAuthorizer("MultiRoleAuthorizer", authorizerMultiRoleFn, {
      authorizerName: "multiRoleAuthorizer",
      responseTypes: [authorizers.HttpLambdaResponseType.SIMPLE],
      identitySource: ["$request.header.Authorization"],
      resultsCacheTtl: cdk.Duration.seconds(0),
    });

    // ─── Rutas existentes ─────────────────────────────────────────────────────
    httpApi.addRoutes({
      path: "/admin/usersget",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("ListUsersInt", listUsersFn),
      authorizer: adminOnlyAuthorizer,
    });

    // ─── Rutas nuevas — Admin (requieren autenticación multi-rol) ─────────────
    httpApi.addRoutes({
      path: "/admin/users/{username}",
      methods: [apigwv2.HttpMethod.PUT],
      integration: new integrations.HttpLambdaIntegration("ModifyUserRoleInt", modifyUserRoleFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/centros",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("GetCentrosInt", getCentrosFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/centros",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("CreateCentroInt", mutateCentroFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/centros/{id}",
      methods: [apigwv2.HttpMethod.PUT, apigwv2.HttpMethod.DELETE],
      integration: new integrations.HttpLambdaIntegration("MutateCentroInt", mutateCentroFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/noticias",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("GetNoticiasAdminInt", getNoticiasFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/noticias",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("CreateNoticiaInt", mutateNoticiaFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/noticias/{id}",
      methods: [apigwv2.HttpMethod.PUT, apigwv2.HttpMethod.DELETE],
      integration: new integrations.HttpLambdaIntegration("MutateNoticiaInt", mutateNoticiaFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/solicitudes",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("GetSolicitudesInt", getSolicitudesFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/solicitudes/{id}",
      methods: [apigwv2.HttpMethod.PUT],
      integration: new integrations.HttpLambdaIntegration("MutateSolicitudInt", mutateSolicitudFn),
      authorizer: multiRoleAuthorizer,
    });

    // ─── Rutas públicas (sin authorizer) ──────────────────────────────────────
    httpApi.addRoutes({
      path: "/noticias",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("GetNoticiasPublicInt", getNoticiasFn),
    });

    httpApi.addRoutes({
      path: "/noticias/{slug}",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("GetNoticiaSlugInt", getNoticiasFn),
    });

    httpApi.addRoutes({
      path: "/centros",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("GetCentrosPublicInt", getCentrosFn),
    });

    httpApi.addRoutes({
      path: "/voluntarios",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("SubmitVolunteerInt", submitVolunteerFn),
    });

    httpApi.addRoutes({
      path: "/contacto",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("SubmitContactInt", submitContactFn),
    });

    httpApi.addRoutes({
      path: "/admin/activity",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("GetActivityInt", getActivityFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/invite-user",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("InviteUserInt", inviteUserFn),
      authorizer: multiRoleAuthorizer,
    });

    // ─── Invite tokens ────────────────────────────────────────────────────────
    // Generar token (requiere estar autenticado)
    httpApi.addRoutes({
      path: "/admin/invite-token",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("GenerateInviteTokenInt", generateInviteTokenFn),
      authorizer: multiRoleAuthorizer,
    });

    // Validar token (público — paso 1 del registro)
    httpApi.addRoutes({
      path: "/invite/validate",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("ValidateInviteTokenInt", validateInviteTokenFn),
    });

    // Consumir token (público — después de confirmar OTP)
    httpApi.addRoutes({
      path: "/invite/consume",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("ConsumeInviteTokenInt", consumeInviteTokenFn),
    });

    // ─── Upload de imágenes ───────────────────────────────────────────────────
    httpApi.addRoutes({
      path: "/admin/upload-image",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("UploadImageInt", uploadImageFn),
      authorizer: multiRoleAuthorizer,
    });

    // ─── Galería de medios ────────────────────────────────────────────────────
    httpApi.addRoutes({
      path: "/admin/media",
      methods: [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.DELETE],
      integration: new integrations.HttpLambdaIntegration("ListImagesInt", listImagesFn),
      authorizer: multiRoleAuthorizer,
    });

    // ─── Outputs ──────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, "ApiUrl", {
      value: httpApi.apiEndpoint,
      description: "URL base del HTTP API Gateway — actualizar VITE_API_URL en frontend/.env",
    });

    new cdk.CfnOutput(this, "ImagesBucketName", {
      value: imagesBucket.bucketName,
      description: "Nombre del bucket S3 para imágenes",
    });

    new cdk.CfnOutput(this, "ImagesBucketUrl", {
      value: `https://${imagesBucket.bucketName}.s3.amazonaws.com`,
      description: "URL base del bucket S3 para imágenes",
    });

    new cdk.CfnOutput(this, "FrontendBucketName", {
      value: frontendBucket.bucketName,
      description: "Nombre del bucket S3 para el frontend",
    });

    new cdk.CfnOutput(this, "CloudFrontUrl", {
      value: `https://${distribution.distributionDomainName}`,
      description: "URL de CloudFront para acceder al frontend",
    });

    new cdk.CfnOutput(this, "CloudFrontDistributionId", {
      value: distribution.distributionId,
      description: "ID de la distribución de CloudFront",
    });
  }
}
