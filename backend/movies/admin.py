from django.contrib import admin
from .models import Movie, Theatre, Screen, Seat, Show


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'genre', 'language', 'duration', 'release_date', 'rating', 'is_active']
    search_fields = ['title', 'genre']
    list_filter = ['genre', 'language', 'is_active']


@admin.register(Theatre)
class TheatreAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'location', 'city']
    search_fields = ['name', 'location']


@admin.register(Screen)
class ScreenAdmin(admin.ModelAdmin):
    list_display = ['id', 'theatre', 'screen_number', 'total_seats']
    list_filter = ['theatre']


@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ['id', 'screen', 'seat_number', 'seat_type', 'row_name']
    list_filter = ['seat_type', 'screen']


@admin.register(Show)
class ShowAdmin(admin.ModelAdmin):
    list_display = ['id', 'movie', 'screen', 'show_time', 'price', 'vip_price', 'is_active']
    list_filter = ['is_active', 'movie']
