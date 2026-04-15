from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Exists, OuterRef
from .models import Movie, Theatre, Screen, Seat, Show
from .serializers import (
    MovieListSerializer, MovieDetailSerializer,
    ShowSerializer, SeatSerializer, TheatreSerializer
)
from bookings.models import BookingSeat


class MovieListView(generics.ListAPIView):
    """List all active movies with optional search and genre filter."""
    serializer_class = MovieListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Movie.objects.filter(is_active=True)
        search = self.request.query_params.get('search')
        genre = self.request.query_params.get('genre')
        language = self.request.query_params.get('language')

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(genre__icontains=search)
            )
        if genre:
            queryset = queryset.filter(genre__icontains=genre)
        if language:
            queryset = queryset.filter(language__icontains=language)

        return queryset


class MovieDetailView(generics.RetrieveAPIView):
    """Get movie details by ID."""
    queryset = Movie.objects.filter(is_active=True)
    serializer_class = MovieDetailSerializer
    permission_classes = [permissions.AllowAny]


class ShowListView(generics.ListAPIView):
    """List shows for a specific movie, optionally filtered by city."""
    serializer_class = ShowSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Show.objects.filter(is_active=True).select_related(
            'movie', 'screen', 'screen__theatre'
        )
        movie_id = self.request.query_params.get('movie_id')
        city = self.request.query_params.get('city')

        if movie_id:
            queryset = queryset.filter(movie_id=movie_id)
        if city:
            queryset = queryset.filter(screen__theatre__city__icontains=city)

        return queryset


class SeatListView(APIView):
    """Get all seats for a show with booking status."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        show_id = request.query_params.get('show_id')
        if not show_id:
            return Response(
                {'error': 'show_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            show = Show.objects.select_related('screen').get(id=show_id)
        except Show.DoesNotExist:
            return Response(
                {'error': 'Show not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get all seats for the screen, annotated with booking status
        booked_seat_ids = BookingSeat.objects.filter(
            booking__show_id=show_id,
            booking__status='BOOKED'
        ).values_list('seat_id', flat=True)

        seats = Seat.objects.filter(screen=show.screen).order_by('row_name', 'seat_number')

        seat_data = []
        for seat in seats:
            seat_data.append({
                'id': seat.id,
                'seat_number': seat.seat_number,
                'seat_type': seat.seat_type,
                'row_name': seat.row_name,
                'is_booked': seat.id in booked_seat_ids,
            })

        return Response({
            'show': ShowSerializer(show).data,
            'seats': seat_data,
        })


class TheatreListView(generics.ListAPIView):
    """List all theatres."""
    queryset = Theatre.objects.all()
    serializer_class = TheatreSerializer
    permission_classes = [permissions.AllowAny]
