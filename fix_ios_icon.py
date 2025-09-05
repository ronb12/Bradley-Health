#!/usr/bin/env python3
"""
Fix iOS Apple Touch Icon - ensure proper format and design
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_ios_apple_touch_icon():
    """Create a proper iOS Apple Touch Icon (180x180)"""
    size = 180
    
    # Create image with proper iOS specifications
    img = Image.new('RGB', (size, size), '#3b82f6')  # Blue background
    draw = ImageDraw.Draw(img)
    
    # Heart position and size
    heart_center_x = size // 2
    heart_center_y = size // 2 - 15
    heart_radius = 35
    
    # Draw heart (simplified but clear)
    heart_left = heart_center_x - heart_radius // 2
    heart_right = heart_center_x + heart_radius // 2
    heart_top = heart_center_y - heart_radius // 2
    heart_bottom = heart_center_y + heart_radius // 2
    
    # Draw heart shape (two circles and triangle)
    draw.ellipse([heart_left, heart_top, heart_center_x, heart_bottom], fill='#ef4444')
    draw.ellipse([heart_center_x, heart_top, heart_right, heart_bottom], fill='#ef4444')
    draw.polygon([
        (heart_center_x, heart_bottom),
        (heart_left - 8, heart_center_y + 15),
        (heart_right + 8, heart_center_y + 15)
    ], fill='#ef4444')
    
    # Draw ECG line
    line_y = heart_center_y
    line_width = 4
    line_length = 35
    
    # ECG pattern
    ecg_points = [
        (heart_center_x - line_length, line_y),
        (heart_center_x - 12, line_y),
        (heart_center_x - 10, line_y - 10),
        (heart_center_x - 8, line_y + 10),
        (heart_center_x - 6, line_y - 5),
        (heart_center_x - 4, line_y + 5),
        (heart_center_x - 2, line_y - 2),
        (heart_center_x, line_y),
        (heart_center_x + 2, line_y - 5),
        (heart_center_x + 4, line_y + 5),
        (heart_center_x + 6, line_y - 10),
        (heart_center_x + 8, line_y + 10),
        (heart_center_x + 10, line_y),
        (heart_center_x + 12, line_y),
        (heart_center_x + line_length, line_y)
    ]
    
    for i in range(len(ecg_points) - 1):
        draw.line([ecg_points[i], ecg_points[i + 1]], fill='white', width=line_width)
    
    # Add text
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 16)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
        except:
            font = ImageFont.load_default()
    
    text_y = heart_center_y + 40
    text_color = 'white'
    
    # Draw "Bradley Health" text
    text_lines = ["Bradley", "Health"]
    for i, line in enumerate(text_lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        text_x = (size - text_width) // 2
        draw.text((text_x, text_y + i * 20), line, fill=text_color, font=font)
    
    # Ensure no transparency for iOS
    if img.mode == 'RGBA':
        # Create a white background and paste the image
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
        img = background
    
    return img

def create_ios_favicon():
    """Create iOS-compatible favicon"""
    # Create a simple 32x32 favicon
    size = 32
    img = Image.new('RGB', (size, size), '#3b82f6')
    draw = ImageDraw.Draw(img)
    
    # Draw simple heart
    heart_center_x = size // 2
    heart_center_y = size // 2 - 2
    heart_radius = 8
    
    # Draw heart
    heart_left = heart_center_x - heart_radius // 2
    heart_right = heart_center_x + heart_radius // 2
    heart_top = heart_center_y - heart_radius // 2
    heart_bottom = heart_center_y + heart_radius // 2
    
    draw.ellipse([heart_left, heart_top, heart_center_x, heart_bottom], fill='#ef4444')
    draw.ellipse([heart_center_x, heart_top, heart_right, heart_bottom], fill='#ef4444')
    draw.polygon([
        (heart_center_x, heart_bottom),
        (heart_left - 2, heart_center_y + 3),
        (heart_right + 2, heart_center_y + 3)
    ], fill='#ef4444')
    
    # Draw ECG line
    line_y = heart_center_y
    draw.line([(heart_center_x - 8, line_y), (heart_center_x + 8, line_y)], fill='white', width=2)
    
    return img

def main():
    print("🍎 Fixing iOS Apple Touch Icon...")
    
    # Create iOS-compatible apple-touch-icon
    apple_icon = create_ios_apple_touch_icon()
    apple_icon.save('assets/apple-touch-icon.png', 'PNG', optimize=True)
    print("✅ Created apple-touch-icon.png (180x180)")
    
    # Create favicon
    favicon = create_ios_favicon()
    favicon.save('assets/favicon.ico', 'ICO', sizes=[(16, 16), (32, 32)])
    print("✅ Created favicon.ico")
    
    # Create SVG favicon
    svg_content = '''<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="4" fill="#3b82f6"/>
  <path d="M16 8c-2 0-4 1-4 3 0 1 0 2 1 3l3 3 3-3c1-1 1-2 1-3 0-2-2-3-4-3z" fill="#ef4444"/>
  <path d="M16 12c-1 0-2 0-2 1 0 1 0 1 1 1l1 1 1-1c1 0 1 0 1-1 0-1-1-1-2-1z" fill="white"/>
  <text x="16" y="26" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="4" font-weight="bold">BH</text>
</svg>'''
    
    with open('assets/favicon.svg', 'w') as f:
        f.write(svg_content)
    print("✅ Created favicon.svg")
    
    print("\n🎉 iOS icons fixed!")
    print("📱 Apple Touch Icon specifications:")
    print("  - Size: 180x180 pixels")
    print("  - Format: PNG (RGB, no transparency)")
    print("  - Design: Red heart + blue background + white ECG line + text")
    print("  - iOS compatible: No transparency, proper dimensions")

if __name__ == "__main__":
    main()
