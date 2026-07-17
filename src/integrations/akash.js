export function getAkashIntegrationStatus() {
  const dseq = process.env.AKASH_DEPLOYMENT_SEQUENCE || "";

  if (dseq) {
    return {
      sponsor: "Akash",
      role: "persistent worker runtime",
      mode: "running-on-akash",
      configured: true,
      deploymentSequence: dseq,
      provider: process.env.AKASH_PROVIDER || null,
      publicHostname: process.env.AKASH_CLUSTER_PUBLIC_HOSTNAME || null,
      files: ["Dockerfile", "deploy.akash.yaml"]
    };
  }

  return {
    sponsor: "Akash",
    role: "persistent worker runtime",
    mode: process.env.AKASH_IMAGE ? "deploy-manifest-ready" : "local-image-placeholder",
    configured: Boolean(process.env.AKASH_IMAGE),
    files: ["Dockerfile", "deploy.akash.yaml"]
  };
}

