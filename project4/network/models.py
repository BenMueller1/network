from django.contrib.auth.models import AbstractUser
from django.db import models
from datetime import datetime

from django.forms import IntegerField

class User(AbstractUser):
    followers = models.ManyToManyField("self", on_delete=models.DO_NOTHING, related_name="following")  # is this correct?
    num_followers = IntegerField()
    num_following = IntegerField()

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name = "posts")
    body = models.TextField()
    datetime_posted = models.DateTimeField(defult=datetime.now())
    like_count = models.IntegerField(default=0)
    
    def serialize(self):
        return {
            "user": self.user,
            "body": self.body,
            "datetime_posted": self.datetime_posted,
            "like_count": self.like_count
        }

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name = "likes")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")