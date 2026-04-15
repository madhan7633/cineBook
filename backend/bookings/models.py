from django.db import models
from django.conf import settings
from movies.models import Show, Seat


class Booking(models.Model):
    """A booking made by a user for a specific show."""
    STATUS_CHOICES = [
        ('BOOKED', 'Booked'),
        ('CANCELLED', 'Cancelled'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    show = models.ForeignKey(Show, on_delete=models.CASCADE, related_name='bookings')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='BOOKED')
    payment_method = models.CharField(max_length=50, default='ONLINE')
    booking_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking #{self.id} - {self.user.name} - {self.show.movie.title}"

    class Meta:
        db_table = 'bookings'
        ordering = ['-booking_time']


class BookingSeat(models.Model):
    """Junction table linking bookings to seats."""
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='booking_seats')
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE, related_name='booking_seats')

    def __str__(self):
        return f"Booking #{self.booking.id} - Seat {self.seat.seat_number}"

    class Meta:
        db_table = 'booking_seats'
        unique_together = ['booking', 'seat']
