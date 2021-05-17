document.addEventListener('DOMContentLoaded', async function() {
	document.getElementById("homeSearchButton").addEventListener('click', function() {
		localStorage.setItem("currentSearch", document.getElementById("homeSearchText").value);
		location.href = "../html/allposts.html";
	})

	document.getElementById("moreposts").addEventListener('click', function() {
		location.href = "../html/allposts.html";
	})

	var posts = await fillGlobalPosts();
	document.getElementById("loading").style.display = "none";
	fillHomepage(posts);
});

async function fillGlobalPosts() {
	var testURL = createURL("allGlobalPosts", {});
	var result = await fetch(testURL);
	var text = await result.text();
	text = JSON.parse(text);
	return text;
}

function fillHomepage(text) {
	var cells = text.posts.length;
	var grid = document.getElementById("postGrid");
	if (cells > 0) {
		var gridRow = document.createElement("div");
		gridRow.className = "row";
		gridRow.style.padding = "20px 20px 20px 20px";

		for (var j = 0; j < 1; j++) {
			var gridOuterCell = document.createElement("div");
			gridOuterCell.className = "col-sm-4";
			var gridInnerCell = document.createElement("div");
			gridInnerCell.className = "cell";
			gridOuterCell.appendChild(gridInnerCell);
			var textCell = document.createElement("div");
			textCell.className = "textcell";
			var title = document.createElement("h3");
			title.innerHTML = text.posts[j].title;
			var p = document.createElement("p");
			p.innerHTML = text.posts[j].description;
			textCell.appendChild(title);
			textCell.appendChild(p);
			var img = new Image();
			img.src = text.posts[j].image;
			img.className = "cellimage img-responsive";
			gridInnerCell.appendChild(img);
			gridInnerCell.appendChild(textCell);
			gridOuterCell.id = text.posts[j].pid;
			gridOuterCell.addEventListener('click', function(event){
				localStorage.setItem("currentPost", event.currentTarget.id);
				location.href = "../html/post.html";		
			})
			gridRow.appendChild(gridOuterCell);
		}
		grid.appendChild(gridRow);	
	} else {
		var noresults = document.createElement("h2");
		noresults.innerHTML = "No Results";
		noresults.id = "noresults";
		noresults.style = "text-align: center; color: grey";
		grid.appendChild(noresults);
	}
}
