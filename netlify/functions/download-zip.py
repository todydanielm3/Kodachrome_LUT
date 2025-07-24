import json
import base64
import io
import zipfile
import pathlib
from PIL import Image
from pillow_lut import load_cube_file

def handler(event, context):
    # Headers CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
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
        body_json = json.loads(event['body'])
        selected_luts = body_json.get('selected_luts', [])
        filename = body_json.get('filename', 'image')
        
        if not selected_luts:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Nenhum LUT selecionado'})
            }
        
        # Obter imagens processadas do cache/sessão (simplified)
        # Em produção, você salvaria as imagens processadas em um storage temporário
        # Por agora, retornar erro pedindo para reprocessar
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({
                'error': 'Imagens não encontradas. Por favor, processe a imagem novamente.'
            })
        }
        
    except Exception as e:
        print(f"Erro: {e}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Erro interno: {str(e)}'})
        }
