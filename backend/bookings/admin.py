from django.contrib import admin
from .models import Booking, BookingSeat


class BookingSeatInline(admin.TabularInline):
    model = BookingSeat
    extra = 0
    readonly_fields = ['seat']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'show', 'total_price', 'status', 'booking_time']
    list_filter = ['status']
    search_fields = ['user__name', 'user__email']
    inlines = [BookingSeatInline]
