from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django import forms
from django.views.decorators.csrf import csrf_exempt
from urllib3 import HTTPResponse

from .models import User, Post, Like

import json
from datetime import datetime

def index(request):
    user = request.user
    return render(request, "network/index.html", {"user": user})


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password, num_followers=0, num_following=0)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def new_post(request):
    if request.method == "POST":
        user = request.user
        body = request.POST["body"]
        new_post = Post(user=user, body=body)
        new_post.save()
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/new_post.html")


def profile(request, user_id):
    users_profile = User.objects.get(id=user_id)
    viewing_user = request.user
    if viewing_user in users_profile.followers.all():
        following = True
    else:
        following = False
    
    #posts = get_all_posts_by_user(users_profile)
    posts=None
    context = {"users_profile": users_profile, "posts": posts, "viewing_user": viewing_user, "following": following}
    return render(request, "network/profile.html", context)



def get_all_posts(request):
    if request.method != "GET":
        return JsonResponse({"error": "Incorrect reqeust method, getting posts requires a GET request"}, status=400)
    
    posts = Post.objects.all()
    posts = posts.order_by("-datetime_posted").all()
    return JsonResponse([post.serialize() for post in posts], safe=False)


def get_all_posts_by_user(request, user_id):
    user = User.objects.filter(id=user_id)[0]
    posts = Post.objects.filter(user=user)
    posts = posts.order_by("-datetime_posted").all()
    return JsonResponse([post.serialize() for post in posts], safe=False)


def follow(request, followee_id):
    follower = request.user
    followee = User.objects.filter(id=followee_id)[0]

    followee.followers.add(follower)
    follower.following.add(followee)
    followee.num_followers += 1
    follower.num_following += 1
    
    follower.save()
    followee.save()

    return HttpResponseRedirect(reverse('profile_page', kwargs={'user_id':followee_id}))

def unfollow(request, unfollowee_id):
    unfollower = request.user
    unfollowee = User.objects.filter(id=unfollowee_id)[0]

    unfollowee.followers.remove(unfollower)
    unfollower.following.remove(unfollowee)
    unfollowee.num_followers -= 1
    unfollower.num_following -= 1

    unfollower.save()
    unfollowee.save()

    return HttpResponseRedirect(reverse('profile_page', kwargs={'user_id':unfollowee_id}))


def get_user(request):
    username = request.user.username
    id = request.user.id
    liked_posts = [like.post for like in request.user.likes.all()]
    liked_post_ids = [post.id for post in liked_posts]
    js_liked_post_ids = json.dumps(liked_post_ids)
    return JsonResponse({
        "username": username,
        "id": id,
        "liked_post_ids": js_liked_post_ids
    })

def get_user_by_id(request, user_id):
    user = User.objects.filter(id=user_id)[0]
    liked_posts = [like.post for like in user.likes.all()]
    liked_post_ids = [post.id for post in liked_posts]
    js_liked_post_ids = json.dumps(liked_post_ids)
    return JsonResponse({
        "username": user.username,
        "id": user_id,
        "liked_post_ids": js_liked_post_ids
    })


def get_following_posts(request, user_id):
    user = User.objects.filter(id=user_id)[0]
    posts = Post.objects.all()
    posts = posts.order_by("-datetime_posted").all()
    filtered_posts = []
    for post in posts:
        if post.user in user.following.all():
            filtered_posts.append(post)
    # error: filtered_posts is empty, this shouldn't be the case
    return JsonResponse([post.serialize() for post in filtered_posts], safe=False)


@csrf_exempt  # find a way to remove this later (without this we get a 403 forbidden)
def update_post(request, post_id):
    if request.method != "POST":
        return HttpResponse("ERROR: update_post api should only be called with a POST request")
    
    # since the POST request sends JSON data, i need to deserialize it to work with it in python
    data = json.loads(request.body)

    post = Post.objects.filter(id=post_id)[0]
    post.body = data["new_body"]  # this line is causing the error
    post.save()

    # am i allowed to return something even though it is a post request? Answer: Yes
    return JsonResponse(post.serialize())



@csrf_exempt  # find a way to remove this later (without this we get a 403 forbidden)
def like_post(request, post_id):
    if request.method != "POST":
        return HttpResponse("ERROR: like_post api should only be called with a POST request")
    
    usr = request.user   # can I do this? or do I have tyo send the user form js
    post = Post.objects.filter(id=post_id)[0]

    # only add a like if the user hasn't already liked the post
    if len(Like.objects.filter(user=usr, post=post)) == 0:
        like = Like(user=usr, post=post)
        post.like_count += 1
        like.save()
        post.save()

    # am i allowed to return something even though it is a post request? Answer: Yes
    return JsonResponse(post.serialize())


@csrf_exempt  # find a way to remove this later (without this we get a 403 forbidden)
def unlike_post(request, post_id):
    if request.method != "POST":
        return HttpResponse("ERROR: like_post api should only be called with a POST request")
    
    usr = request.user   # can I do this? or do I have tyo send the user form js
    post = Post.objects.filter(id=post_id)[0]

    # only remove like if user has already liked post
    if len(Like.objects.filter(user=usr, post=post)) == 1:
        Like.objects.filter(user=usr, post=post).delete()
        post.like_count -= 1
        post.save()

    # am i allowed to return something even though it is a post request? Answer: Yes
    return JsonResponse(post.serialize())