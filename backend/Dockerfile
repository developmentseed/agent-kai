FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# The installer requires curl (and certificates) to download the release archive
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates libexpat1 gcc build-essential \
    && rm -rf /var/lib/apt/lists/*

ADD https://astral.sh/uv/0.5.4/install.sh /uv-installer.sh

RUN sh /uv-installer.sh && rm /uv-installer.sh

ENV PATH="/root/.local/bin/:$PATH"

ADD ./pyproject.toml ./uv.lock /app/
ADD README.md /app/README.md

WORKDIR /app

ADD ./src /app/src

RUN uv sync --frozen

CMD ["uv", "run", "uvicorn", "src.agent_kai.api.app:app", "--host", "0.0.0.0", "--port", "8000"]
