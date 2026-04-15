from rest_framework import serializers
from .models import Movie, Theatre, Screen, Seat, Show


class MovieListSerializer(serializers.ModelSerializer):
    """Serializer for movie list view (minimal fields)."""
    poster_url = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = ['id', 'title', 'genre', 'duration', 'language',
                  'release_date', 'poster_url', 'rating']

    def get_poster_url(self, obj):
        if obj.poster:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.poster.url)
        return None


class MovieDetailSerializer(serializers.ModelSerializer):
    """Serializer for movie detail view (all fields)."""
    poster_url = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = ['id', 'title', 'genre', 'duration', 'language',
                  'release_date', 'poster_url', 'description',
                  'rating', 'trailer_url']

    def get_poster_url(self, obj):
        if obj.poster:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.poster.url)
        return None


class TheatreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theatre
        fields = ['id', 'name', 'location', 'city']


class ScreenSerializer(serializers.ModelSerializer):
    theatre = TheatreSerializer(read_only=True)

    class Meta:
        model = Screen
        fields = ['id', 'theatre', 'screen_number', 'total_seats']


class SeatSerializer(serializers.ModelSerializer):
    is_booked = serializers.BooleanField(read_only=True, default=False)

    class Meta:
        model = Seat
        fields = ['id', 'seat_number', 'seat_type', 'row_name', 'is_booked']


class ShowSerializer(serializers.ModelSerializer):
    screen = ScreenSerializer(read_only=True)
    movie_title = serializers.CharField(source='movie.title', read_only=True)

    class Meta:
        model = Show
        fields = ['id', 'movie', 'movie_title', 'screen', 'show_time',
                  'price', 'vip_price', 'is_active']
