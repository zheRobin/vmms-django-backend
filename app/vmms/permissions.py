from rest_framework import permissions


class IsNotUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.group != 'User'


class WhitelistedRefererRequired(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.referer_host is not None


class IsMusicUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.referer_host is not None and request.referer_host == 'music' and request.user.host == 'music'


class IsManagementUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.referer_host is not None and request.referer_host == 'management' and request.user.host == \
               'management '
