"""
Seed the database with sample movies, theatres, screens, seats, and shows.
Usage: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from movies.models import Movie, Theatre, Screen, Seat, Show


class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('🎬 Seeding database...')

        # ─── Movies ───────────────────────────────────────
        movies_data = [
            {
                'title': 'Pushpa 2: The Rule',
                'genre': 'Action',
                'duration': 180,
                'language': 'Hindi',
                'release_date': '2024-12-05',
                'description': 'Pushpa Raj returns with a vengeance in this action-packed sequel. The struggle between Pushpa and Bhanwar Singh Shekhawat intensifies as the stakes rise higher than ever.',
                'rating': 8.2,
                'trailer_url': 'https://www.youtube.com/embed/Q1NKMPhP8PY',
            },
            {
                'title': 'Dune: Part Two',
                'genre': 'Sci-Fi',
                'duration': 166,
                'language': 'English',
                'release_date': '2024-03-01',
                'description': 'Paul Atreides unites with the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
                'rating': 8.8,
                'trailer_url': 'https://www.youtube.com/embed/Way9Dexny3w',
            },
            {
                'title': 'Stree 2',
                'genre': 'Comedy',
                'duration': 150,
                'language': 'Hindi',
                'release_date': '2024-08-15',
                'description': 'The gang is back to face a new supernatural threat in the town of Chanderi. More laughs, more scares, more chaos.',
                'rating': 7.5,
                'trailer_url': 'https://www.youtube.com/embed/KmWrsFkse0o',
            },
            {
                'title': 'The Batman Returns',
                'genre': 'Action',
                'duration': 155,
                'language': 'English',
                'release_date': '2025-10-01',
                'description': 'Batman faces a new criminal mastermind who threatens to unravel the very fabric of Gotham City.',
                'rating': 8.0,
                'trailer_url': '',
            },
            {
                'title': 'Fighter',
                'genre': 'Action',
                'duration': 166,
                'language': 'Hindi',
                'release_date': '2024-01-25',
                'description': 'An aerial action film showcasing the bravery and valor of the Indian Air Force.',
                'rating': 6.8,
                'trailer_url': 'https://www.youtube.com/embed/_e5pMg5ddLM',
            },
            {
                'title': 'Oppenheimer',
                'genre': 'Drama',
                'duration': 180,
                'language': 'English',
                'release_date': '2023-07-21',
                'description': 'The story of J. Robert Oppenheimer and the creation of the atomic bomb during World War II.',
                'rating': 9.0,
                'trailer_url': 'https://www.youtube.com/embed/uYPbbksJxIg',
            },
            {
                'title': 'Kalki 2898 AD',
                'genre': 'Sci-Fi',
                'duration': 181,
                'language': 'Hindi',
                'release_date': '2024-06-27',
                'description': 'Set in a dystopian future, this epic sci-fi blends mythology with futuristic elements.',
                'rating': 7.8,
                'trailer_url': 'https://www.youtube.com/embed/o_wrdU1dNjI',
            },
            {
                'title': 'RRR: Rise Roar Revolt',
                'genre': 'Action',
                'duration': 187,
                'language': 'Telugu',
                'release_date': '2022-03-25',
                'description': 'A fictional tale about two legendary revolutionaries and their journey far from home.',
                'rating': 8.5,
                'trailer_url': 'https://www.youtube.com/embed/f_vbAtFSEc0',
            },
        ]

        movies = []
        for data in movies_data:
            movie, created = Movie.objects.get_or_create(
                title=data['title'],
                defaults=data
            )
            movies.append(movie)
            status = '✅ Created' if created else '⏭️  Exists'
            self.stdout.write(f'  {status}: {movie.title}')

        # ─── Theatres ─────────────────────────────────────
        theatres_data = [
            {'name': 'PVR Cinemas', 'location': 'Phoenix Mall, Lower Parel', 'city': 'Mumbai'},
            {'name': 'INOX Megaplex', 'location': 'Inorbit Mall, Malad', 'city': 'Mumbai'},
            {'name': 'Cinepolis', 'location': 'Viviana Mall, Thane', 'city': 'Mumbai'},
            {'name': 'PVR IMAX', 'location': 'Select Citywalk, Saket', 'city': 'Delhi'},
            {'name': 'Carnival Cinemas', 'location': 'Glomax Mall, Bhiwandi', 'city': 'Mumbai'},
        ]

        theatres = []
        for data in theatres_data:
            theatre, created = Theatre.objects.get_or_create(
                name=data['name'],
                location=data['location'],
                defaults=data
            )
            theatres.append(theatre)
            status = '✅ Created' if created else '⏭️  Exists'
            self.stdout.write(f'  {status}: {theatre.name}')

        # ─── Screens & Seats ─────────────────────────────
        rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
        seats_per_row = 12

        for theatre in theatres:
            for screen_num in range(1, 4):  # 3 screens per theatre
                total_seats = len(rows) * seats_per_row
                screen, created = Screen.objects.get_or_create(
                    theatre=theatre,
                    screen_number=screen_num,
                    defaults={'total_seats': total_seats}
                )

                if created:
                    self.stdout.write(f'  ✅ Created: {screen}')
                    # Create seats
                    seat_objects = []
                    for row in rows:
                        for col in range(1, seats_per_row + 1):
                            seat_type = 'VIP' if row in ['A', 'B'] else 'NORMAL'
                            seat_objects.append(Seat(
                                screen=screen,
                                seat_number=f'{row}{col}',
                                seat_type=seat_type,
                                row_name=row,
                            ))
                    Seat.objects.bulk_create(seat_objects, ignore_conflicts=True)
                    self.stdout.write(f'    ✅ Created {len(seat_objects)} seats')
                else:
                    self.stdout.write(f'  ⏭️  Exists: {screen}')

        # ─── Shows ────────────────────────────────────────
        now = timezone.now()
        show_times = [
            now.replace(hour=10, minute=0, second=0, microsecond=0),
            now.replace(hour=13, minute=30, second=0, microsecond=0),
            now.replace(hour=17, minute=0, second=0, microsecond=0),
            now.replace(hour=21, minute=0, second=0, microsecond=0),
        ]

        screens = Screen.objects.all()
        show_count = 0
        for i, movie in enumerate(movies):
            # Assign each movie to 2-3 screens
            assigned_screens = screens[i % len(screens): i % len(screens) + 3]
            for screen in assigned_screens:
                for day_offset in range(3):  # Shows for next 3 days
                    for show_time in show_times:
                        st = show_time + timedelta(days=day_offset)
                        _, created = Show.objects.get_or_create(
                            movie=movie,
                            screen=screen,
                            show_time=st,
                            defaults={
                                'price': 250.00 if screen.screen_number == 1 else 200.00,
                                'vip_price': 450.00 if screen.screen_number == 1 else 350.00,
                            }
                        )
                        if created:
                            show_count += 1

        self.stdout.write(f'  ✅ Created {show_count} shows')
        self.stdout.write(self.style.SUCCESS('\n🎉 Database seeded successfully!'))
