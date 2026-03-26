#!/usr/bin/env python3
"""
Check and fix text sizing on all app icons and favicons
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon_with_proper_text(size, filename):
    """Create icon with properly sized text for the given size"""
    img = Image.new('RGB', (size, size), '#3b82f6')
    draw = ImageDraw.Draw(img)
    
    # Calculate scaling factor
    scale = size / 180
    
    # Heart position and size
    heart_center_x = size // 2
    heart_center_y = size // 2 - int(10 * scale)
    heart_radius = int(30 * scale)
    
    # Draw heart
    heart_left = heart_center_x - heart_radius // 2
    heart_right = heart_center_x + heart_radius // 2
    heart_top = heart_center_y - heart_radius // 2
    heart_bottom = heart_center_y + heart_radius // 2
    
    # Draw heart shape
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
    
    # Add text based on size - always use full "Bradley Health" text
    if size >= 32:
        # Full "Bradley Health" text for all app icons
        try:
            # Scale font size appropriately for each icon size
            if size >= 144:
                font_size = max(12, int(16 * scale))
            elif size >= 96:
                font_size = max(10, int(14 * scale))
            elif size >= 72:
                font_size = max(8, int(12 * scale))
            else:
                font_size = max(6, int(10 * scale))
            
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
    
    else:
        # No text for very small icons (favicon, etc.)
        pass
    
    return img

def create_favicon_with_text(size):
    """Create favicon with appropriate text for size"""
    img = Image.new('RGB', (size, size), '#3b82f6')
    draw = ImageDraw.Draw(img)
    
    # Draw simple heart
    heart_center_x = size // 2
    heart_center_y = size // 2 - 2
    heart_radius = max(4, size // 4)
    
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
    draw.line([(heart_center_x - 8, line_y), (heart_center_x + 8, line_y)], fill='white', width=max(1, size // 16))
    
    # Add text only for larger favicon sizes
    if size >= 32:
        try:
            font_size = max(4, size // 8)
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
            except:
                font = ImageFont.load_default()
        
        text_y = heart_center_y + size // 4
        text_color = 'white'
        
        # Draw "Bradley Health" for favicon (very small)
        text_lines = ["Bradley", "Health"]
        for i, line in enumerate(text_lines):
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
            text_x = (size - text_width) // 2
            draw.text((text_x, text_y + i * (size // 8)), line, fill=text_color, font=font)
    
    return img

def main():
    print("🔍 Checking and fixing text on all app icons...")
    
    # Create assets directory if it doesn't exist
    os.makedirs('assets', exist_ok=True)
    
    # Icon sizes and their text requirements
    icon_sizes = {
        'icon-72.png': 72,      # Small PWA - abbreviated text
        'icon-96.png': 96,      # Medium PWA - abbreviated text
        'icon-144.png': 144,    # Medium PWA - full text
        'apple-touch-icon.png': 180,  # iOS - full text
        'icon-192.png': 192,    # Standard PWA - full text
        'icon-512.png': 512,    # High-res PWA - full text
    }
    
    print("\n📱 Creating app icons with proper text sizing:")
    for filename, size in icon_sizes.items():
        print(f"  Creating {filename} ({size}x{size})...")
        icon = create_icon_with_proper_text(size, filename)
        icon.save(f'assets/{filename}', 'PNG', optimize=True)
        
        # Determine text type
        if size >= 32:
            text_type = "Full 'Bradley Health' text (scaled)"
        else:
            text_type = "No text (too small)"
        
        print(f"    ✅ {text_type}")
    
    print("\n🌐 Creating favicons with proper text sizing:")
    # Create favicon.ico with multiple sizes
    favicon_sizes = [(16, 16), (32, 32), (48, 48)]
    favicon_images = []
    for fav_size in favicon_sizes:
        print(f"  Creating favicon {fav_size[0]}x{fav_size[0]}...")
        favicon_img = create_favicon_with_text(fav_size[0])
        favicon_images.append(favicon_img)
        
        if fav_size[0] >= 32:
            text_type = "Full 'Bradley Health' text (very small)"
        else:
            text_type = "No text (too small)"
        print(f"    ✅ {text_type}")
    
    favicon_images[0].save('assets/favicon.ico', format='ICO', sizes=favicon_sizes)
    print("  ✅ Saved favicon.ico")
    
    # Create favicon.svg
    print("  Creating favicon.svg...")
    svg_content = '''<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="4" fill="#3b82f6"/>
  <path d="M16 8c-2 0-4 1-4 3 0 1 0 2 1 3l3 3 3-3c1-1 1-2 1-3 0-2-2-3-4-3z" fill="#ef4444"/>
  <path d="M16 12c-1 0-2 0-2 1 0 1 0 1 1 1l1 1 1-1c1 0 1 0 1-1 0-1-1-1-2-1z" fill="white"/>
  <text x="16" y="26" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="4" font-weight="bold">BH</text>
</svg>'''
    
    with open('assets/favicon.svg', 'w') as f:
        f.write(svg_content)
    print("    ✅ BH abbreviation")
    
    print("\n🎉 All icons updated with proper text sizing!")
    print("\n📋 Text sizing summary:")
    print("  • 512x512, 192x192, 180x180, 144x144: Full 'Bradley Health' text (large)")
    print("  • 96x96, 72x72: Full 'Bradley Health' text (medium)")
    print("  • 48x48, 32x32: Full 'Bradley Health' text (small)")
    print("  • 16x16: No text (too small)")
    print("  • All text is white and properly centered")
    print("  • Font size scales appropriately for each icon size")

if __name__ == "__main__":
    main()
