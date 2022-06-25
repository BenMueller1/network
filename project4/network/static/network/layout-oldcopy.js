var posts_div = document.querySelector('#posts')

document.addEventListener('DOMContentLoaded', function() {
    followingBtn = document.querySelector('#following_button')
    if (followingBtn !== null) {  // have to do this bc it will be null if the user isn't logged in
        followingBtn.addEventListener("click", () => {
            posts_div = document.querySelector('#posts')
            posts_div.innerHTML = ""
            load_following_posts()
        })
    }
});

async function load_following_posts() {
    // fetch the current user (STUDY!!!!! notice how I used async and await)
    var usr = await fetch('/getUser').then(response => response.json())
    
    fetch(`/getAllPostsFollowedBy/${usr["id"]}`)
    .then(response => response.json())
    .then(posts => {
        console.log(posts)
        posts.forEach((post) => {
            let d = document.createElement('div');
            d.id = `post-${post['id']}`
            d.innerHTML = `<p> <a href="profile/${post["user_id"]}">${post['user']}</a>
                                : ${post['body']}, posted at ${post['datetime_posted']}. ${post['like_count']} likes. </p>`;                   
            posts_div.append(d)
        })
    })
}