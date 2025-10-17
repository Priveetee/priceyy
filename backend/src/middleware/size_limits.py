from fastapi import Request, HTTPException, status

MAX_BODY_SIZE = 1 * 1024 * 1024  # 1MB

async def size_limit_middleware(request: Request, call_next):
    if request.method in ["POST", "PATCH", "PUT"]:
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_BODY_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Request body too large (max {MAX_BODY_SIZE} bytes)"
            )
    
    return await call_next(request)
