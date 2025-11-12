export const AI_TOOLS_SCHEMA = [
  {
    type: "function",
    function: {
      name: "get_providers",
      description:
        "Get the list of available cloud providers (AWS, GCP, Azure). Use this when user asks about available providers or wants to start pricing estimation.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_regions",
      description:
        "Get available regions for a specific cloud provider. Use this when user mentions a provider and needs to select a region.",
      parameters: {
        type: "object",
        properties: {
          provider: {
            type: "string",
            enum: ["aws", "gcp", "azure"],
            description: "The cloud provider name (lowercase)",
          },
        },
        required: ["provider"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_resources",
      description:
        "Search for available resource types in a specific provider and region. Use this when user mentions a resource type (like EC2, S3, VM, Storage).",
      parameters: {
        type: "object",
        properties: {
          provider: {
            type: "string",
            enum: ["aws", "gcp", "azure"],
            description: "The cloud provider",
          },
          region: {
            type: "string",
            description: "The cloud region (e.g., us-east-1, europe-west1)",
          },
          query: {
            type: "string",
            description:
              "Search query for resource types (e.g., 'EC2', 'Storage', 'VM')",
          },
        },
        required: ["provider", "region"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_pricing_options",
      description:
        "Get available pricing options and models for a specific resource type. Use this to show pricing details to the user before adding to cart.",
      parameters: {
        type: "object",
        properties: {
          provider: {
            type: "string",
            enum: ["aws", "gcp", "azure"],
            description: "The cloud provider",
          },
          region: {
            type: "string",
            description: "The cloud region",
          },
          resourceType: {
            type: "string",
            description: "The specific resource type (e.g., 'EC2', 'S3')",
          },
        },
        required: ["provider", "region", "resourceType"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_to_cart",
      description:
        "Add a cloud resource to the user's estimate cart. ONLY use this after user has confirmed all details (provider, region, resource, pricing model, quantity). Always ask for confirmation before calling this.",
      parameters: {
        type: "object",
        properties: {
          provider: {
            type: "string",
            description: "The cloud provider",
          },
          region: {
            type: "string",
            description: "The cloud region",
          },
          resourceType: {
            type: "string",
            description: "The resource type",
          },
          priceModel: {
            type: "string",
            description: "The pricing model (e.g., 'On-Demand', 'Reserved')",
          },
          unitOfMeasure: {
            type: "string",
            description: "The unit of measure for pricing",
          },
          pricePerUnit: {
            type: "number",
            description: "The price per unit",
          },
          quantity: {
            type: "number",
            description: "Number of instances/resources",
          },
          usage: {
            type: "number",
            description: "Usage amount (hours, GB, etc.)",
          },
        },
        required: [
          "provider",
          "region",
          "resourceType",
          "priceModel",
          "unitOfMeasure",
          "pricePerUnit",
          "quantity",
        ],
      },
    },
  },
];
