document.addEventListener('DOMContentLoaded', () => {
    var posts_div = document.querySelector('#profile_posts')
    let link = window.location.href
    let user_id = link.charAt(link.length - 1)
    load_profile_posts(posts_div, user_id)
})

// at some point fix the link problem that make us unable to go from one profile to another profile

async function load_profile_posts(posts_div, user_id) {
    profile_page_user = await fetch(`/getUserById/${user_id}`).then(response => response.json())
    viewing_user = await fetch('/getUser').then(response => response.json()) 
    fetch(`../../getUsersPosts/${user_id}`)
    .then(response => response.json())
    .then(posts => {
        posts.forEach((post) => {
            let d = document.createElement('div');
            d.id = `post-${post['id']}`
            d.innerHTML = `<p> ${post['user']}
                                : ${post['body']}, posted at ${post['datetime_posted']}. ${post['like_count']} likes.  
                            </p>`;
            if (user_id == viewing_user['id']) { // we should show edit button
                d.innerHTML += `<button id="edit__post_${post['id']}_button"> Edit</button>`
                d.querySelector(`#edit__post_${post['id']}_button`).addEventListener("click", () => edit_post(d, post)) 
            }
            else {  // we shuold show like or unlike button
                if (viewing_user['liked_post_ids'].includes(post['id'])) { // if post already liked, display an unlike button
                    d.innerHTML += `<button id="like__post_${post['id']}_button">Unlike</button>`
                    d.querySelector(`#like__post_${post['id']}_button`).addEventListener("click", () => like_post(d, post, "unlike"))
                }
                else {
                    d.innerHTML += `<button id="like__post_${post['id']}_button">Like</button>`
                    d.querySelector(`#like__post_${post['id']}_button`).addEventListener("click", () => like_post(d, post, "like"))
                } 
            }
            posts_div.append(d)           
        })
    })
    // removes the autoscroll that is part of layout.js
    window.onscroll = do_nothing
}







// ------------------- copied from layout.js (except the fetch links are modified)


function edit_post(d, post) {
    d.innerHTML = `<form >
                        <input type="text" value="${post['body']}" name="edit-${post['id']}" id="new_body_text_for_${post['id']}">
                        <input id="submit_edit_${post['id']}" type="button" value="submit">
                    </form>`
    d.querySelector(`#submit_edit_${post['id']}`).addEventListener("click", () => {
        var new_body = d.querySelector(`#new_body_text_for_${post['id']}`).value
        fetch(`../../update/${post['id']}`, {
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


async function like_post(d, post, like_or_unlike) {
    // do i need to send the user? or can I just use request.user in my django code
    var usr = await fetch('/getUser').then(response => response.json())
    // does it need to be a POST request if it doesn't send any data?
    fetch(`../../${like_or_unlike}/${post['id']}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        d.innerHTML = `<p> <a href="profile/${post["user_id"]}">${post['user']}</a>
                        : ${post['body']}, posted at ${post['datetime_posted']}. ${result['like_count']} likes.
                        </p>`;

        if (like_or_unlike === "like") { // if post already liked, display an unlike button
            // ERROR: this is only being reached on the second click
            d.innerHTML += `<button id="like__post_${post['id']}_button">Unlike</button>`
            d.querySelector(`#like__post_${post['id']}_button`).addEventListener("click", () => like_post(d, post, "unlike"))
        }
        else if (like_or_unlike === "unlike") {
            d.innerHTML += `<button id="like__post_${post['id']}_button">Like</button>`
            d.querySelector(`#like__post_${post['id']}_button`).addEventListener("click", () => like_post(d, post, "like"))
        } 
    })    
}





function do_nothing() {
    // this is just for fun
    // I am aware that there are better ways to do this
}