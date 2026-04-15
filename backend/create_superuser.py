import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_super_user():
    email = 'admin@example.com'
    name = 'Admin User'
    password = 'adminpassword123'
    
    # Check if user already exists
    if User.objects.filter(email=email).exists():
        print(f"Superuser '{email}' already exists.")
    else:
        # Create the superuser
        User.objects.create_superuser(email=email, name=name, password=password)
        print(f"Superuser '{email}' created successfully! Password: '{password}'")

if __name__ == '__main__':
    create_super_user()
