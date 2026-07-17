export function getAwsIntegrationStatus() {
  const dynamoConfigured = Boolean(process.env.AWS_DYNAMODB_TABLE);

  return {
    sponsor: "AWS",
    role: "scheduled orchestration and persistence",
    mode: process.env.AWS_EXECUTION_ENV
      ? "lambda-runtime"
      : dynamoConfigured
        ? "local-process-live-dynamodb"
        : "local-with-deploy-template",
    configured: dynamoConfigured,
    dynamoTable: process.env.AWS_DYNAMODB_TABLE || null,
    services: ["Lambda", "EventBridge Scheduler", "DynamoDB", "S3-ready snapshots"],
    files: ["src/lambda.js", "infra/aws/template.yaml", "src/storage/file-store.js"]
  };
}

