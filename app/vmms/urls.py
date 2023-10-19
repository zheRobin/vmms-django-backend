from django.conf.urls import url, include
from rest_framework import routers
from vmms import views
from django.contrib.staticfiles.urls import staticfiles_urlpatterns


router = routers.DefaultRouter()
router.register(r'event', views.EventViewSet)
router.register(r'group-event', views.GroupEventViewSet)
router.register(r'client-content-request', views.ClientContentRequestViewSet)
router.register(r'client-volume-request', views.ClientVolumeRequestViewSet)
router.register(r'client-folder', views.ClientFolderViewSet)
router.register(r'client-group', views.ClientGroupViewSet)
router.register(r'client', views.ClientViewSet, 'client')
router.register(r'player-version', views.PlayerVersionViewSet)
router.register(r'playlist-folder', views.PlaylistFolderViewSet)
router.register(r'playlist', views.PlaylistViewSet, 'playlist')
router.register(r'program', views.ProgramViewSet, 'program')
router.register(r'program-preview-link', views.ProgramPreviewLinkViewSet)
router.register(r'program-folder', views.ProgramFolderViewSet)
router.register(r'promotion', views.PromotionViewSet, 'promotion')
router.register(r'user', views.UserViewSet)
router.register(r'song', views.SongViewSet, 'song')
router.register(r'tag', views.ExternalTagViewSet, 'tag')


urlpatterns = [
    url(r'^$', views.IndexView.as_view()),
    # Version 6
    url(r'^api/v6/client/schedule', views.get_schedule_v6),

    # Version 5
    url(r'^api/v4/client/schedule', views.get_schedule_v5),

    # Version 4
    url(r'^api/v4/client/schedule', views.get_schedule_v4),
    url(r'^api/v4/version/latest', views.get_latest_version),
    
    # Version 3
    url(r'^api/v3/client/schedule', views.get_schedule_v3),
    url(r'^api/v3/version/latest', views.get_latest_version),
    
    # Version 2
    url(r'^api/v2/client/schedule', views.get_schedule_v2),
    url(r'^api/v2/version/latest', views.get_latest_version),
    
    # Version 1
    url(r'^api/v1/preview-link/', views.program_preview_link),
    url(r'^api/v1/logout', views.logout_view),
    url(r'^api/v1/login', views.login_view, name='login'),
    url(r'^api/v1/obtain-token/', views.obtain_token_view, name='obtain-token'),
    url(r'^api/v1/version/latest', views.get_latest_version),
    url(r'^api/v1/filter/data', views.filter_data_view),
    url(r'^api/v1/profile', views.profile_view),
    url(r'^api/v1/category', views.categories_list),
    url(r'^api/v1/genre', views.genres_list),
    url(r'^api/v1/playlist/preview', views.playlist_preview),
    url(r'^api/v1/playlist/song-count/', views.get_songs_count_for_playlists),
    url(r'^api/v1/program/preview', views.program_preview),
    url(r'^api/v1/program/song-count/', views.get_songs_count_for_programs),
    url(r'^api/v1/playlist/(?P<id>[0-9]+)/dependents/', views.playlist_dependents),
    url(r'^api/v1/program/(?P<id>[0-9]+)/dependents/', views.program_dependents),
    url(r'^api/v1/client/sync', views.sync_manual),
    url(r'^api/v1/client/schedule', views.get_schedule),
    url(r'^api/v1/client/master-schedule/', views.client_master_schedule_toggle_all),
    url(r'^api/v1/client/(?P<client_id>[-\w]+)/master-schedule/', views.client_master_schedule_toggle),
    url(r'^api/v1/client/(?P<id>[-\w]+)/copy/', views.copy_client),
    url(r'^api/v1/client/(?P<id>[-\w]+)/reset-api-key/', views.reset_api_key),
    url(r'^api/v1/client/(?P<id>[-\w]+)/reset-login-key/', views.reset_login_key),
    url(r'^api/v1/client/(?P<id>-?[0-9]+)/schedule/', views.get_schedule_for_period),
    url(r'^api/v1/client/secret/(?P<secret>[-\w]+)', views.get_client_secret),
    url(r'^api/v1/client-group/(?P<id>-?[0-9]+)/schedule/', views.get_group_schedule_for_period),
    url(r'^api/v1/s3/sign-upload-request', views.sign_upload_request),
    url(r'^api/v1/', include(router.urls)),
]
urlpatterns += staticfiles_urlpatterns()
