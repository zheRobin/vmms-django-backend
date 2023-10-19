from django.conf.urls import url, include
from vmms_management import views
from django.contrib.staticfiles.urls import staticfiles_urlpatterns


urlpatterns = [
    url(r'^$', views.IndexView.as_view()),
]
urlpatterns += staticfiles_urlpatterns()
