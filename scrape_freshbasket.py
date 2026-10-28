import subprocess
import json
import os
import time
import re

def clean_html(raw_html):
    if not raw_html:
        return ""
    clean = re.sub(r'<[^>]+>', ' ', raw_html)
    return " ".join(clean.split())

def fetch_json_via_curl(url):
    try:
        cmd = [
            'curl.exe', '-s',
            '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            '-H', 'Accept: application/json, text/plain, */*',
            url
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
        if result.returncode == 0 and result.stdout.strip():
            return json.loads(result.stdout)
        else:
            print(f"Curl failed for {url}: {result.stderr}")
            return None
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def main():
    os.makedirs('data', exist_ok=True)
    print("Fetching Fresh Basket PK collections via curl...")
    collections_data = fetch_json_via_curl("https://freshbasket.com.pk/collections.json")
    
    categories = []
    if collections_data and 'collections' in collections_data:
        for c in collections_data['collections']:
            title = c.get('title', '').strip()
            handle = c.get('handle', '').strip()
            if not title or handle == 'frontpage' or 'all-items' in handle:
                continue
            
            img_src = ""
            if c.get('image') and isinstance(c['image'], dict):
                img_src = c['image'].get('src', '')
            
            categories.append({
                'name': title,
                'slug': handle,
                'description': clean_html(c.get('body_html', '')),
                'image': img_src
            })
    
    print(f"Collected {len(categories)} categories.")

    all_products = []
    seen_ids = set()
    
    for page in range(1, 4):
        print(f"Fetching products page {page}...")
        p_url = f"https://freshbasket.com.pk/products.json?limit=250&page={page}"
        p_data = fetch_json_via_curl(p_url)
        if not p_data or 'products' not in p_data or not p_data['products']:
            print(f"No products found on page {page}, stopping.")
            break
            
        prods = p_data['products']
        print(f"Page {page} yielded {len(prods)} products.")
        
        for p in prods:
            pid = p.get('id')
            if pid in seen_ids:
                continue
            seen_ids.add(pid)
            
            title = p.get('title', '').strip()
            handle = p.get('handle', '').strip()
            desc = clean_html(p.get('body_html', ''))
            vendor = p.get('vendor', 'Fresh Basket')
            product_type = p.get('product_type', 'Grocery')
            tags = p.get('tags', [])
            
            variants = p.get('variants', [])
            price = 0.0
            compare_price = None
            sku = f"FB-{pid}"
            barcode = ""
            weight = ""
            
            if variants:
                v = variants[0]
                try:
                    price = float(v.get('price', 0))
                except:
                    price = 0.0
                if v.get('compare_at_price'):
                    try:
                        compare_price = float(v['compare_at_price'])
                    except:
                        pass
                if v.get('sku'):
                    sku = v['sku']
                if v.get('barcode'):
                    barcode = v['barcode']
                grams = v.get('grams', 0)
                if grams > 0:
                    weight = f"{grams}g" if grams < 1000 else f"{grams/1000:.1f}kg"
            
            images = [img['src'] for img in p.get('images', []) if img.get('src')]
            primary_image = images[0] if images else ""
            
            unit = weight
            if not unit:
                match = re.search(r'(\d+(?:\.\d+)?\s*(?:kg|g|gm|ml|liter|litre|ltr|pack|pcs|dozen|bundle))', title, re.IGNORECASE)
                if match:
                    unit = match.group(1).strip()
                else:
                    unit = "1 unit"
            
            all_products.append({
                'external_id': pid,
                'name': title,
                'slug': handle,
                'description': desc if desc else f"Fresh and authentic {title}.",
                'brand': vendor,
                'category_name': product_type if product_type else 'Grocery',
                'tags': tags,
                'price': price,
                'compare_at_price': compare_price,
                'sku': sku,
                'barcode': barcode if barcode else f"896400{pid % 1000000:06d}",
                'unit': unit,
                'stock_quantity': 45,
                'primary_image': primary_image,
                'images': images
            })
            
        time.sleep(1)

    output_path = os.path.join('data', 'freshbasket_catalog.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({
            'categories': categories,
            'products': all_products,
            'total_categories': len(categories),
            'total_products': len(all_products)
        }, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully scraped {len(categories)} categories and {len(all_products)} products!")
    print(f"Catalog saved to {output_path}")

if __name__ == '__main__':
    main()
