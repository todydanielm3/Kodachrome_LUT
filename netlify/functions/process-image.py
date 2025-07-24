import json
import base64
import io
import os
import pathlib
import sys

try:
    from PIL import Image, ImageOps
    from pillow_lut import load_cube_file
except ImportError as e:
    print(f"Import error: {e}")

def handler(event, context):
    # Headers CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }
    
    # Handle preflight OPTIONS request
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    if event['httpMethod'] != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        # Parse body (pode ser base64 encoded)
        if event.get('isBase64Encoded', False):
            body = base64.b64decode(event['body']).decode('utf-8')
        else:
            body = event['body']
        
        # Para upload de arquivo via FormData, precisamos processar diferente
        # Por simplicidade, vamos aceitar JSON com imagem em base64
        try:
            body_json = json.loads(body)
            image_b64 = body_json.get('image_data', '')
            if not image_b64:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'image_data é obrigatório'})
                }
            
            # Remove data URL prefix se presente
            if ',' in image_b64:
                image_b64 = image_b64.split(',')[1]
            
            image_data = base64.b64decode(image_b64)
            
        except Exception as e:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': f'Erro ao processar dados: {str(e)}'})
            }
        
        # Processar imagem
        original = Image.open(io.BytesIO(image_data)).convert("RGB")
        original = ImageOps.exif_transpose(original)
        
        # Redimensionar se muito grande (para performance no Netlify)
        w, h = original.size
        max_size = 800  # Menor para functions
        if max(w, h) > max_size:
            if w > h:
                new_w = max_size
                new_h = int(h * max_size / w)
            else:
                new_h = max_size
                new_w = int(w * max_size / h)
            original = original.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Carregar LUTs
        # No Netlify, os arquivos estão na raiz do projeto
        base_dir = pathlib.Path(__file__).parent.parent.parent
        lut_dir = base_dir / "luts"
        
        # Fallback para desenvolvimento local
        if not lut_dir.exists():
            lut_dir = pathlib.Path("/var/task/luts")  # Netlify path
        
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
        
        # Limitar número de LUTs para não exceder timeout
        max_luts = 20
        lut_paths = lut_paths[:max_luts]
        
        # Processar com cada LUT
        processed_images = {}
        lut_names = []
        
        for lut_path in lut_paths:
            try:
                lut_name = lut_path.stem
                lut = load_cube_file(str(lut_path))
                processed_img = original.filter(lut)
                
                # Converter para base64
                buffer = io.BytesIO()
                processed_img.save(buffer, format='JPEG', quality=80, optimize=True)
                img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
                
                processed_images[lut_name] = img_base64
                lut_names.append(lut_name)
                
            except Exception as e:
                print(f"Erro ao processar LUT {lut_path.stem}: {e}")
                continue
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'luts': lut_names,
                'processed_images': processed_images
            })
        }
        
    except Exception as e:
        print(f"Erro geral: {e}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Erro interno do servidor: {str(e)}'})
        }
