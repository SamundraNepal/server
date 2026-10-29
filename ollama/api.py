
import base64
import json
import os

import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434").rstrip("/")
MODEL_NAME = os.getenv("OLLAMA_MODEL", "minicpm-v4.6")
MAX_UPLOAD_BYTES = 20 * 1024 * 1024
MAX_TAGS = 15

app = FastAPI(title="Memories AI Image API")

PROMPT = """
You are an expert image-tagging assistant for a personal photo library called Memories.

Analyze the provided image and generate 10–15 meaningful, searchable tags
that accurately describe its visible content.

TAGGING PRIORITIES
1. Main subjects: people, animals, plants, objects, vehicles, buildings,
   landmarks, and other prominent subjects.
2. Scene and environment: beaches, forests, mountains, city streets,
   indoor rooms, gardens, rivers, and other identifiable environments.
3. Actions and activities: walking, hiking, swimming, cooking, playing,
   celebrating, working, and other clearly visible activities.
4. Distinctive details: clothing, colours, materials, textures, weather,
   vegetation, architecture, and notable objects.
5. Photo context: portrait, group photo, landscape, selfie, candid moment,
   family gathering, birthday party, or travel photography when supported.
6. Groupings: group, couple, family gathering, or crowd only when supported.

TAG QUALITY RULES
- Aim for 10–15 tags when the image contains enough distinct information.
  Never invent details just to reach the target.
- Use lowercase English tags.
- Prefer concise, specific terms over broad descriptions.
- Use natural multi-word tags when useful, such as "rocky cliffs",
  "green foliage", or "group hiking".
- Put the most important subjects first, followed by setting, activities,
  and distinctive details.
- Avoid redundant tags, synonyms, and near-duplicates.
- Describe observable facts, not unsupported interpretations.
- Do not infer names, identities, exact ages, occupations, relationships,
  or sensitive personal attributes.
- Do not guess exact locations, addresses, dates, or events.
- Do not infer emotions, intentions, or invisible context.
- For blurry, dark, obstructed, or ambiguous images, use fewer,
  more conservative tags.
- For screenshots, documents, memes, illustrations, or artwork,
  tag the actual content and media type.
- Only include details clearly visible or strongly supported by evidence.

OUTPUT REQUIREMENTS
- Return ONLY valid JSON, without Markdown or explanations.
- Use exactly this structure:
{
  "tags": ["tag1", "tag2", "tag3"]
}
- The tags value must be an array of unique strings.
- Ensure the JSON is valid and has no trailing commas.
"""


@app.get("/health")
async def health():
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            response.raise_for_status()
            models = response.json().get("models", [])

        installed = any(
            item.get("name", "").split(":")[0] == MODEL_NAME
            or item.get("model", "").split(":")[0] == MODEL_NAME
            for item in models
        )

        return {
            "status": "ok" if installed else "model_not_found",
            "model": MODEL_NAME,
            "ollama": OLLAMA_URL,
        }

    except httpx.HTTPError:
        raise HTTPException(
            status_code=503,
            detail="Ollama is not reachable yet.",
        )


@app.post("/tag-image")
async def tag_image(file: UploadFile = File(...)):
    try:
        if file.content_type and not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=415,
                detail="Upload an image file.",
            )

        data = await file.read(MAX_UPLOAD_BYTES + 1)

        if len(data) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=413,
                detail="Image exceeds 20 MB.",
            )

        if not data:
            raise HTTPException(
                status_code=400,
                detail="Image is empty.",
            )

        encoded = base64.b64encode(data).decode("ascii")

        print("Analysing image...", flush=True)

        async with httpx.AsyncClient(timeout=180) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": MODEL_NAME,
                    "prompt": PROMPT,
                    "images": [encoded],
                    "format": "json",
                    "stream": False,
                    "options": {"temperature": 0.2},
                },
            )
            response.raise_for_status()

        try:
            result = json.loads(response.json().get("response", ""))
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=502,
                detail="The AI returned invalid JSON.",
            )

        raw_tags = result.get("tags", [])

        if not isinstance(raw_tags, list):
            raw_tags = []

        tags = list(
            dict.fromkeys(
                tag.strip().lower()
                for tag in raw_tags
                if isinstance(tag, str) and tag.strip()
            )
        )[:MAX_TAGS]

        print(f"Tags: {', '.join(tags)}", flush=True)

        return {
            "tags": tags,
        }

    except HTTPException:
        raise

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="AI request timed out.",
        )

    except httpx.HTTPStatusError:
        raise HTTPException(
            status_code=502,
            detail="Ollama failed to analyze the image.",
        )

    except httpx.HTTPError:
        raise HTTPException(
            status_code=503,
            detail="Could not connect to Ollama.",
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Image analysis failed.",
        )

    finally:
        await file.close()
