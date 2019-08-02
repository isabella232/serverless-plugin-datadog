import Service from "serverless/classes/Service";

export interface Configuration {
  // Whether to add the lambda layers, or expect the user's to bring their own
  addLayers: boolean;
  // Datadog API Key, only necessary when using metrics without log forwarding
  apiKey?: string;
  // Datadog API Key encrypted using KMS, only necessary when using metrics without log forwarding
  apiKMSKey?: string;
  // Which Site to send to, (should be datadoghq.com or datadoghq.eu)
  site: string;
  // The log level, (set to DEBUG for extended logging)
  logLevel: string;
  // Whether the log forwarder integration is enabled by default
  flushMetricsToLogs: boolean;
}

const apiKeyEnvVar = "DD_API_KEY";
const apiKeyKMSEnvVar = "DD_KMS_API_KEY";
const siteURLEnvVar = "DD_SITE";
const logLevelEnvVar = "DD_LOG_LEVEL";
const logForwardingEnvVar = "DD_FLUSH_TO_LOG";

export const defaultConfiguration: Configuration = {
  addLayers: true,
  flushMetricsToLogs: false,
  logLevel: "info",
  site: "datadoghq.com",
};

export function setEnvConfiguration(config: Configuration, service: Service) {
  const provider = service.provider as any;

  if (provider.environment === undefined) {
    provider.environment = {};
  }
  const environment = provider.environment as any;
  if (config.apiKey !== undefined && environment[apiKeyEnvVar] === undefined) {
    environment[apiKeyEnvVar] = config.apiKey;
  }
  if (config.apiKMSKey !== undefined && environment[apiKeyKMSEnvVar] === undefined) {
    environment[apiKeyKMSEnvVar] = config.apiKMSKey;
  }
  if (environment[siteURLEnvVar] === undefined) {
    environment[siteURLEnvVar] = config.site;
  }
  if (environment[logLevelEnvVar] === undefined) {
    environment[logLevelEnvVar] = config.logLevel;
  }
  if (environment[logForwardingEnvVar] === undefined) {
    environment[logForwardingEnvVar] = config.flushMetricsToLogs;
  }
}

export function getConfig(service: Service): Configuration {
  let custom = service.custom as any;
  if (custom === undefined) {
    custom = {};
  }

  let datadog = custom.datadog as Partial<Configuration> | undefined;
  if (datadog === undefined) {
    datadog = {};
  }
  return {
    ...defaultConfiguration,
    ...datadog,
  };
}