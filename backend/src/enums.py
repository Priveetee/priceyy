from enum import Enum

class Provider(str, Enum):
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"

class PricingModel(str, Enum):
    ON_DEMAND = "on-demand"
    RESERVED_1Y = "reserved-1y"
    RESERVED_3Y = "reserved-3y"
    SPOT = "spot"

class Service(str, Enum):
    EC2 = "EC2"
    RDS = "RDS"
    S3 = "S3"
    VIRTUALMACHINES = "VirtualMachines"
    SQLDATABASE = "SQLDatabase"

class EstimationStatus(str, Enum):
    DRAFT = "draft"
    SAVED = "saved"
    EXPORTED = "exported"
