import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as authorizers from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import * as path from "path";

const REGION = "us-east-2";

export class CxumStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ─── Cognito User Pool ────────────────────────────────────────────────────
    const userPool = new cognito.UserPool(this, "CxumUserPool", {
      userPoolName: "cxum-user-pool",
      selfSignUpEnabled: false,          // solo por invitación
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email:    { required: true,  mutable: true },
        fullname: { required: false, mutable: true },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const userPoolClient = new cognito.UserPoolClient(this, "CxumUserPoolClient", {
      userPool,
      userPoolClientName: "cxum-app-client",
      authFlows: {
        userPassword: true,
        userSrp: true,
        adminUserPassword: true,
      },
      generateSecret: false,
    });

    // Grupos de roles
    for (const groupName of ["administradores", "colaborador", "escritor", "voluntario"]) {
      new cognito.CfnUserPoolGroup(this, `Group-${groupName}`, {
        userPoolId: userPool.userPoolId,
        groupName,
      });
    }

    const COGNITO_USER_POOL_ID  = userPool.userPoolId;
    const COGNITO_APP_CLIENT_ID = userPoolClient.userPoolClientId;

    // ─── DynamoDB Tables ──────────────────────────────────────────────────────
    // NOTE: These tables already exist in AWS (survived a failed stack rollback).
    // They are imported here so CDK manages permissions without trying to recreate them.
    // To revert to managed definitions, replace fromTableName() calls with new dynamodb.Table().
    const centrosTable = dynamodb.Table.fromTableName(this, "CentrosTable", "cxum-centros");
    const noticiasTable = dynamodb.Table.fromTableName(this, "NoticiasTable", "cxum-noticias");
    const solicitudesTable = dynamodb.Table.fromTableName(this, "SolicitudesTable", "cxum-solicitudes");
    const contactosTable = dynamodb.Table.fromTableName(this, "ContactosTable", "cxum-contactos");
    const inviteTokensTable = dynamodb.Table.fromTableName(this, "InviteTokensTable", "cxum-invite-tokens");
    const activityTable = dynamodb.Table.fromTableName(this, "ActivityTable", "cxum-activity");
    const profilesTable = dynamodb.Table.fromTableName(this, "ProfilesTable", "cxum-user-profiles");

    const certificatesIndexTable = new dynamodb.Table(this, "CertificatesIndexTable", {
      tableName: "cxum-certificates-index",
      partitionKey: { name: "certificateId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    certificatesIndexTable.addGlobalSecondaryIndex({
      indexName: "generationId-index",
      partitionKey: { name: "generationId", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const certificateDesignsTable = new dynamodb.Table(this, "CertificateDesignsTable", {
      tableName: "cxum-certificate-designs",
      partitionKey: { name: "templateId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ─── S3 Buckets ───────────────────────────────────────────────────────────
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

    const certificatesBucket = new s3.Bucket(this, "CertificatesBucket", {
      bucketName: `cxum-certificates-${this.account}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
          ],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          exposedHeaders: ["ETag"],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

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
        origin: origins.S3BucketOrigin.withOriginAccessControl(frontendBucket),
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
          CERTIFICATES_INDEX_TABLE: certificatesIndexTable.tableName,
          CERTIFICATE_DESIGNS_TABLE: certificateDesignsTable.tableName,
          IMAGES_BUCKET: imagesBucket.bucketName,
          CERTIFICATES_BUCKET: certificatesBucket.bucketName,
          ...extraEnv,
        },
      });

        // ─── Authorizer admin ─────────────────────────────────────────────────────
    const authorizerAdminFn = makeFn("CxumAuthorizerAdmin", "AuthorizerAdminCXUM", "authorizer");

    // ─── Authorizer multi-rol (nuevo) ─────────────────────────────────────────
    const authorizerMultiRoleFn = makeFn("AuthorizerMultiRole", "AuthorizerMultiRoleCXUM", "authorizerMultiRole");

    // ─── Lambdas nuevas ───────────────────────────────────────────────────────
    const getCentrosFn      = makeFn("GetCentros",      "getCentrosCXUM",      "getCentros");
    const mutateCentroFn    = makeFn("MutateCentro",    "mutateCentroCXUM",    "mutateCentro");
    const getNoticiasFn     = makeFn("GetNoticias",     "getNoticiasCXUM",     "getNoticias");
    const mutateNoticiaFn   = makeFn("MutateNoticia",   "mutateNoticiaCXUM",   "mutateNoticia");
    const modifyUserRoleFn  = makeFn("ModifyUserRole",  "modifyUserRoleCXUM",  "modifyUserRole");
    const listUsersFn       = makeFn("ListUsers",       "listUsersCXUM",       "listUsers");
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
    const certificatesFn        = makeFn("Certificates",        "certificatesCXUM",        "certificates");
    const getTempPasswordFn     = makeFn("GetTempPassword",     "getTempPasswordCXUM",     "getTempPassword");

    // ─── Permisos S3 ──────────────────────────────────────────────────────────
    imagesBucket.grantPut(uploadImageFn);
    imagesBucket.grantRead(listImagesFn);
    imagesBucket.grantDelete(listImagesFn);
    imagesBucket.grantPublicAccess();

    certificatesBucket.grantReadWrite(certificatesFn);
    certificatesBucket.grantDelete(certificatesFn);
    certificatesIndexTable.grantReadWriteData(certificatesFn);
    certificateDesignsTable.grantReadWriteData(certificatesFn);

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
    const cognitoArn = userPool.userPoolArn;

    // Profiles — modifyUserRole escribe, listUsers lee
    profilesTable.grantReadData(listUsersFn);
    profilesTable.grantReadWriteData(modifyUserRoleFn);

    // listUsers necesita listar usuarios y grupos de Cognito
    listUsersFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "cognito-idp:ListUsers",
          "cognito-idp:AdminListGroupsForUser",
        ],
        resources: [cognitoArn],
      })
    );

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

    getTempPasswordFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminSetUserPassword",
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
      path: "/certificates/{certificateId}",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("CertificatePublicViewInt", certificatesFn),
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

    // Obtener contraseña temporal de un usuario
    httpApi.addRoutes({
      path: "/admin/users/{username}/temp-password",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("GetTempPasswordInt", getTempPasswordFn),
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

    // â”€â”€â”€ Certificados masivos â€” plantillas y generaciones en bucket privado â”€â”€â”€â”€â”€â”€â”€â”€â”€
    httpApi.addRoutes({
      path: "/admin/certificates/templates/upload-url",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("CertificateTemplateUploadUrlInt", certificatesFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/certificates/templates",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("CertificateTemplatesListInt", certificatesFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/certificates/templates/{templateId}",
      methods: [apigwv2.HttpMethod.DELETE],
      integration: new integrations.HttpLambdaIntegration("CertificateTemplateDeleteInt", certificatesFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/certificates/designs/{templateId}",
      methods: [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.PUT, apigwv2.HttpMethod.DELETE],
      integration: new integrations.HttpLambdaIntegration("CertificateDesignFlowInt", certificatesFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/certificates/generations/upload-urls",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("CertificateGenerationUploadUrlsInt", certificatesFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/certificates/generations",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("CertificateGenerationsListInt", certificatesFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/certificates/generations/{generationId}",
      methods: [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.PUT, apigwv2.HttpMethod.DELETE],
      integration: new integrations.HttpLambdaIntegration("CertificateGenerationDetailInt", certificatesFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/certificates/download",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("CertificateDownloadInt", certificatesFn),
      authorizer: multiRoleAuthorizer,
    });

    httpApi.addRoutes({
      path: "/admin/certificates/files",
      methods: [apigwv2.HttpMethod.DELETE],
      integration: new integrations.HttpLambdaIntegration("CertificateFileDeleteInt", certificatesFn),
      authorizer: multiRoleAuthorizer,
    });

    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
      description: "Cognito User Pool ID — actualizar VITE_COGNITO_USER_POOL_ID en frontend/.env",
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
      description: "Cognito App Client ID — actualizar VITE_COGNITO_CLIENT_ID en frontend/.env",
    });

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

    new cdk.CfnOutput(this, "CertificatesBucketName", {
      value: certificatesBucket.bucketName,
      description: "Nombre del bucket S3 privado para certificados",
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
