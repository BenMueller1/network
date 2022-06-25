
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("newPost", views.new_post, name="new_post"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<int:user_id>", views.profile, name="profile_page"),

    # API paths
    path("getAllPosts", views.get_all_posts, name="get_all_posts"),
    path("follow/<int:followee_id>", views.follow, name="follow"),
    path("unfollow/<int:unfollowee_id>", views.unfollow, name="unfollow"),
    path("getUser", views.get_user, name="get_user"),
    path("getAllPostsFollowedBy/<int:user_id>", views.get_following_posts, name="get_following_posts")
]
