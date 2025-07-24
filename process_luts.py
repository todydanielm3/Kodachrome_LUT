#!/usr/bin/env python3
import json
import base64
import io
import os
import sys
import pathlib
from PIL import Image, ImageOps

# Adicionar o diretório local ao path para importar pillow_lut
sys.path.insert(0, '/home/daniel-moraes/coding/Kodachrome_LUT/.venv/lib/python3.12/site-packages')

try:
    from pillow_lut import load_cube_file
except ImportError:
    print("pillow_lut não encontrado", file=sys.stderr)
    sys.exit(1)

def handler(event, context):
    # Headers CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    }
    
    # Handle preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        # Parse body
        body_str = event.get('body', '{}')
        if event.get('isBase64Encoded', False):
            body_str = base64.b64decode(body_str).decode('utf-8')
        
        body = json.loads(body_str)
        image_data = body.get('image_data', '')

        if not image_data:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'image_data é obrigatório'})
            }
        
        # Remove data URL prefix se presente
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decodificar imagem
        try:
            image_bytes = base64.b64decode(image_data)
            original = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            original = ImageOps.exif_transpose(original)
        except Exception as e:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': f'Erro ao processar imagem: {str(e)}'})
            }
        
        # Redimensionar se muito grande (para performance)
        w, h = original.size
        max_size = 600  # Menor para demo local
        if max(w, h) > max_size:
            if w > h:
                new_w = max_size
                new_h = int(h * max_size / w)
            else:
                new_h = max_size
                new_w = int(w * max_size / h)
            original = original.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Carregar LUTs
        base_dir = pathlib.Path(__file__).parent.parent.parent
        lut_dir = base_dir / "luts"
        
        if not lut_dir.exists():
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': f'Pasta de LUTs não encontrada em {lut_dir}'})
            }
        
        lut_paths = sorted(lut_dir.glob("*.cube"))
        
        if not lut_paths:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': 'Nenhum LUT encontrado'})
            }
        
        # Processar com cada LUT
        processed_images = {}
        lut_names = []
        error_count = 0
        
        # Processar todos os LUTs
        for i, lut_path in enumerate(lut_paths):
            try:
                lut_name = lut_path.stem
                lut = load_cube_file(str(lut_path))
                processed_img = original.filter(lut)
                
                # Converter para base64
                buffer = io.BytesIO()
                processed_img.save(buffer, format='JPEG', quality=75, optimize=True)
                img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
                
                processed_images[lut_name] = img_base64
                lut_names.append(lut_name)
                
                # Log de progresso
                if (i + 1) % 50 == 0:
                    print(f"Processados {i + 1}/{len(lut_paths)} LUTs", file=sys.stderr)
                
            except Exception as e:
                error_count += 1
                print(f"Erro ao processar LUT {lut_path.stem}: {e}", file=sys.stderr)
                continue
        
        print(f"Processamento concluído: {len(lut_names)} LUTs processados, {error_count} erros", file=sys.stderr)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'luts': lut_names,
                'processed_images': processed_images,
                'stats': {
                    'total_luts': len(lut_paths),
                    'processed': len(lut_names),
                    'errors': error_count
                }
            })
        }
        
    except Exception as e:
        print(f"Erro geral: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Erro interno do servidor: {str(e)}'})
        }

if __name__ == "__main__":
    # Para teste local
    test_event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'image_data': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
        })
    }
    result = handler(test_event, {})
    print(json.dumps(result, indent=2))
