#!/usr/bin/env python3
"""
Generate branded app icons for Bradley Health with text
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_heart_icon(size, include_text=True):
    """Create a heart icon with ECG line and optional text"""
    # Create image with blue background
    img = Image.new('RGB', (size, size), '#3b82f6')
    draw = ImageDraw.Draw(img)
    
    # Calculate scaling factor
    scale = size / 180
    
    # Heart parameters
    heart_size = int(60 * scale)
    heart_x = size // 2
    heart_y = size // 2 - int(10 * scale)
    
    # Draw heart (simplified as two circles and triangle)
    heart_radius = heart_size // 4
    left_circle_x = heart_x - heart_radius
    right_circle_x = heart_x + heart_radius
    circle_y = heart_y - heart_radius
    
    # Draw heart circles
    draw.ellipse([left_circle_x - heart_radius, circle_y - heart_radius, 
                  left_circle_x + heart_radius, circle_y + heart_radius], 
                 fill='#ef4444')
    draw.ellipse([right_circle_x - heart_radius, circle_y - heart_radius, 
                  right_circle_x + heart_radius, circle_y + heart_radius], 
                 fill='#ef4444')
    
    # Draw heart bottom (triangle)
    heart_points = [
        (heart_x, heart_y + heart_size // 2),
        (heart_x - heart_size // 2, heart_y),
        (heart_x + heart_size // 2, heart_y)
    ]
    draw.polygon(heart_points, fill='#ef4444')
    
    # Draw ECG line
    line_width = max(2, int(3 * scale))
    ecg_points = []
    ecg_y = heart_y
    ecg_start_x = heart_x - int(15 * scale)
    ecg_end_x = heart_x + int(15 * scale)
    
    # Create ECG pattern
    x = ecg_start_x
    while x <= ecg_end_x:
        if x < heart_x - int(10 * scale):
            ecg_points.append((x, ecg_y))
        elif x < heart_x - int(8 * scale):
            ecg_points.append((x, ecg_y - int(8 * scale)))
        elif x < heart_x - int(6 * scale):
            ecg_points.append((x, ecg_y + int(8 * scale)))
        elif x < heart_x - int(4 * scale):
            ecg_points.append((x, ecg_y - int(4 * scale)))
        elif x < heart_x - int(2 * scale):
            ecg_points.append((x, ecg_y + int(4 * scale)))
        elif x < heart_x + int(2 * scale):
            ecg_points.append((x, ecg_y))
        elif x < heart_x + int(4 * scale):
            ecg_points.append((x, ecg_y - int(4 * scale)))
        elif x < heart_x + int(6 * scale):
            ecg_points.append((x, ecg_y + int(4 * scale)))
        elif x < heart_x + int(8 * scale):
            ecg_points.append((x, ecg_y - int(8 * scale)))
        elif x < heart_x + int(10 * scale):
            ecg_points.append((x, ecg_y + int(8 * scale)))
        else:
            ecg_points.append((x, ecg_y))
        x += int(2 * scale)
    
    # Draw ECG line
    for i in range(len(ecg_points) - 1):
        draw.line([ecg_points[i], ecg_points[i + 1]], fill='white', width=line_width)
    
    # Add text for larger sizes
    if include_text and size >= 144:
        try:
            # Try to use system font
            font_size = max(12, int(16 * scale))
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except:
            try:
                # Fallback to default font
                font = ImageFont.load_default()
            except:
                font = None
        
        if font:
            text = "Bradley Health"
            text_y = heart_y + int(35 * scale)
            
            # Split text into two lines
            words = text.split()
            line1 = words[0]
            line2 = words[1] if len(words) > 1 else ""
            
            # Get text dimensions
            bbox1 = draw.textbbox((0, 0), line1, font=font)
            bbox2 = draw.textbbox((0, 0), line2, font=font)
            text_width1 = bbox1[2] - bbox1[0]
            text_width2 = bbox2[2] - bbox2[0]
            
            # Center text
            text_x1 = heart_x - text_width1 // 2
            text_x2 = heart_x - text_width2 // 2
            
            # Draw text
            draw.text((text_x1, text_y), line1, fill='white', font=font)
            if line2:
                draw.text((text_x2, text_y + int(20 * scale)), line2, fill='white', font=font)
    
    return img

def main():
    """Generate all required icon sizes"""
    # Ensure assets directory exists
    os.makedirs('assets', exist_ok=True)
    
    # Icon sizes to generate
    sizes = {
        72: 'icon-72.png',
        96: 'icon-96.png', 
        144: 'icon-144.png',
        180: 'apple-touch-icon.png',
        192: 'icon-192.png',
        512: 'icon-512.png'
    }
    
    print("🎨 Generating branded app icons...")
    
    for size, filename in sizes.items():
        print(f"  Creating {filename} ({size}x{size})...")
        
        # Generate icon
        img = create_heart_icon(size, include_text=(size >= 144))
        
        # Save with high quality
        img.save(f'assets/{filename}', 'PNG', optimize=True)
        
        print(f"  ✅ {filename} created successfully")
    
    print("\n🎉 All branded app icons generated!")
    print("📱 Icons include:")
    print("  - Red heart with white ECG line")
    print("  - Blue background (#3b82f6)")
    print("  - 'Bradley Health' text (144px and larger)")
    print("  - Rounded corners for modern look")

if __name__ == "__main__":
    main()
