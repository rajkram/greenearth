const redis = require("redis");
const rejson = require("redis-rejson");
const { v4: uuidv4 } = require("uuid");
const { promisify } = require('util');
const crypto = require('crypto');
const express = require('express');
const cors = require("cors");
const bodyparser = require("body-parser");

rejson(redis);
const client = redis.createClient({
     port      : 0, // database port,
     host      : "", // database url,
     password  : "", // database password
});
client.on("error", function(error) {
  console.error(error);
});

const app = express();
const port = 3000;
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(express.static(__dirname));
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/html/homepage.html");
})

app.get('/login', async (req, res) => {
  var name = req.query.name;
  var pwd = req.query.pwd;
  console.log(name);
  var token = await login(name, pwd);
  console.log(token);
  res.send(token);
})

app.get('/logout', async (req, res) => {
  var token = req.query.token;
  await logout(token);
  res.send("OK");
})

app.get('/authUser', async (req, res) => {
  var token = req.query.token;
  var name = await authUser(token);
  res.send(name);
})

app.get('/userInfo', async (req, res) => {
  var name = req.query.name;
  const hmget = promisify(client.hmget).bind(client);
  var user = await hmget(name, 'id', 'description', 'image');
  res.send([name, ...user]);
})

app.get('/postInfo', async (req, res) => {
	var pid = req.query.pid;
	var post = await findPostByID(pid);
	res.send(post);

})

app.post('/addUser', async (req, res) => {
	var params = req.body;
	await addUser(params.name, params.pwd, params.description, params.image);
	res.send("OK");
})

app.post('/setField', async (req, res) => {
	var params = req.body;
	console.log(params);
	await setField(params.token, params.field, params.value);
	res.send("OK");
})

app.post('/editPost', async (req, res) => {
  var params = req.body;
  await editPost(params.token, params.pid, params.title, params.description, params.image, params.recipe, params.steps, params.visibility);
  res.send("OK");
})

app.post('/addPost', async (req, res) => {
  var params = req.body;
  var name = await authUser(params.token);
  await addPost(params.token, params.title, params.description, name, params.image, params.recipe, params.steps, params.visibility);
  res.send("OK");
})

app.post('/addComment', async (req, res) => {
  var params = req.body;
  await addComment(params.token, params.pid, params.comment, params.date, params.time);
  res.send("OK");
})

app.get('/findPost', async (req, res) => {
	var pid = req.query.pid;
	var post = await findPostByID(pid);
	res.send(post);
})


app.get('/deletePost', async (req, res) => {
  var token = req.query.token;
  var pid = req.query.pid;
  await deletePost(token, pid);
  res.send("OK");
})

app.get('/allPosts', async (req, res) => {
	var name = req.query.name;
	const hget = promisify(client.hget).bind(client);
	const lr = promisify(client.lrange).bind(client);
	const hgetall = promisify(client.hgetall).bind(client);

	const json_get = promisify(client.json_get).bind(client);

	var id = await hget([name, 'id']);
	var posts = await json_get(id);
	posts = JSON.parse(posts);
	var newposts = {"posts": []};
	if (posts != null) {
		for (var i = 0; i < posts.length; i++) {
			var p = posts[i];

			if (p["visibility"] === "on") {
				newposts["posts"].push(p);
			}
		}
	}
	console.log(newposts);
	res.send(newposts);

})

app.get('/allGlobalPosts', async (req, res) => {
	const hget = promisify(client.hget).bind(client);
	const lr = promisify(client.lrange).bind(client);
	const hgetall = promisify(client.hgetall).bind(client);

	const json_get = promisify(client.json_get).bind(client);
	var posts = await json_get('globalPosts');
	posts = JSON.parse(posts);
	var newposts = {"posts": []};
	if (posts != null) {
		for (var i = 0; i < posts.length; i++) {
			var p = posts[i];
			newposts["posts"].push(p);
		}
	}
	console.log(newposts);
	res.send(newposts);
})

app.get('/allDrafts', async (req, res) => {
	var name = req.query.name;
	const hget = promisify(client.hget).bind(client);
	const lr = promisify(client.lrange).bind(client);
	const hgetall = promisify(client.hgetall).bind(client);

	const json_get = promisify(client.json_get).bind(client);

	var id = await hget([name, 'id']);
	var posts = await json_get(id);
	posts = JSON.parse(posts);
	var newposts = {"posts": []};
	if (posts != null) {
		for (var i = 0; i < posts.length; i++) {
			var p = posts[i];

			if (p["visibility"] === "off") {
				newposts["posts"].push(p);
			}
		}
	}
	console.log(newposts);
	res.send(newposts);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})



async function addUser(name, password, description, image) {
	const sadd = promisify(client.sadd).bind(client);
	var result = await sadd(['users', name]);

	if (result != null) {
		var id = uuidv4();
		const hash = crypto.createHash('sha256');
		hash.update(password);
		var pwd = hash.digest('hex');
		const hmset = promisify(client.hmset).bind(client);
		await hmset(name, 'id', id, 'pwd', pwd, 'description', description, 'image', image);
		console.log("User added");
	}
}

async function login(name, password) {
	if (client.sismember(['users', name])) {
		const hash = crypto.createHash('sha256');
		hash.update(password);
		var pwdhash = hash.digest('hex');
		const hget = promisify(client.hget).bind(client);
		var pwd = await hget([name, 'pwd']);

		if (pwdhash === pwd) {
			console.log("Successful sign-in");
			var token = uuidv4();
			const hset = promisify(client.hset).bind(client);
			await hset(['active', token, name]);
			return token;
		} else {
			console.log("Incorrect password");
			return null;
		}
	} else {
		console.log("Account does not exist");
		return null;
	}
}

async function logout(token) {
	var name = await authUser(token);
	console.log(token);
	console.log(name);
	if (name == null) {
		console.log("Not signed in");
	} else {
		const hdel = promisify(client.hdel).bind(client);
		await hdel(['active', token]);
		console.log("Successful logout");
	}
}

async function findUser(name) {
	const hget = promisify(client.hgetall).bind(client);
	var user = await hget(name);
	return user;
}

async function authUser(token) {
	const hget = promisify(client.hget).bind(client);
	var name = await hget(['active', token]);
	if (name == null) {
		console.log("Not authenticated.");
	}
	return name;
}

async function setField(token, field, value) {
	var name = await authUser(token);
	const hmset = promisify(client.hmset).bind(client);
	await hmset(name, field, value);

}

async function editPost(token, pid, title, description, image, recipe, steps, visibility) {
	var name = await authUser(token);
	const hget = promisify(client.hget).bind(client);
	const json_get = promisify(client.json_get).bind(client);
	const json_set = promisify(client.json_set).bind(client);
	var id = await hget([name, 'id']);

	var posts = await json_get(id, ".");
	var globalPosts = await json_get('globalPosts', ".");
	posts = JSON.parse(posts);
	globalPosts = JSON.parse(globalPosts);
	console.log(posts);

	const newpost = {
	  pid: pid,
	  title: title,
	  description: description,
	  author: "",
	  image: image,
	  recipe: recipe,
	  steps: steps,
	  comments: [],
	  visibility: visibility
	}
	var vis;

	if (posts != null) {
		for (var i = 0; i < posts.length; i++) {
			if (posts[i]["pid"] === pid) {
				vis = posts[i]["visibility"];
				newpost.author = posts[i]["author"];
				newpost.comments = posts[i]["comments"];
				posts[i] = newpost;

				break;
			}
		}
	}
	if (vis === "on") {
		if (globalPosts != null) {
			for (var i = 0; i < globalPosts.length; i++) {
				if (globalPosts[i]["pid"] === pid) {
					globalPosts[i] = newpost;
					if (visibility === "off") {
						globalPosts.splice(i, 1);
					} else if (visibility === "on") {
						globalPosts[i] = newpost;
					}
					break;
				}
			}
		}
	} else {
		if (visibility === "on") {
			globalPosts.push(newpost);
		}
	}
	await json_set(id, '.', JSON.stringify(posts));
	await json_set('globalPosts', '.', JSON.stringify(globalPosts));
	console.log("Post edited");
}


async function addPost(token, title, description, author, image, recipe, steps, visibility) {

	var name = await authUser(token);
	const hget = promisify(client.hget).bind(client);
	var id = await hget([name, 'id']);
	var pid = uuidv4();

	const post = {
	  pid: pid,
	  title: title,
	  description: description,
	  author: author,
	  image: image,
	  recipe: recipe,
	  steps: steps,
	  comments: [],
	  visibility: visibility
	}

	const json_get = promisify(client.json_get).bind(client);
	const json_set = promisify(client.json_set).bind(client);
	var posts = await json_get(id, ".");
	posts = JSON.parse(posts);
	console.log(posts);
	if (posts == null) {
		posts = [];
	}
	posts.push(post);
	await json_set(id, '.', JSON.stringify(posts));

	if (visibility === "on") {
		var posts = await json_get('globalPosts', ".");
		posts = JSON.parse(posts);
		if (posts == null) {
			posts = [];
		}
		posts.push(post);
		await json_set('globalPosts', '.', JSON.stringify(posts));
	}


	console.log("Post added");
}

async function addComment(token, pid, comment, date, time) {
	var author = await authUser(token);
	console.log(author);

	const json_get = promisify(client.json_get).bind(client);
	const json_set = promisify(client.json_set).bind(client);
	const hget = promisify(client.hget).bind(client);

	var post = await findPostByID(pid);
	var id = await hget([post.author, 'id']);

	var posts = await json_get(id, ".");
	var globalPosts = await json_get('globalPosts', ".");
	posts = JSON.parse(posts);
	globalPosts = JSON.parse(globalPosts);
	console.log(posts);
	if (posts != null) {
		for (var i = 0; i < posts.length; i++) {
			if (posts[i]["pid"] === pid) {
				const com = {
					'author': author,
					'comment': comment,
					'date': date,
					'time': time
				}
				posts[i]["comments"].push(com);
				break;
			}
		}
	}
	if (globalPosts != null) {
		for (var i = 0; i < globalPosts.length; i++) {
			console.log(globalPosts[i]);
			if (globalPosts[i]["pid"] === pid) {
				const com = {
					'author': author,
					'comment': comment,
					'date': date,
					'time': time
				}
				globalPosts[i]["comments"].push(com);
				break;
			}
		}
	}
	await json_set(id, '.', JSON.stringify(posts));
	await json_set('globalPosts', '.', JSON.stringify(globalPosts));

	console.log("Comment added");
}

async function findPostByID(pid) {
	const hget = promisify(client.hget).bind(client);
	const lr = promisify(client.lrange).bind(client);
	const hgetall = promisify(client.hgetall).bind(client);

	const json_get = promisify(client.json_get).bind(client);
	var posts = await json_get('globalPosts', ".");
	posts = JSON.parse(posts);
	console.log(posts);
	var newpost;
	if (posts != null) {
		for (var i = 0; i < posts.length; i++) {

			if (posts[i]["pid"] === pid) {
				newpost = posts[i];
				break;
			}
		}
	}
	console.log(newpost);
	return newpost;
}

async function findSteps(id) {
	const hgetall = promisify(client.hgetall).bind(client);
	var obj = await hgetall(id);
	console.log("Steps found");
	return obj;
}

async function findRecipe(id) {
	const smembers = promisify(client.smembers).bind(client);
	var obj = await smembers(id);
	console.log("Recipe found");
	return obj;
}

async function findComments(id) {
	const lrange = promisify(client.lrange).bind(client);
	var obj = await lrange(id, 0, -1);
	const hgetall = promisify(client.hgetall).bind(client);
	var comments = [];
	for (var i = 0; i < obj.length; i++) {
		var com = await hgetall(obj[i]);
		comments.push(com);
	}
	console.log("Comments found");
	return comments;
}



async function deletePost(token, pid) {
	var name = await authUser(token);
	const hget = promisify(client.hget).bind(client);
	var id = await hget([name, 'id']);


	const json_get = promisify(client.json_get).bind(client);
	const json_set = promisify(client.json_set).bind(client);
	var posts = await json_get(id, ".");
	posts = JSON.parse(posts);
	console.log(posts);
	if (posts == null) {
		posts = [];
	}
	var vis;
	for (var i = 0; i < posts.length; i++) {
		if (posts[i]["pid"] == pid) {
			vis = posts[i]["visibility"];
			posts.splice(i, 1);
			break;
		}
	}
	await json_set(id, '.', JSON.stringify(posts));

	if (vis === "on") {
		var posts = await json_get('globalPosts', ".");
		posts = JSON.parse(posts);
		if (posts == null) {
			posts = [];
		}
		for (var i = 0; i < posts.length; i++) {
			if (posts[i]["pid"] == pid) {
				posts.splice(i, 1);
				break;
			}
		}
		await json_set('globalPosts', '.', JSON.stringify(posts));
	}

}
