import os
import sys

# Add python directory to path so imports work seamlessly from backend root
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'python'))

from app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("=" * 55)
    print(f"🌟 Mindmitra-AI Flask Backend running on http://localhost:{port}")
    print(f"📡 API Health Check: http://localhost:{port}/api/health")
    print(f"💬 Chat: http://localhost:{port}/api/chat/respond")
    print(f"🧠 Emotion: http://localhost:{port}/api/emotion/analyze")
    print(f"📊 Analysis: http://localhost:{port}/api/analysis/unified")
    print(f"🔐 Auth: http://localhost:{port}/api/auth/login")
    print("=" * 55)
    app.run(host='0.0.0.0', port=port, debug=True)

