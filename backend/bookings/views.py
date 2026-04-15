from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from .models import Booking, BookingSeat
from .serializers import BookingListSerializer, CreateBookingSerializer


class CreateBookingView(APIView):
    """Create a new booking with seat selection."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        show = serializer.validated_data['show']
        seats = serializer.validated_data['seats']

        # Calculate total price
        total_price = 0
        for seat in seats:
            if seat.seat_type == 'VIP':
                total_price += float(show.vip_price or show.price)
            else:
                total_price += float(show.price)

        # Use transaction to ensure atomicity
        with transaction.atomic():
            # Double-check seat availability with row-level locking
            booked_seats = BookingSeat.objects.select_for_update().filter(
                seat__in=seats,
                booking__show=show,
                booking__status='BOOKED'
            )

            if booked_seats.exists():
                return Response(
                    {'error': 'One or more seats were just booked by another user. Please try again.'},
                    status=status.HTTP_409_CONFLICT
                )

            # Create booking
            booking = Booking.objects.create(
                user=request.user,
                show=show,
                total_price=total_price,
                status='BOOKED',
            )

            # Create booking seats
            booking_seats = [
                BookingSeat(booking=booking, seat=seat)
                for seat in seats
            ]
            BookingSeat.objects.bulk_create(booking_seats)

        # Return booking details
        booking_data = BookingListSerializer(
            booking,
            context={'request': request}
        ).data

        return Response(booking_data, status=status.HTTP_201_CREATED)


class BookingHistoryView(generics.ListAPIView):
    """Get booking history for the authenticated user."""
    serializer_class = BookingListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user
        ).select_related(
            'show', 'show__movie', 'show__screen', 'show__screen__theatre'
        ).prefetch_related('booking_seats', 'booking_seats__seat')


class CancelBookingView(APIView):
    """Cancel a booking."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if booking.status == 'CANCELLED':
            return Response(
                {'error': 'Booking already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = 'CANCELLED'
        booking.save()

        return Response({
            'message': 'Booking cancelled successfully',
            'booking': BookingListSerializer(booking, context={'request': request}).data
        })
