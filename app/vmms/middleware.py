from vmms.hosts import host_patterns
from django.utils.deprecation import MiddlewareMixin


class RefererHostMiddleware(MiddlewareMixin):
    def process_request(self, request):
        referrer = request.META.get('HTTP_REFERER', None)
        request.referer_host = None
        if referrer is None:
            return
        for pattern in host_patterns:
            if pattern.compiled_regex.search(referrer):
                request.referer_host = pattern.name
                break
