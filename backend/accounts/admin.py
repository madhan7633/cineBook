from django.contrib import admin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'phone', 'is_active', 'created_at']
    search_fields = ['name', 'email']
    list_filter = ['is_active', 'is_staff']
