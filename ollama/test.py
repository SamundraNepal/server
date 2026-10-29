
from qwen_vl_utils import process_vision_info
import json
import time
from pathlib import Path

import torch
from PIL import Image
from transformers import (
    AutoProcessor,
    Qwen2_5_VLForConditionalGeneration,
)

# --------------------------------------------------
# Configuration
# --------------------------------------------------

MODEL_NAME = "Qwen/Qwen2.5-VL-3B-Instruct"

IMAGE_PATH = Path(
    r"C:\Users\samun\Desktop\Storage\12de22a7ae97eff3e80b59d788a31f91aea0fee9d6519b401068277f2722e470\Thumbnails\ed355144-2450-4676-b0d0-58bd4dfea7f9.jpg"
)

OUTPUT_PATH = Path("result.json")

MAX_NEW_TOKENS = 50

# Reduce visual input for faster inference.
MIN_PIXELS = 256 * 28 * 28
MAX_PIXELS = 512 * 28 * 28

# --------------------------------------------------
# Check GPU
# --------------------------------------------------

if not torch.cuda.is_available():
    raise RuntimeError(
        "CUDA is not available. Check your PyTorch installation."
    )

print("GPU:", torch.cuda.get_device_name(0))
print(
    "VRAM:",
    round(
        torch.cuda.get_device_properties(0).total_memory
        / 1024**3,
        2,
    ),
    "GB",
)
print("PyTorch:", torch.__version__)
print("CUDA version:", torch.version.cuda)

# --------------------------------------------------
# Load model
# --------------------------------------------------

print("\nLoading model...")
load_start = time.time()

model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,
    device_map="cuda",
    attn_implementation="sdpa",
)

model.eval()

# Disable the irrelevant temperature warning for greedy generation.
model.generation_config.temperature = 1.0

processor = AutoProcessor.from_pretrained(
    MODEL_NAME,
    use_fast=True,
    min_pixels=MIN_PIXELS,
    max_pixels=MAX_PIXELS,
)

print(f"Model loaded in {time.time() - load_start:.1f} seconds")
print("Model device:", model.device)

# --------------------------------------------------
# Load image
# --------------------------------------------------

if not IMAGE_PATH.is_file():
    raise FileNotFoundError(f"Image not found: {IMAGE_PATH}")

with Image.open(IMAGE_PATH) as source:
    image = source.convert("RGB")

print(f"\nImage dimensions: {image.width} x {image.height}")
print(f"Image size: {IMAGE_PATH.stat().st_size / 1024:.1f} KB")

# --------------------------------------------------
# Prepare prompt
# --------------------------------------------------

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "image": str(IMAGE_PATH),
            },
            {
                "type": "text",
                "text": (
                    "Analyze this photo for a personal photo library. "
                    "Return only a valid JSON array containing 5 to 10 "
                    "lowercase strings representing searchable tags. "
                    "Include visible objects, activities, setting, "
                    "and scene. Do not invent details. "
                    'Example: ["dog", "park", "outdoors"].'
                ),
            },
        ],
    }
]

# --------------------------------------------------
# Process image and conversation
# --------------------------------------------------

prompt = processor.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
)

image_inputs, video_inputs = process_vision_info(messages)

inputs = processor(
    text=[prompt],
    images=image_inputs,
    videos=video_inputs,
    padding=True,
    return_tensors="pt",
).to(model.device)

print("\nInput prepared.")
print("Input token count:", inputs["input_ids"].shape[1])
print("Input device:", inputs["input_ids"].device)

if "pixel_values" in inputs:
    print(
        "Image tensor shape:",
        tuple(inputs["pixel_values"].shape),
    )

# --------------------------------------------------
# Generate tags
# --------------------------------------------------

print("\nGenerating tags...")

torch.cuda.synchronize()
start = time.time()

with torch.inference_mode():
    output = model.generate(
        **inputs,
        max_new_tokens=MAX_NEW_TOKENS,
        do_sample=False,
        use_cache=True,
    )

torch.cuda.synchronize()
elapsed = time.time() - start

input_length = inputs["input_ids"].shape[1]
new_tokens = output[:, input_length:]

print("Generated token count:", new_tokens.shape[1])
print("Generated token IDs:", new_tokens[0].tolist())

result = processor.batch_decode(
    new_tokens,
    skip_special_tokens=True,
    clean_up_tokenization_spaces=False,
)[0].strip()

print(f"\nAnalysis took {elapsed:.1f} seconds")
print("Raw response:")
print(repr(result))

# --------------------------------------------------
# Validate and save tags
# --------------------------------------------------

try:
    tags = json.loads(result)

    if not isinstance(tags, list):
        raise ValueError(
            "The model response must be a JSON array."
        )

    if not all(isinstance(tag, str) for tag in tags):
        raise ValueError(
            "Every tag must be a string."
        )

    tags = list(
        dict.fromkeys(
            tag.strip().lower()
            for tag in tags
            if tag.strip()
        )
    )[:10]

    if not tags:
        raise ValueError(
            "The model returned no usable tags."
        )

    with OUTPUT_PATH.open("w", encoding="utf-8") as file:
        json.dump(
            tags,
            file,
            indent=2,
            ensure_ascii=False,
        )

    print(f"\nSaved tags to: {OUTPUT_PATH.resolve()}")
    print("Final tags:")
    print(json.dumps(tags, indent=2, ensure_ascii=False))

except (json.JSONDecodeError, ValueError) as error:
    print(f"\nCould not save valid tags: {error}")
    print("Inspect the raw response and token IDs above.")