from django.urls import path
from .views import MovieListView, MovieDetailView, ShowListView, SeatListView, TheatreListView

urlpatterns = [
    path('', MovieListView.as_view(), name='movie-list'),
    path('<int:pk>/', MovieDetailView.as_view(), name='movie-detail'),
    path('shows/', ShowListView.as_view(), name='show-list'),
    path('seats/', SeatListView.as_view(), name='seat-list'),
    path('theatres/', TheatreListView.as_view(), name='theatre-list'),
]
