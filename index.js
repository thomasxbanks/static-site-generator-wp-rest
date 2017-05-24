// Baby's first server
const http = require('http')
const port = 1337

const axios = require('axios')
const fs = require('fs')
const rq = require('request')
const fse = require('fs-extra')

const requestHandler = (request, response) => {
	// console.log(request, response)

	getAPI('http://scrummable.com/wp-json/wp/v2/posts?_embed')

	response.end('check your console.log')
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
	if (err) {
		return console.log('something bad happened', err)
	}

	getAPI('http://scrummable.com/wp-json/wp/v2/posts?_embed')

	console.log(`server is listening on ${port}`)
})

const makePostFile = (post) => {
	var fileName = './src/pages/single-post/' + post.slug + ".html"
	let contentEdit = replacePostContentImages(post)
	const template = `
	<!DOCTYPE html>
	<html lang="en" class="is-ie">

	<head>
	<meta charset="UTF-8">
	<title>Page Hero</title>
	<meta name='viewport' content='width=device-width, initial-scale=1, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0'>
	<link href="https://fonts.googleapis.com/css?family=News+Cycle" rel="stylesheet">
	<style>
		body {
			padding: 0;
			margin: 0;
			font-family: "News Cycle", Arial, "Helvetica Neue", Helvetica, sans-serif;
			font-size: 20px;
		}

		main {
			max-width: 1024px;
			margin: 0 auto;
			padding: 1em;
		}

		.page_hero {
			width: 100%;
			height: 100vh;
			max-height: 650px;
			text-align: center;
			overflow: hidden;
			position: relative;
			display: table;
			background-size: cover;
			background-repeat: no-repeat;
			background-position: center center;
		}

		.page_hero .inner {
			display: table-row;
		}

		.is-ie .page_hero [class^="hero_img-full"] {
			display: none;
		}

		.page_hero [class^="hero_img-"] {
			width: 100%;
			height: 100%;
			object-fit: cover;
			object-position: center;
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;
			right: 0;
		}

		.page_hero .hero_img-thumb {
			z-index: 9;
		}

		.page_hero .hero_img-full {
			z-index: 8;
		}

		.texture {
			background: linear-gradient(rgba(0,0,0,1), rgba(0,0,0,0))
			width: 100%;
			height: 100%;
			display: table-cell;
			vertical-align: middle;
			position: relative;
			z-index: 10;
		}

		.texture h1,
		.texture p {
			max-width: 560px;
			margin: 1em auto;
			padding: 0 1em;
			color: #fff;
			text-shadow: 0 0 8px #000;
		}
		main {
			max-width: 640px;
			margin-right: auto;
			margin-left: auto;
		}
		main img {
			display: block;
			max-width: 100%;
			height: auto;
		}
	</style>
	</head>

	<body>
	<section class="page_hero" style="background-image: url(${post.hero.full.staticpath});">
		<img class="hero_img-thumb" src="${post.hero.thumb.staticpath}" alt="${post.hero.alt}">
		<img class="hero_img-full" src="${post.hero.full.staticpath}" alt="${post.hero.alt}">
		<div class="inner">
			<div class="texture">
				<h1>${post.title}</h1>
				<p>By ${post.author.name}</p>
			</div>
		</div>
	</section>
	<main>
		${post.content}
	</main>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
	<script>
		$(document).ready(function() {
			$('.hero_img-full').one("load", function() {
				$('.hero_img-thumb').animate({
					'opacity': 0
				}, 500)
			}).each(function() {
				if (this.complete) $(this).load()
			})
		})
	</script>
	</body>

	</html>
	`



	fs.writeFile(fileName, template, {
		flag: 'w'
	}, function(err) {
		if (err) throw err
		console.log("Saved:", post.slug + ".html")
	})

	fse.mkdirsSync('./src/images/single-post-images/' + post.slug)

	let imagePath = './src/images/single-post-images/' + post.slug + "/"

	download(post.hero.thumb.source, imagePath + post.hero.thumb.filename, function() {
		console.log('done', post.hero.thumb.filename)
	})

	download(post.hero.full.source, imagePath + post.hero.full.filename, function() {
		console.log('done', post.hero.full.filename)
	})

	const regex = /src="(.*?)"/g;

	let m;

	while ((m = regex.exec(post.content)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches
		if (m.index === regex.lastIndex) {
			regex.lastIndex++;
		}

		// The result can be accessed through the `m`-variable.
		m.forEach((match, groupIndex) => {
			console.log(`Found match, group ${groupIndex}: ${match}`);
			var imgFileName = m[1].split('/')[7]

			download(m[1], './src/images/single-post-images/' + post.slug + "/" + imgFileName, function() {
				console.log('done', imgFileName)
			})
		});
	}

}



const download = (uri, filename, callback) => {
	rq.head(uri, function(err, res, body) {
		// console.log('content-type:', res.headers['content-type'])
		// console.log('content-length:', res.headers['content-length'])
		rq(uri).pipe(fs.createWriteStream(filename)).on('close', callback)
	})
}

const postsJson = (data) => {
	var fileName = './src/data/posts.json'
	var stream = fs.createWriteStream(fileName)
	stream.once('open', function(fd) {
		stream.end(JSON.stringify(data, null, 2))
	})
}

const getAPI = (endpoint) => {
	axios.get(endpoint).then((response) => {
		console.log("*************************************************\n", response.data)
		// Save the original, un-sanitised, data to a json file
		// postsJson(response.data)
		response.data.forEach((post)=>{
			fse.mkdirsSync('./src/images/single-post-images/' + post.slug)
		})

		// Format the response
		sanitiseAllPosts(response.data)

	}).catch((error) => {
		console.error(error)
	})
}

const sanitiseAllPosts = (data) => {
	let posts = []
	data.forEach((datum) => {
		posts.push(satintisePostData(datum))
		if (posts.length === data.length) {
			// console.log(posts)
			// Save the new, sanitised, data to a json file
			postsJson(posts)
			posts.forEach((post) => {
				makePostFile(post)
			})
		}
	})
}

const satintisePostData = (datum) => {

	let post = {
		id: datum.id,
		title: datum.title.rendered,
		slug: datum.slug,
		isFeatured: datum.sticky,
		date: {
			posted: datum.date,
			modified: datum.modified
		},
		author: {
			name: datum['_embedded'].author[0].name,
			description: datum['_embedded'].author[0].description,
			url: datum['_embedded'].author[0].link,
			avatar: datum['_embedded'].author[0].avatar_urls[96]
		},
		excerpt: datum.excerpt.rendered,
		content: datum.content.rendered,
		hero: {
			alt: datum.better_featured_image.alt_text,
			caption: datum.better_featured_image.caption,
			full: {
				source: datum.better_featured_image.source_url,
				filename: datum.better_featured_image.media_details.file.split('/')[2],
				staticpath: "/images/single-post-images/" + datum.slug + "/" + datum.better_featured_image.media_details.file.split('/')[2]
			},
			thumb: {
				source: datum.better_featured_image.media_details.sizes.medium.source_url,
				filename: "thumb-" + datum.better_featured_image.media_details.file.split('/')[2],
				staticpath: "/images/single-post-images/" + datum.slug + "/thumb-" + datum.better_featured_image.media_details.file.split('/')[2]
			}
		}
	}

	return post
}

const replaceImages = (data) => {
	let contents = []
	const regex = /src="(.*?)"/g;
	let m;
	data.forEach((datum)=>{
		//console.log(datum.content.rendered)

		while ((m = regex.exec(datum.content.rendered)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}

			m.forEach((match, groupIndex) => {
				let filename = m[1].split('/')[7]
				// console.log(filename)
				contents.push(datum.content.rendered.replace(m[1], '/images/single-post-images/' + datum.slug + '/' + filename))
			})
		}
		if (contents.length === data.length){
			console.log(contents)
		}
	})

}


const replacePostContentImages = (content) => {
	const regex = /src="(.*?)"/g;
	let m;
	while ((m = regex.exec(content)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches
		if (m.index === regex.lastIndex) {
			regex.lastIndex++;
		}

		m.forEach((match, groupIndex) => {
			let filename = m[1].split('/')[7]
			// console.log(filename)
			return content.replace(m[1], '/images/single-post-images/' + datum.slug + '/' + filename)
		})
	}
}
