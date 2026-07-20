from pydantic import BaseModel


class CreateRatingBody(BaseModel):
    trace_id: str
    rating: int
    comment: str | None
