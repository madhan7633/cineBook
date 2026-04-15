"""
URL configuration for Movie Ticket Booking project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', lambda r: __import__('django.http').http.JsonResponse({"message": "CineBook API is running", "version": "1.0", "status": "healthy"})),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/movies/', include('movies.urls')),
    path('api/bookings/', include('bookings.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
