#!/usr/bin/env python3
"""
Generate Bradley Health branded app icons with text
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_heart_icon(size, text=True):
    """Create a heart icon with ECG line and optional text"""
    # Create image with blue background
    img = Image.new('RGB', (size, size), '#3b82f6')
    draw = ImageDraw.Draw(img)
    
    # Calculate scaling factor
    scale = size / 180
    
    # Heart position and size
    heart_center_x = size // 2
    heart_center_y = size // 2 - int(10 * scale)
    heart_radius = int(30 * scale)
    
    # Draw heart (simplified)
    heart_left = heart_center_x - heart_radius // 2
    heart_right = heart_center_x + heart_radius // 2
    heart_top = heart_center_y - heart_radius // 2
    heart_bottom = heart_center_y + heart_radius // 2
    
    # Draw heart shape (two circles and triangle)
    draw.ellipse([heart_left, heart_top, heart_center_x, heart_bottom], fill='#ef4444')
    draw.ellipse([heart_center_x, heart_top, heart_right, heart_bottom], fill='#ef4444')
    draw.polygon([
        (heart_center_x, heart_bottom),
        (heart_left - int(5 * scale), heart_center_y + int(10 * scale)),
        (heart_right + int(5 * scale), heart_center_y + int(10 * scale))
    ], fill='#ef4444')
    
    # Draw ECG line
    line_y = heart_center_y
    line_width = max(2, int(3 * scale))
    line_length = int(30 * scale)
    
    # ECG pattern
    ecg_points = [
        (heart_center_x - line_length, line_y),
        (heart_center_x - int(10 * scale), line_y),
        (heart_center_x - int(8 * scale), line_y - int(8 * scale)),
        (heart_center_x - int(6 * scale), line_y + int(8 * scale)),
        (heart_center_x - int(4 * scale), line_y - int(4 * scale)),
        (heart_center_x - int(2 * scale), line_y + int(4 * scale)),
        (heart_center_x, line_y),
        (heart_center_x + int(2 * scale), line_y - int(4 * scale)),
        (heart_center_x + int(4 * scale), line_y + int(4 * scale)),
        (heart_center_x + int(6 * scale), line_y - int(8 * scale)),
        (heart_center_x + int(8 * scale), line_y + int(8 * scale)),
        (heart_center_x + int(10 * scale), line_y),
        (heart_center_x + line_length, line_y)
    ]
    
    for i in range(len(ecg_points) - 1):
        draw.line([ecg_points[i], ecg_points[i + 1]], fill='white', width=line_width)
    
    # Add text if requested and size is large enough
    if text and size >= 72:
        try:
            # Try to use a system font
            font_size = max(8, int(16 * scale))
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
            except:
                font = ImageFont.load_default()
        
        text_y = heart_center_y + int(35 * scale)
        text_color = 'white'
        
        # Draw "Bradley Health" text
        text_lines = ["Bradley", "Health"]
        for i, line in enumerate(text_lines):
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
            text_x = (size - text_width) // 2
            draw.text((text_x, text_y + i * int(20 * scale)), line, fill=text_color, font=font)
    
    return img

def generate_all_icons():
    """Generate all required icon sizes"""
    sizes = {
        'icon-72.png': 72,
        'icon-96.png': 96,
        'icon-144.png': 144,
        'apple-touch-icon.png': 180,
        'icon-192.png': 192,
        'icon-512.png': 512
    }
    
    # Create assets directory if it doesn't exist
    os.makedirs('assets', exist_ok=True)
    
    print("🎨 Generating Bradley Health branded icons...")
    
    for filename, size in sizes.items():
        print(f"  Creating {filename} ({size}x{size})...")
        icon = create_heart_icon(size, text=True)
        icon.save(f'assets/{filename}', 'PNG')
        print(f"    ✅ Saved {filename}")
    
    # Create favicon.ico (16x16, 32x32, 48x48)
    print("  Creating favicon.ico...")
    favicon_sizes = [(16, 16), (32, 32), (48, 48)]
    favicon_images = []
    for fav_size in favicon_sizes:
        favicon_img = create_heart_icon(fav_size[0], text=False)  # No text for small favicon
        favicon_images.append(favicon_img)
    
    favicon_images[0].save('assets/favicon.ico', format='ICO', sizes=favicon_sizes)
    print("    ✅ Saved favicon.ico")
    
    # Create favicon.svg
    print("  Creating favicon.svg...")
    svg_content = f'''<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="4" fill="#3b82f6"/>
  <path d="M16 8c-2 0-4 1-4 3 0 1 0 2 1 3l3 3 3-3c1-1 1-2 1-3 0-2-2-3-4-3z" fill="#ef4444"/>
  <path d="M16 12c-1 0-2 0-2 1 0 1 0 1 1 1l1 1 1-1c1 0 1 0 1-1 0-1-1-1-2-1z" fill="white"/>
  <text x="16" y="26" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="6" font-weight="bold">Bradley Health</text>
</svg>'''
    
    with open('assets/favicon.svg', 'w') as f:
        f.write(svg_content)
    print("    ✅ Saved favicon.svg")
    
    print("\n🎉 All icons generated successfully!")
    print("📱 Icons include:")
    print("  - Red heart with blue background")
    print("  - White ECG line pattern")
    print("  - 'Bradley Health' text (on larger sizes)")
    print("  - Proper PWA and favicon formats")

if __name__ == "__main__":
    generate_all_icons()
