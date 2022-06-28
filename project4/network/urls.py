
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
    path("getAllPostsFollowedBy/<int:user_id>", views.get_following_posts, name="get_following_posts"),
    path("update/<int:post_id>", views.update_post, name="update_post"),
    path("like/<int:post_id>", views.like_post, name="like_post"),
    path("unlike/<int:post_id>", views.unlike_post, name="like_post"),
    path("getUsersPosts/<int:user_id>", views.get_all_posts_by_user, name="get_all_posts_by_user"),
    path("getUserById/<int:user_id>", views.get_user_by_id, name="get_user_by_id")
]
