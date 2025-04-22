import base64
import random
import math
from PIL import Image, ImageDraw, ImageFilter

# Path to your original image
input_path = "/Users/ridhamshah/Pictures/Lightroom Library.lrlibrary/b91d0d4afe544905a27aff5b16108d34/originals/2025/2025-04-08/IMG_9572.DNG"
# Path to save the edited image
output_path = "/Users/ridhamshah/Pictures/Lightroom Library.lrlibrary/b91d0d4afe544905a27aff5b16108d34/originals/2025/2025-04-08/shoes_used_look.png"
original_img = Image.open(input_path).convert("RGBA")
width, height = original_img.size

# -----------------
# 2) Create dust layer
# -----------------
dust_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
draw_dust = ImageDraw.Draw(dust_layer)

num_dust_specks = 300  # Increase for more dust
for _ in range(num_dust_specks):
    x = random.randint(0, width - 1)
    y = random.randint(0, height - 1)
    # White dust speck with some alpha
    draw_dust.point((x, y), fill=(255, 255, 255, 70))

# Optional small blur to soften dust specks
dust_layer = dust_layer.filter(ImageFilter.GaussianBlur(radius=0.3))

# -----------------
# 3) Create scratches layer
# -----------------
scratch_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
draw_scratch = ImageDraw.Draw(scratch_layer)

num_scratches = 20  # Increase for more scratches
for _ in range(num_scratches):
    start_x = random.randint(0, width - 1)
    start_y = random.randint(0, height - 1)
    length = random.randint(20, 100)
    angle = random.uniform(0, 2 * math.pi)
    
    end_x = int(start_x + length * math.cos(angle))
    end_y = int(start_y + length * math.sin(angle))
    
    # Thin white lines, slightly translucent
    draw_scratch.line(
        [(start_x, start_y), (end_x, end_y)],
        fill=(255, 255, 255, 80),
        width=1
    )

# Optional blur for more natural scratch edges
scratch_layer = scratch_layer.filter(ImageFilter.GaussianBlur(radius=0.8))

# -----------------
# 4) Composite everything
# -----------------
base_img = original_img.copy()

# Blend dust
dust_opacity = 80  # Adjust 0–255
dust_layer.putalpha(dust_opacity)
base_img = Image.alpha_composite(base_img, dust_layer)

# Blend scratches
scratch_opacity = 120  # Adjust 0–255
scratch_layer.putalpha(scratch_opacity)
base_img = Image.alpha_composite(base_img, scratch_layer)

# -----------------
# 5) Save result
# -----------------
base_img.save(output_path)
print(f"Saved used-look shoes image to: {output_path}")