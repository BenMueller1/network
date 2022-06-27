from django.contrib.auth.models import AbstractUser
from django.db import models
from datetime import datetime

# from django.forms import IntegerField

class User(AbstractUser):
    followers = models.ManyToManyField("self", related_name="following")
    following = models.ManyToManyField("self", related_name="followers")
    num_followers = models.IntegerField(default=0)
    num_following = models.IntegerField(default=0)

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name = "posts")
    body = models.TextField()
    datetime_posted = models.DateTimeField(default=datetime.now())
    like_count = models.IntegerField(default=0)
    
    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "user_id": self.user.id,
            "body": self.body,
            "datetime_posted": self.datetime_posted.strftime("%b %d %Y, %I:%M %p"),
            "like_count": self.like_count
        }

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name = "likes")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")