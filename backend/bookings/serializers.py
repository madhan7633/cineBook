from rest_framework import serializers
from .models import Booking, BookingSeat
from movies.serializers import SeatSerializer, ShowSerializer


class BookingSeatSerializer(serializers.ModelSerializer):
    seat_number = serializers.CharField(source='seat.seat_number', read_only=True)
    seat_type = serializers.CharField(source='seat.seat_type', read_only=True)
    row_name = serializers.CharField(source='seat.row_name', read_only=True)

    class Meta:
        model = BookingSeat
        fields = ['id', 'seat', 'seat_number', 'seat_type', 'row_name']


class BookingListSerializer(serializers.ModelSerializer):
    """Serializer for booking history list."""
    movie_title = serializers.CharField(source='show.movie.title', read_only=True)
    movie_poster = serializers.SerializerMethodField()
    theatre_name = serializers.CharField(source='show.screen.theatre.name', read_only=True)
    screen_number = serializers.IntegerField(source='show.screen.screen_number', read_only=True)
    show_time = serializers.DateTimeField(source='show.show_time', read_only=True)
    seats = BookingSeatSerializer(source='booking_seats', many=True, read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'movie_title', 'movie_poster', 'theatre_name',
                  'screen_number', 'show_time', 'seats', 'total_price',
                  'status', 'payment_method', 'booking_time']

    def get_movie_poster(self, obj):
        if obj.show.movie.poster:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.show.movie.poster.url)
        return None


class CreateBookingSerializer(serializers.Serializer):
    """Serializer for creating a new booking."""
    show_id = serializers.IntegerField()
    seat_ids = serializers.ListField(child=serializers.IntegerField(), min_length=1)

    def validate(self, data):
        from movies.models import Show, Seat

        # Validate show exists
        try:
            show = Show.objects.get(id=data['show_id'], is_active=True)
        except Show.DoesNotExist:
            raise serializers.ValidationError({'show_id': 'Invalid or inactive show.'})

        # Validate seats exist and belong to the show's screen
        seats = Seat.objects.filter(id__in=data['seat_ids'], screen=show.screen)
        if seats.count() != len(data['seat_ids']):
            raise serializers.ValidationError({'seat_ids': 'One or more seats are invalid.'})

        # Check if any seats are already booked for this show
        booked_seats = BookingSeat.objects.filter(
            seat_id__in=data['seat_ids'],
            booking__show=show,
            booking__status='BOOKED'
        ).values_list('seat_id', flat=True)

        if booked_seats:
            raise serializers.ValidationError({
                'seat_ids': f'Seats already booked: {list(booked_seats)}'
            })

        data['show'] = show
        data['seats'] = seats
        return data
