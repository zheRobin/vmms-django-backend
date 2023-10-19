from django.core.management.base import BaseCommand
from vmms.models import User


class Command(BaseCommand):

    def handle(self, *args, **options):
        if not User.objects.filter(username="admin-mgmt").exists() and \
           not User.objects.filter(username="admin-music").exists():
            User.objects.create_superuser(
                username="admin-mgmt",
                email="admin1@admin.com", 
                password="admin",
                host="management"
            )
            User.objects.create_superuser(
                username="admin-music",
                email="admin2@admin.com", 
                password="admin",
                host="music"
            )