document.addEventListener('DOMContentLoaded', async function() {
	console.log(localStorage.getItem("currentProfile"));
	var name = await authUser(localStorage.getItem("token"));
	var auth = (localStorage.getItem("currentProfile") === name);

	if (auth) {
		document.getElementById("profImage").style.cursor = "pointer";
		document.getElementById("draftGrid").style.display = "block";
		document.getElementById("createPost").style.display = "block";
		document.getElementById("editDescription").style.display = "block";
		document.getElementById('profImage').addEventListener('click', function() {
			document.getElementById('imgSelector').click();
		});
	} else {
		document.getElementById("editDescription").style.display = "none";
		document.getElementById("createPost").style.display = "none";
		document.getElementById("draftGrid").style.display = "none";
	}

	var user = await userInfoName(localStorage.getItem("currentProfile"));
	document.getElementById('profImage').src = user[3];
	document.getElementById('description').innerHTML = (user[2] === "") ? "Description" : user[2];
	document.getElementById('profName').innerHTML = '<strong>' + user[0] + '</strong>';
	document.getElementById("editDescription").addEventListener('click', toggleInput);
	
	await fillPosts(localStorage.getItem("currentProfile"));
	if (auth) {
		await fillDrafts(localStorage.getItem("currentProfile"));
	}

	document.getElementById("loading").style.display = "none";

	document.getElementById('imgSelector').addEventListener('input', async function() {
		var str1 = document.getElementById("profImage").src;
		await imageRead(document.getElementById("profImage"), document.getElementById("imgSelector"), updateImage);
		var str2 = document.getElementById("profImage").src;
		console.log(str2 === str1);
	});
	
	document.getElementById("createPost").addEventListener('click', function() {
		console.log("Hello");
		localStorage.setItem("currentDraft", "null");
		location.href = "../html/createpost.html";
	})
});

async function updateImage() {
	await setField(localStorage.getItem("token"), "image", document.getElementById("profImage").src);
}

async function setField(token, field, value) {
	let data = { 
		"token": token,
		"field": field,
		"value": value
	}

	console.log(JSON.stringify(data));
	await fetch("http://localhost:3000/setField", {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		method: "POST", 
		body: JSON.stringify(data)
	})
}

async function fillPosts(name) {
	console.log(name);
	var testURL = createURL("allPosts", { 
		"name": name
	});
	
	var result = await fetch(testURL);
	var text = await result.text();
	text = JSON.parse(text);
	var cells = text.posts.length;
	var grid = document.getElementById("postGrid");
	if (cells > 0) {
		for (var i = 0; i < (cells / 3); i++) {
			var gridRow = document.createElement("div");
			gridRow.className = "row";
			gridRow.style.padding = "20px 40px 20px 40px";

			var cellsInRow = ((cells - i * 3) < 3) ? cells - i * 3 : 3;
			for (var j = 0; j < cellsInRow; j++) {
				var gridOuterCell = document.createElement("div");
				gridOuterCell.className = "col-sm-4";
				var gridInnerCell = document.createElement("div");
				gridInnerCell.className = "cell";
				gridOuterCell.appendChild(gridInnerCell);
				var textCell = document.createElement("div");
				textCell.className = "textcell";
				var title = document.createElement("h3");
				title.innerHTML = text.posts[i * 3 + j].title;
				var p = document.createElement("p");
				p.innerHTML = text.posts[i * 3 + j].description;
				textCell.appendChild(title);
				textCell.appendChild(p);
				var img = new Image();
				img.src = text.posts[i * 3 + j].image;
				img.className = "cellimage img-responsive";
				gridInnerCell.appendChild(img);
				gridInnerCell.appendChild(textCell);
				gridOuterCell.id = text.posts[i * 3 + j].pid;
				gridOuterCell.addEventListener('click', function(event){	
					localStorage.setItem("currentPost", event.currentTarget.id);
					location.href = "../html/post.html";		
				})
				gridRow.appendChild(gridOuterCell);
			}
			grid.appendChild(gridRow);
		}
	} else {
		var noresults = document.createElement("h2");
		noresults.innerHTML = "No Posts";
		noresults.id = "noresults";
		noresults.style = "text-align: center; color: grey";
		grid.appendChild(noresults);
	}
}

async function fillDrafts(name) {
	var testURL = createURL("allDrafts", { 
		"name": name
	});
	
	var result = await fetch(testURL);
	var text = await result.text();
	text = JSON.parse(text);

	var cells = text.posts.length;
	var grid = document.getElementById("draftGrid");
	if (cells > 0) {
		for (var i = 0; i < (cells / 3); i++) {
			var gridRow = document.createElement("div");
			gridRow.className = "row";
			gridRow.style.padding = "20px 40px 20px 40px";

			var cellsInRow = ((cells - i * 3) < 3) ? cells - i * 3 : 3;

			for (var j = 0; j < cellsInRow; j++) {
				var gridOuterCell = document.createElement("div");
				gridOuterCell.className = "col-sm-4";
				var gridInnerCell = document.createElement("div");
				gridInnerCell.className = "cell";
				gridOuterCell.appendChild(gridInnerCell);
				var textCell = document.createElement("div");
				textCell.className = "textcell";
				var title = document.createElement("h3");
				title.innerHTML = text.posts[i * 3 + j].title;
				var p = document.createElement("p");
				p.innerHTML = text.posts[i * 3 + j].description;
				textCell.appendChild(title);
				textCell.appendChild(p);
				var img = new Image();
				img.src = text.posts[i * 3 + j].image;
				img.className = "cellimage img-responsive";
				gridInnerCell.appendChild(img);
				gridInnerCell.appendChild(textCell);
				gridOuterCell.id = text.posts[i * 3 + j].pid;
				gridOuterCell.addEventListener('click', function(event){	
					localStorage.setItem("currentDraft", event.currentTarget.id);
					location.href = "../html/createpost.html";		
				})
				gridRow.appendChild(gridOuterCell);
			}
			grid.appendChild(gridRow);
		}
	} else {
		var noresults = document.createElement("h2");
		noresults.innerHTML = "No Drafts";
		noresults.id = "noresults";
		noresults.style = "text-align: center; color: grey";
		grid.appendChild(noresults);
	}
}



async function toggleInput() {
	var parent = document.getElementById("descriptionParent");
	var p = document.getElementById("description");
	if (p != null) {
		var prev = p.innerHTML;
		var input = document.createElement("textarea");
		input.type = "text";
		input.className = "form-control";
		if (prev === "") {
			input.placeholder = "Description";
		} else {
			input.value = prev;
		}
		input.id = "inputDescription";
		input.style = "margin-top: 20px; height: 200px";
		parent.replaceChild(input, p);
	} else {
		var newp = document.createElement("p");
		var input = document.getElementById("inputDescription");
		newp.id = "description";
		newp.style = "font-size: 16px; margin-top: 20px";
		await setField(localStorage.getItem("token"), "description", input.value);
		if (input.value === "") {
			newp.innerHTML = "Description"
		} else {
			newp.innerHTML = input.value;
		}
		parent.replaceChild(newp, input);

	}
}

async function imageRead(imgObject, selectorObject, callbackFunc) {
	var file = selectorObject.files[0];
	var fr = new FileReader();

	fr.onload = function(e) {
	  var img = new Image();

	  img.onload = function() {
	    var canvas = document.createElement('canvas');
	    var ctx = canvas.getContext('2d');
	    canvas.width = 100;
	    canvas.height = canvas.width * (img.height / img.width);
	    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

	    var data = canvas.toDataURL('image/png');

	    imgObject.src = data;
	    console.log(data);
	    callbackFunc();
	  }

	  img.src = e.target.result;
	}
	await fr.readAsDataURL(file);
}

