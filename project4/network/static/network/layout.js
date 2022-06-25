var posts_div = document.querySelector('#posts')
let post_index = 0;

document.addEventListener('DOMContentLoaded', function() {
    allPostsBtn = document.querySelector('#all_posts_button');
    posts_div = document.querySelector('#posts')
     // this will only work properly when I transfer this code to the layout.js
    allPostsBtn.disabled = false;
    allPostsBtn.addEventListener("click", () => {
        posts_div.innerHTML = ""
        load_ten_posts(post_index);
        allPostsBtn.disabled = true;
    })

    followingBtn = document.querySelector('#following_button')
    if (followingBtn !== null) {  // have to do this bc it will be null if the user isn't logged in
        followingBtn.addEventListener("click", () => {
            allPostsBtn.disabled = false;
            posts_div = document.querySelector('#posts')
            posts_div.innerHTML = ""
            post_index = 0
            load_following_posts()
        })
    }

    // --------- this stuff only runs if we are on a profile page
    let u = window.location.href   // gets current link
    if (u.includes('profile')) {
        allPostsBtn = document.querySelector('#all_posts_button');
        followingBtn = document.querySelector('#following_button');
        if (allPostsBtn !== null && followingBtn !== null) {
            profile_posts_div = document.querySelector('#profile_posts')
            allPostsBtn.addEventListener("click", () => {
                profile_posts_div.style.display = 'none';
                document.querySelector('#info').style.display = 'none'
            })
            followingBtn.addEventListener("click", () => {
                document.querySelector('#profile_posts').style.display = 'none';
                document.querySelector('#info').style.display = 'none'
            })
        }
    }
    

});

async function load_following_posts() {
    // fetch the current user (STUDY!!!!! notice how I used async and await)
    var usr = await fetch('/getUser').then(response => response.json())
    
    fetch(`/getAllPostsFollowedBy/${usr["id"]}`)
    .then(response => response.json())
    .then(posts => {
        posts.forEach((post) => {
            let d = document.createElement('div');
            d.id = `post-${post['id']}`
            d.innerHTML = `<p> <a href="profile/${post["user_id"]}">${post['user']}</a>
                                : ${post['body']}, posted at ${post['datetime_posted']}. ${post['like_count']} likes. </p>`;                   
            posts_div.append(d)
        })
    })
}


function load_ten_posts(first_post_index) {
    last_post_index = first_post_index+9; //inclusive
    posts_div = document.querySelector('#posts')
    fetch('/getAllPosts')
    .then(response => response.json())
    .then(posts => {
        numPosts = Object.keys(posts).length;
        if (numPosts > first_post_index) {
            posts.forEach((post) => {
                let d = document.createElement('div');
                d.id = `post-${post['id']}`
                d.innerHTML = `<p> <a href="profile/${post["user_id"]}">${post['user']}</a>
                                    : ${post['body']}, posted at ${post['datetime_posted']}. ${post['like_count']} likes. </p>`;                   
                posts_div.append(d)
            })
        } else {
            let p = document.createElement('p');
            p.innerHTML = "that's all the posts :)"
            posts_div.append(p)
        }
    })
    post_index += 10; 
}