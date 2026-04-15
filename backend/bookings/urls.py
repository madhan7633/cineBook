from django.urls import path
from .views import CreateBookingView, BookingHistoryView, CancelBookingView

urlpatterns = [
    path('', CreateBookingView.as_view(), name='create-booking'),
    path('history/', BookingHistoryView.as_view(), name='booking-history'),
    path('<int:pk>/cancel/', CancelBookingView.as_view(), name='cancel-booking'),
]
