document.addEventListener('DOMContentLoaded', async function() {
	document.getElementById("editPost").style.display = "none";
	document.getElementById("deletePost").style.display = "none";
	document.getElementById("addCommentForm").style.display = "none";
	
	$('.nav-link').click(function(){    
		divId = $(this).attr('href');
		console.log($(divId).offset().top - 90);
		$('html, body').animate({
			scrollTop: $(divId).offset().top - 90
		}, 100);
	});

	document.getElementById('submitComment').addEventListener('click', async function() {
		var dt = new Date();
		var timeStr = ((dt.getHours() < 10) ? "0" : "") + dt.getHours() + ":" + ((dt.getMinutes() < 10) ? "0" : "") + dt.getMinutes();
		var dateStr = (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear();
		await addComment(localStorage.getItem("token"), localStorage.getItem("currentPost"), document.getElementById("commentText").value, dateStr, timeStr);
		location.href = "../html/post.html";
	})

	document.getElementById("projAuthor").addEventListener('click', function() {
		localStorage.setItem("currentProfile", document.getElementById("projAuthor").innerHTML);
		location.href = "../html/profile.html";
	})



	document.getElementById("yesdelete").addEventListener('click', async function() {
		await deletePost(localStorage.getItem("token"), localStorage.getItem("currentPost"));
		localStorage.setItem("currentProfile", document.getElementById("projAuthor").innerHTML);
		location.href = "../html/profile.html";
	})

	document.getElementById("editPost").addEventListener('click', function() {
		localStorage.setItem("currentDraft", localStorage.getItem("currentPost"));
		location.href = "../html/createpost.html";
	})

	setTimeout(async function() { 
		await reloadPost(); 
	}, 800);

});

async function reloadPost() {

	var post = await findPost(localStorage.getItem("currentPost"));
	console.log(post);
	var username = await authUser(localStorage.getItem("token"));
	if (post.author === username) {
		document.getElementById("editPost").style.display = "block";
		document.getElementById("deletePost").style.display = "block";
	}

	if ((username != null) && (username !== "null") && (username !== "")) {
		document.getElementById("addCommentForm").style.display = "block";
	}

	document.getElementById("projTitle").innerHTML = post.title;
	document.getElementById("projAuthor").innerHTML = post.author;
	document.getElementById("projDescription").innerHTML = post.description;
	document.getElementById("projImage").src = post.image;
	document.getElementById("popupImage").src = post.image;

	var materials = document.getElementById("materialsList");
	if (post.recipe != null) {
		for (var i = 0; i < post.recipe.length; i++) {
			var li = document.createElement("li");
			li.className = "list-group-item";
			li.style = "font-size: 16px";
			li.innerHTML = post.recipe[i];
			materials.appendChild(li);
		}
	}

	var directions = document.getElementById("directionsList");
	if (post.steps != null) {
		for (var i = 1; i < Object.keys(post.steps).length + 1; i++) {
			var li = document.createElement("li");
			li.className = "list-group-item";
			li.style = "display: list-item; font-size: 16px";
			var idx = i.toString();
			li.innerHTML = post.steps[idx];
			directions.appendChild(li);
		}
	}

	if(post.comments !== null) {
		var comments = document.getElementById("commentsList");
		for (var i = 0; i < post.comments.length; i++) {
			var li = document.createElement("li");
			li.className = "list-group-item";
			var row = document.createElement("div"); 
			row.className = "row";
			var col1 = document.createElement("div"); 
			col1.className = "col-sm-6";
			var col2 = document.createElement("div"); 
			col2.className = "col-sm-6";
			col2.style = "text-align: right";
			var p = document.createElement("p");
			p.style = "font-size: 16px; font-family: Poppins";
			var time = document.createElement("p");
			time.style = "font-size: 16px; font-family: Poppins";
			time.innerHTML = post.comments[i].time;
			var date = document.createElement("p");
			date.style = "font-size: 16px; font-family: Poppins";
			date.innerHTML = post.comments[i].date;
			var author = document.createElement("h4");
			author.style = "font-family: Poppins; cursor: pointer";
			author.innerHTML = post.comments[i].author;
			author.addEventListener('click', function() {
				localStorage.setItem("currentProfile", event.currentTarget.innerHTML);
				location.href = "../html/profile.html";
			})
			p.innerHTML = post.comments[i].comment;
			col1.appendChild(author);
			col1.appendChild(p);
			col2.appendChild(date);
			col2.appendChild(time);
			row.appendChild(col1);
			row.appendChild(col2);
			li.appendChild(row);
			comments.appendChild(li);
		}
	}
}


async function deletePost(token, pid) {
	testURL = createURL("deletePost", { 
		"token": token,
		"pid": pid
	});

	await fetch(testURL);
}

async function findPost(pid) {
	testURL = createURL("postInfo", { 
		"pid": pid
	});

	var post = await fetch(testURL);
	post = await post.text();
	console.log(post);
	return JSON.parse(post);
}

async function addComment(token, pid, comment, date, time) {
	let data = {
		"token": token,
		"pid": pid,
		"comment": comment,
		"date": date,
		"time": time
	};
	console.log(JSON.stringify(data));
	await fetch("http://localhost:3000/addComment", {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		method: "POST", 
		body: JSON.stringify(data)
	})
}
