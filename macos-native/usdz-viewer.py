#!/usr/bin/env python3
import sys
import json
import struct
import subprocess
import tempfile
import os
import time
import urllib.request

def read_message():
    raw_length = sys.stdin.buffer.read(4)
    if not raw_length:
        sys.exit(0)
    message_length = struct.unpack('<I', raw_length)[0]
    message = sys.stdin.buffer.read(message_length).decode('utf-8')
    return json.loads(message)

def send_message(message):
    encoded = json.dumps(message).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('<I', len(encoded)))
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()

def main():
    try:
        message = read_message()
        url = message.get('url')
        ext = url.split('.')[-1]
        timestamp = int(time.time())
        dest = os.path.join(tempfile.gettempdir(), f'model_{timestamp}.{ext}')

        urllib.request.urlretrieve(url, dest)

        subprocess.Popen(['open', '-a', 'Preview', dest])

        send_message({ "status": "ok", "path": dest })

    except Exception as e:
        send_message({ "status": "error", "message": str(e) })

if __name__ == '__main__':
    main()
