var posts_div = document.querySelector('#posts')
let post_index = 0;

document.addEventListener('DOMContentLoaded', function() {
    console.log('page load')
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
                                : ${post['body']}, posted at ${post['datetime_posted']}. ${post['like_count']} likes.  
                            </p>`;
            if (usr["id"] === post["user_id"]) { // add edit button if current user created this post
                d.innerHTML += `<button id="edit__post_${post['id']}_button"> Edit</button>`
                console.log('tst')
                // now add event listener to the edit button
                d.querySelector(`#edit__post_${post['id']}`).addEventListener("click", () => {
                    console.log('is this called?')
                    // form should be autofilled w current body (how to do csrf?), change url to PUT req url from my api
                    d.innerHTML = `<form action="">
                                        <input type="text" placeholder="${post['body']}" name="edit-${post['id']}">
                                        <input type="submit value="change">
                                    </form>`
                }) 
            }
                              
            posts_div.append(d)
        })
    })
}


async function load_ten_posts(first_post_index) {
    var usr = await fetch('/getUser').then(response => response.json())
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
                                    : ${post['body']}, posted at ${post['datetime_posted']}. ${post['like_count']} likes.
                                </p>`;
                if (usr["id"] === post["user_id"]) { // add edit button if current user created this post
                    d.innerHTML += `<button id="edit__post_${post['id']}_button"> Edit</button>`
                    posts_div.append(d)
                    // now add event listener to the edit button
                    d.querySelector(`#edit__post_${post['id']}_button`).addEventListener("click", () => edit_post(d, post)) 
                }
                else {
                    posts_div.append(d)
                }
            })
        } else {
            let p = document.createElement('p');
            p.innerHTML = "that's all the posts :)"
            posts_div.append(p)
        }
    })
    post_index += 10; 
}




function edit_post(d, post) {
    d.innerHTML = `<form >
                        <input type="text" value="${post['body']}" name="edit-${post['id']}" id="new_body_text_for_${post['id']}">
                        <input id="submit_edit_${post['id']}" type="button" value="submit">
                    </form>`
    d.querySelector(`#submit_edit_${post['id']}`).addEventListener("click", () => {
        var new_body = d.querySelector(`#new_body_text_for_${post['id']}`).value
        fetch(`update/${post['id']}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                new_body: new_body
            })
        })
        .then(response => response.json())
        .then(result => {
            d.innerHTML = `<p> <a href="profile/${post["user_id"]}">${post['user']}</a>
                            : ${result['body']}, posted at ${post['datetime_posted']}. ${post['like_count']} likes.
                            </p>`;
            d.innerHTML += `<button id="edit__post_${post['id']}_button">Edit</button>`
            d.querySelector(`#edit__post_${post['id']}_button`).addEventListener("click", () => edit_post(d, post))
        })
    })
}