document.addEventListener('DOMContentLoaded', async function() {

	if (localStorage.getItem("currentDraft") === "null") {
		document.getElementById("postImage").src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAM1BMVEXz8/O6urr39/e1tbXv7+/Z2dnf39+8vLzW1tbExMTNzc3Hx8fi4uLc3Nzq6urBwcHR0dE7I9AnAAAEcklEQVR4nO2d6ZKrIBBGFYz7kvd/2ompVGZuaKWbaLrJ/c6vqalAPBGQpcGiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvgsnRfuChbii7UrPpxymIitHd/GlEF+OGSm6Xiy4Ol6yUXRtiuBNMZu7WKUJ3sjE0F1TBf2Uh6JrUg3LIQ/DIrmQlk0ehunVMJeKCEMY2geGMLTPlxreRrDVg/kNw2cmfIqPDJ5ddW3+DGfTEQyanzTX6nTH1OHSUfj2ZMW0Ae+hiv2piglTFscrnjs/oC94UzzRz7XadndOrIqu05a7051oqO324ERDC9XwVhFhCEMYqgNDGMJQHxjCEIb6wBCGMHzn0g6YZjVr6H0ztNM4r4xTOzRvaBo09L6vqz8BbeufVd2nSpoz9F1NLTjc/lV3aRnaMvTDvLme4tw8pGRpydB38/7luFl+H00Z1vGLcXW+hn5gBZK6QlhUzRjyF8KES3ZWDCUBlm4U5WzD0EeamJecJevlNgxlgjJFE4byGGBBQbVgmBIf6yZ27gYMk9baXZ+PYWJ0LDfiWN/Qz4n5M1sbfcPrdk97f1sQMzBe33BLb770S9M0S3+ptiSzMNyId3HT8hzxer/QXXJevI62IXkL3dj8m9Y39BOT8wXahlR/mwoWI8O3WBE7yoa+IhIuVEK/EJ/kRKwqG1J7YZaNzxKKbrBu6MMmZOeiw5/D1Yzv0DUME+20j1S7a91wCb59t2aFtdZtFWkrhkF/JtKfDhpURr9G1dDXQaL9NGGpjldEXcPXTneslxLWxHj3W9cwSBILSQ2DRW0bhiPDWJLwN4mOElUNg6Y0WubCch1tTFUNgzIXnV/y4+uXREOtVQ2DTkq0ZQxa33i/DYanGn5/Kf3+liZ4WsQ3MMhTGHvix2pVOICy/cQPy1xkrj6c/7feawsHwMKeN2MIbG30tD8akn5e3zAcAe9PEIbfYX0ETAzad4odUagZk23KhuHK4fbOWmLKlLOKqDybSGwOdBvRJJ6YeeRscTQ4I0wrUoI5zAiTa2tUwAwZbsNaX9M2JDciB+FrWwFvWaw90aFQaxji7+raQPvxtlKrG5JrM2vqYmz7ruv6dtyKd+OdJKJuuBOJETn7khmNoW+YemQgN2hI33BrJT8KM3cLhkkH6nGWDs0Yppyxwg8ytWBIdaljeTOWRi0ZilsbSQytDUPhXRTcQTOGopNyZCf7WDEUnHckPJvJjGFZLqyTuVwVn7iwarg+NWJX4+Snh1ky3Axf+83yNeAtN8M1tmvc2dk1kvFgeRmu97Gl4kmdq1r5/TNpuF7T0s7Fc9x0/2NuU26fWcPyHjXbt1M9jmM9tf3yzl5go4YPzQM2Ops2PAYYwhCG+sAQhjDUB4YwhKE+MITh/22o7fbgRMPvP7HcwIsDZAsicrTt7pzoJ1sEOwn54qtMUfkVJWkL6DLFutR09JzTw95VLC6iV8ceSdldPvIaWvHrf4/kA34AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMCJ/ACOOkzj4tSV3wAAAABJRU5ErkJggg==";
	} else {
		var post = await postInfo(localStorage.getItem("currentDraft"));
		fillTemplate(post);
	}

	document.getElementById("addStep").addEventListener('click', function() {
		addStep(document.getElementById("stepText").value);
	});

	document.getElementById("addMaterial").addEventListener('click', function() {
		addMaterial(document.getElementById("materialText").value);
	});

	document.getElementById('postImage').addEventListener('click', function() {
		document.getElementById('imgSelector').click();
	});

	document.getElementById('imgSelector').addEventListener('input', async function() {
		await imageRead(document.getElementById("postImage"), document.getElementById("imgSelector"));
	});

	document.getElementById('yespublish').addEventListener('click', async function() {
		var username = document.getElementById('dropdownUsername').innerHTML;
		username = username.substr(0, username.indexOf('<span') - 1);
		await addPost(false, (localStorage.getItem("currentDraft") != "null"));
		localStorage.setItem("currentDraft", "null");
		localStorage.setItem("currentProfile", username);
		location.href = "../html/profile.html";

	});

	document.getElementById('submitDraft').addEventListener('click', async function() {
		var username = document.getElementById('dropdownUsername').innerHTML;
		username = username.substr(0, username.indexOf('<span') - 1);
		await addPost(true, (localStorage.getItem("currentDraft") != "null"));
		localStorage.setItem("currentDraft", "null");
		localStorage.setItem("currentProfile", username);
		location.href = "../html/profile.html";
	});

	document.getElementById('yesdelete').addEventListener('click', async function() {
		var username = document.getElementById('dropdownUsername').innerHTML;
		username = username.substr(0, username.indexOf('<span') - 1);
		await deletePost(localStorage.getItem("token"), localStorage.getItem("currentDraft"));
		localStorage.setItem("currentProfile", username);
		location.href = "../html/profile.html";
	});

	document.getElementById('cancelDraft').addEventListener('click', function() {
		var username = document.getElementById('dropdownUsername').innerHTML;
		username = username.substr(0, username.indexOf('<span') - 1);
		localStorage.setItem("currentDraft", "null");
		localStorage.setItem("currentProfile", username);
		location.href = "../html/profile.html";
	});
});


function fillTemplate(post) {
	document.getElementById("postTitle").value = post.title;
	document.getElementById("postDescription").value = post.description;
	document.getElementById("postImage").src = post.image;
	for (var i = 0; i < post.recipe.length; i++) {
		addMaterial(post.recipe[i]);
	}
	if (post.steps != null) {
		for (var i = 1; i < Object.keys(post.steps).length + 1; i++) {
			addStep(post.steps[i.toString()]);
		}
	}
}

async function postInfo(pid) {
	var testURL = createURL("postInfo", { 
		"pid": pid
	});
	var res = await fetch(testURL);
	var post = await res.text();
	post = JSON.parse(post);
	
	return post;
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
	    canvas.imageSmoothingEnabled = false;
	    canvas.height = canvas.width * (img.height / img.width);
	    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

	    var data = canvas.toDataURL('image/png');

	    imgObject.src = data;
	  }

	  img.src = e.target.result;
	}
	await fr.readAsDataURL(file);
}

async function addPost(draft, edit) {
	var recipeData = [];
	var recipe = document.getElementById('addMaterialsList').childNodes;
	 for (var i = 1; i < recipe.length; i++) {
        var item = recipe[i].innerHTML;
        if (item.indexOf('<button') > -1) {
        	item = item.substr(0, item.indexOf('<button')); 
    	}
        recipeData.push(item);
    }       

    var stepData = {};
	var steps = document.getElementById('addStepsList').childNodes;

	 for (var i = 1; i < steps.length; i++) {
        var item = steps[i].innerHTML;
        if (item.indexOf('<button') > -1) {
        	item = item.substr(0, item.indexOf('<button')); 
        }
        var key = i.toString();
        stepData[key] = item;
    }       

   	var data;
   	var url;
    if (edit) {
		data = { 
			"token": localStorage.getItem("token"),
			"pid": localStorage.getItem("currentDraft"),
			"title": document.getElementById("postTitle").value,
			"description": document.getElementById("postDescription").value,
			"image": String(document.getElementById("postImage").src),
			"recipe": recipeData,
			"steps": stepData,
			"visibility": (draft) ? "off" : "on"
		};
		url = "http://localhost:3000/editPost";
	} else {
		url = "http://localhost:3000/addPost";
		data = { 
			"token": localStorage.getItem("token"),
			"title": document.getElementById("postTitle").value,
			"description": document.getElementById("postDescription").value,
			"image": String(document.getElementById("postImage").src),
			"recipe": recipeData,
			"steps": stepData,
			"visibility": (draft) ? "off" : "on"
		};
	}

	await fetch(url, {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		method: "POST", 
		body: JSON.stringify(data)
	})

}

function addMaterial(materialText) {
	var li = document.createElement("li");
	var text = materialText;
	li.innerHTML = text;
	li.className = "list-group-item";
	li.style = "font-size: 16px";
	var edit = document.createElement("button");
	edit.style = "height: 40px; width: 50px; position: absolute; top: 0; right: 50px; display: inline-block; border: 0px; padding-left: 20px; padding-right: 20px";
	var del = document.createElement("button");
	del.style = "height: 40px; width: 50px; position: absolute; top: 0; right: 0; display: inline-block; border: 0px; padding-left: 20px; padding-right: 20px";
	edit.addEventListener('click', function(event) {
		if (event.currentTarget.childNodes[0].className === "glyphicon glyphicon-pencil") {
			var editInput = document.createElement("input");
			editInput.style = "height: 40px; position: absolute; top: 0; left: 0; display: inline-block; border: 0px; padding-left: 15px; width: 100%";
			editInput.id = "matEditInput";
			editInput.value = text;
			var parent = event.currentTarget.parentNode;
			parent.style = "height: 42px";
			parent.innerHTML = "";
			event.currentTarget.childNodes[0].className = "glyphicon glyphicon-ok";
			parent.appendChild(editInput);
			parent.appendChild(event.currentTarget);
			parent.appendChild(del);
		} else {
			var parent = event.currentTarget.parentNode;
			text = document.getElementById("matEditInput").value;
			parent.innerHTML = document.getElementById("matEditInput").value;
			event.currentTarget.childNodes[0].className = "glyphicon glyphicon-pencil";
			parent.appendChild(event.currentTarget);
			parent.appendChild(del);
		}
	})
	del.addEventListener('click', function(event) {
		event.currentTarget.parentNode.remove();
	})
	var editIcon = document.createElement("i");
	editIcon.className = "glyphicon glyphicon-pencil";
	edit.appendChild(editIcon);
	var delIcon = document.createElement("i");
	delIcon.className = "glyphicon glyphicon-trash";
	del.appendChild(delIcon);
	li.appendChild(edit);
	li.appendChild(del);
	document.getElementById("addMaterialsList").appendChild(li);
	document.getElementById("materialText").value = "";
}

function addStep(stepText) {
	var li = document.createElement("li");
		var text = stepText;
		li.innerHTML = text;
		li.style = "font-size: 16px";
		li.className = "list-group-item";
		var edit = document.createElement("button");
		edit.style = "height: 40px; width: 50px; position: absolute; top: 0; right: 50px; display: inline-block; border: 0px; padding-left: 20px; padding-right: 20px";
		var del = document.createElement("button");
		del.style = "height: 40px; width: 50px; position: absolute; top: 0; right: 0; display: inline-block; border: 0px; padding-left: 20px; padding-right: 20px";
		edit.addEventListener('click', function(event) {
			if (event.currentTarget.childNodes[0].className === "glyphicon glyphicon-pencil") {
				var editInput = document.createElement("input");
				editInput.style = "height: 40px; position: absolute; top: 0; left: 0; display: inline-block; border: 0px; padding-left: 15px; width: 100%";
				editInput.id = "stepEditInput";
				editInput.value = text;
				var parent = event.currentTarget.parentNode;
				parent.style = "height: 42px";
				parent.innerHTML = "";
				event.currentTarget.childNodes[0].className = "glyphicon glyphicon-ok";
				parent.appendChild(editInput);
				parent.appendChild(event.currentTarget);
				parent.appendChild(del);
			} else {
				var parent = event.currentTarget.parentNode;
				text = document.getElementById("stepEditInput").value;
				parent.innerHTML = document.getElementById("stepEditInput").value;
				event.currentTarget.childNodes[0].className = "glyphicon glyphicon-pencil";
				parent.appendChild(event.currentTarget);
				parent.appendChild(del);
			}
		})
		del.addEventListener('click', function(event) {
			event.currentTarget.parentNode.remove();
		})
		var editIcon = document.createElement("i");
		editIcon.className = "glyphicon glyphicon-pencil";
		edit.appendChild(editIcon);
		var delIcon = document.createElement("i");
		delIcon.className = "glyphicon glyphicon-trash";
		del.appendChild(delIcon);
		li.appendChild(edit);
		li.appendChild(del);
		document.getElementById("addStepsList").appendChild(li);
		document.getElementById("stepText").value = "";
}

async function deletePost(token, pid) {
	testURL = createURL("deletePost", { 
		"token": token,
		"pid": pid
	});

	await fetch(testURL);
}