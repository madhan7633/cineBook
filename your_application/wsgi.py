import os
import sys

# This is a compatibility file to satisfy Render's default "gunicorn your_application.wsgi" command.
# It adds the backend folder to the Python path and imports the real WSGI application.

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from config.wsgi import application
