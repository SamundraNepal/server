
import sys
import time
import threading
from pathlib import Path

import requests

API_URL = "http://127.0.0.1:8000/tag-image"
IMAGE_PATH = Path(
    "/home/samundra/Downloads/fotos1992-waterfall-6403521_1920.jpg"
)

if not IMAGE_PATH.is_file():
    print(f"Image not found: {IMAGE_PATH}")
    sys.exit(1)

print("\n╭──────────────────────────────────────╮")
print("│       MEMORIES — AI IMAGE TAGGING    │")
print("╰──────────────────────────────────────╯")
print(f"\n[1/3] Image: {IMAGE_PATH.name}")
print(f"      Size: {IMAGE_PATH.stat().st_size / 1024:.1f} KB")
print("\n[2/3] Sending image to MiniCPM-V...")

stop_spinner = threading.Event()
start = time.monotonic()

def show_progress():
    frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
    i = 0
    while not stop_spinner.is_set():
        elapsed = time.monotonic() - start
        print(
            f"\r      {frames[i % len(frames)]} Analysing image... "
            f"{elapsed:05.1f}s",
            end="",
            flush=True,
        )
        i += 1
        stop_spinner.wait(0.1)

thread = threading.Thread(target=show_progress, daemon=True)
thread.start()

try:
    with IMAGE_PATH.open("rb") as image:
        response = requests.post(
            API_URL,
            files={"file": (IMAGE_PATH.name, image, "image/jpeg")},
            timeout=300,
        )
    response.raise_for_status()
    result = response.json()
except requests.RequestException as error:
    stop_spinner.set()
    thread.join()
    print(f"\n\nRequest failed: {error}")
    sys.exit(1)
finally:
    stop_spinner.set()
    thread.join()

elapsed = time.monotonic() - start
print(f"\r      ✓ Analysis finished in {elapsed:.2f}s" + " " * 15)

print("\n[3/3] AI Results")
print("      Tags detected:")
for tag in result.get("tags", []):
    print(f"        • {tag}")

print(f"\n      API analysis time: {result.get('analysisSeconds', 'N/A')}s")
print(f"      Total request time: {elapsed:.2f}s")
print("\nDone.\n")
