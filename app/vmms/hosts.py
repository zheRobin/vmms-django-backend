from django_hosts import patterns, host

host_patterns = patterns('',
                         host(r'management', 'vmms_management.urls', name='management'),
                         host(r'music', 'vmms_music.urls', name='music'),
                         host(r'client', 'vmms_client.urls', name='client'),
                         host(r'api', 'vmms.urls', name='api'),
                         )
