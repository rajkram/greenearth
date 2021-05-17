document.addEventListener('DOMContentLoaded', async function() {
	var posts = await fillGlobalPosts();
	document.getElementById("loading").style.display = "none";


	if (localStorage.getItem("currentSearch") === "null") {
		reloadPage(posts);
	} else {
		document.getElementById("searchText").value = localStorage.getItem("currentSearch");
		var filteredPosts = filter(posts, localStorage.getItem("currentSearch"));
		reloadPage(filteredPosts);
		localStorage.setItem("currentSearch", "null");
	}

	document.getElementById("search").addEventListener('click', function() {
		var filteredPosts = filter(posts, document.getElementById("searchText").value);
		reloadPage(filteredPosts);
	});

});

async function fillGlobalPosts() {
	var testURL = createURL("allGlobalPosts", {});
	var result = await fetch(testURL);
	var text = await result.text();
	text = JSON.parse(text);
	return text;
}


function filter(text, keyword) {
	var filteredPosts = {"posts": []};
	for (var i = 0; i < text.posts.length; i++) {
		var relevant = false;
		if (text.posts[i].title.toUpperCase().indexOf(keyword.toUpperCase()) > -1) {
			relevant = true;
		}
		for (var j = 0; j < text.posts[i].recipe.length; j++) {
			if (text.posts[i].recipe[j].toUpperCase().indexOf(keyword.toUpperCase()) > -1) {
				relevant = true;
			}
		}
		if (relevant) {
			filteredPosts["posts"].push(text.posts[i]);
		}
	}
	return filteredPosts;
}


function reloadPage(text) {
	var cells = text.posts.length;
	console.log(text);
	console.log(cells);
	var grid = document.getElementById("postGrid");
	grid.innerHTML = "";
	if (cells > 0) {
		for (var i = 0; i < (cells / 3); i++) {
			var gridRow = document.createElement("div");
			gridRow.className = "row";
			gridRow.style.padding = "20px 20px 20px 20px";

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
		noresults.innerHTML = "No Results";
		noresults.id = "noresults";
		noresults.style = "text-align: center; color: grey";
		grid.appendChild(noresults);
	}
}