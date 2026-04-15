from django.db import models


class Movie(models.Model):
    """Movie information."""
    title = models.CharField(max_length=255)
    genre = models.CharField(max_length=100)
    duration = models.IntegerField(help_text="Duration in minutes")
    language = models.CharField(max_length=50)
    release_date = models.DateField()
    poster = models.ImageField(upload_to='posters/', blank=True, null=True)
    description = models.TextField(blank=True, default='')
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    trailer_url = models.URLField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'movies'
        ordering = ['-release_date']


class Theatre(models.Model):
    """Theatre / Cinema hall."""
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    city = models.CharField(max_length=100, default='Mumbai')

    def __str__(self):
        return f"{self.name} - {self.location}"

    class Meta:
        db_table = 'theatres'


class Screen(models.Model):
    """Screen within a theatre."""
    theatre = models.ForeignKey(Theatre, on_delete=models.CASCADE, related_name='screens')
    screen_number = models.IntegerField()
    total_seats = models.IntegerField()

    def __str__(self):
        return f"{self.theatre.name} - Screen {self.screen_number}"

    class Meta:
        db_table = 'screens'
        unique_together = ['theatre', 'screen_number']


class Seat(models.Model):
    """Individual seat in a screen."""
    SEAT_TYPES = [
        ('NORMAL', 'Normal'),
        ('VIP', 'VIP'),
    ]

    screen = models.ForeignKey(Screen, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.CharField(max_length=10)  # e.g., "A1", "B5"
    seat_type = models.CharField(max_length=10, choices=SEAT_TYPES, default='NORMAL')
    row_name = models.CharField(max_length=5, default='A')

    def __str__(self):
        return f"{self.screen} - {self.seat_number} ({self.seat_type})"

    class Meta:
        db_table = 'seats'
        unique_together = ['screen', 'seat_number']
        ordering = ['row_name', 'seat_number']


class Show(models.Model):
    """A movie showing at a specific screen and time."""
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='shows')
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE, related_name='shows')
    show_time = models.DateTimeField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    vip_price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.movie.title} @ {self.screen} - {self.show_time}"

    class Meta:
        db_table = 'shows'
        ordering = ['show_time']
