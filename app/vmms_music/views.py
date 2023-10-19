from django.views.generic import TemplateView


class IndexView(TemplateView):
    template_name = 'index_music.html'
