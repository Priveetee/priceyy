from fastapi import HTTPException, status

class PriceyException(HTTPException):
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail={"error": message})

class PriceNotFoundError(PriceyException):
    def __init__(self, resource_type: str, region: str):
        super().__init__(
            f"Pricing not available for {resource_type} in {region}",
            status_code=status.HTTP_404_NOT_FOUND
        )

class InvalidConfigError(PriceyException):
    def __init__(self, message: str):
        super().__init__(message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

class EstimationNotFoundError(PriceyException):
    def __init__(self, estimation_id: str):
        super().__init__(
            f"Estimation {estimation_id} not found",
            status_code=status.HTTP_404_NOT_FOUND
        )

class ServiceUnavailableError(PriceyException):
    def __init__(self):
        super().__init__(
            "Service temporarily unavailable",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE
        )
