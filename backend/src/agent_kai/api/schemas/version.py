from pydantic import BaseModel


class VersionResponse(BaseModel):
    backend: str
