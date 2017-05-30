// Baby's first server
const http = require('http')
const port = 1337
const path = require('path')

const axios = require('axios')
const fs = require('fs-extra')
const rq = require('request')
const ejs = require('ejs')

const template = fs.readFileSync('./src/views/index.ejs', 'utf8')
const navigation = []

const envProd = false

const baseUrl = (envProd) ? '/static-site-generator-wp-rest' : process.cwd() + '/public'

const requestHandler = (request, response) => {
	// console.log(request, response)
	response.end('check your console.log')
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
	if (err) {
		return console.log('something bad happened', err)
	}

	//getPostsAPI('http://wearecube3.com/wp-json/wp/v2/posts?_embed')


	getAPI('http://wearecube3.com/wp-json/')

	console.log(`server is listening on ${port}`)
})

const makePostFile = (post) => {

	var fileName = './src/pages/single-post/' + post.slug + ".html"

	let content = ejs.render(template, {
		filename: './src/views/index.ejs',
		templateName: 'single',
		stylesheet: baseUrl + '/css/style.css',
		post: post,
		links: navigation
	})

	fs.writeFile(fileName, content, {
		flag: 'w'
	}, function(err) {
		if (err) throw err
		// console.log("Saved:", post.slug + ".html")
	})




	// download all of the images in the post
	//const regex = /src="(.*?)"/g;
	const regex = /src=\\"(.*?)\\"/g;
	let m;

	while ((m = regex.exec(post.content)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches
		if (m.index === regex.lastIndex) {
			regex.lastIndex++
		}

		// The result can be accessed through the `m`-variable.
		m.forEach((match, groupIndex) => {
			// console.log(`Found match, group ${groupIndex}: ${match}`)
			var imgFileName = m[1].split('/')[7]

			download(m[1], './src/images/single-post-images/' + post.slug + "/" + imgFileName, function() {
				console.log('done', imgFileName)
			})
		})
	}

	// END download all of the images in the post

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
		postsJson(response.data)
		console.log(response.data)
	}).catch((error) => {
		console.log(error)
	})
}

const getPostsAPI = (endpoint) => {
	axios.get(endpoint).then((response) => {
		// 	console.log("*************************************************\n", response.data)
		generateNavigation(response.data)
		// Save the original, un-sanitised, data to a json file
		// postsJson(response.data)

		// Make the pages directory
		fs.mkdirsSync('./src/pages/single-post/')

		response.data.forEach((post) => {

			//console.log("*************************************************\n", post)



			// make all the folders for the images
			fs.mkdirsSync('./src/images/single-post-images/' + post.slug)

			// crawl all the hero images
			let imagePath = './src/images/single-post-images/' + post.slug + "/"

			download(post['_embedded']['wp:featuredmedia'][0].media_details.sizes.full.source_url, imagePath + post['_embedded']['wp:featuredmedia'][0].media_details.sizes.full.file, function() {
				//console.log('done', post['_embedded']['wp:featuredmedia'][0].media_details.sizes.full.file)
			})

			// crawl all the thumbnail images
			download(post['_embedded']['wp:featuredmedia'][0].media_details.sizes.medium.source_url, imagePath + post['_embedded']['wp:featuredmedia'][0].media_details.sizes.medium.file, function() {
				//console.log('done', post['_embedded']['wp:featuredmedia'][0].media_details.sizes.medium.file)
			})

			// crawl all the content images
			var pattern = new RegExp('src=\\"(.*?)\\"', 'g')
			var urls = post.content.rendered.match(pattern)

			if (urls) {
				urls.forEach((url) => {
					var url = url.split('"')
					var filename = url[1].split('/')
					if (filename[2] !== 'www.youtube.com') {
						var filename = filename[(filename.length - 1)]
						download(url[1], './src/images/single-post-images/' + post.slug + "/" + filename, function() {
							console.log('done', url[1])
						})
					}
				})
			}

		})

		// Format the response
		// sanitiseAllPosts(response.data)

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
			posts.forEach((post) => {
				makePostFile(post)
				if (posts.length === data.length){
					makeArchivePage(posts)
				}
			})

		}

		// Save the new, sanitised, data to a json file
		postsJson(posts)

	})
}

const satintisePostData = (datum) => {

	let post = {
		id: datum.id,
		title: datum.title.rendered,
		slug: datum.slug,
		url: baseUrl + '/pages/single-post/' + datum.slug + '.html',
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
		content: '',
		hero: {
			alt: (datum['_embedded']['wp:featuredmedia'][0].alt_text) ? datum['_embedded']['wp:featuredmedia'][0].alt_text : datum.title.rendered,
			caption: (datum['_embedded']['wp:featuredmedia'][0].caption) ? datum['_embedded']['wp:featuredmedia'][0].caption.rendered : datum.title.rendered,
			full: {
				filename: datum['_embedded']['wp:featuredmedia'][0].media_details.sizes.full.file,
				location: baseUrl + '/images/single-post-images/' + datum.slug + '/' + datum['_embedded']['wp:featuredmedia'][0].media_details.sizes.full.file
			},
			thumb: {
				filename: datum['_embedded']['wp:featuredmedia'][0].media_details.sizes.medium.file,
				location: baseUrl + '/images/single-post-images/' + datum.slug + '/' + datum['_embedded']['wp:featuredmedia'][0].media_details.sizes.medium.file
			}
		},
		categories: []
	}

	function replaceImagePaths(content) {
		var pattern = new RegExp('src=\\"(.*?)\\"', 'g')
		var url = content.match(pattern)

		if (url) {
			var grabUrl = url[0].split('"')

			var url = grabUrl[1].split('/')

			let end = (url.length - 1)

			if (url[2] !== 'www.youtube.com') {
				var pattern = new RegExp(url.slice(0, end).join('\\/'), 'g')
				var filename = url[end]

				return content.replace(pattern, baseUrl + '/images/single-post-images/' + datum.slug)
			} else {
				return content
			}
		} else {
			return content
		}

	}

	post.content = replaceImagePaths(datum.content.rendered)

	// Generate the category list
	datum['_embedded']['wp:term'][0].forEach((category, i) => {
		post.categories.push({
			id: datum['_embedded']['wp:term'][0][i].id,
			name: datum['_embedded']['wp:term'][0][i].name,
			slug: datum['_embedded']['wp:term'][0][i].slug,
		})
	})

	// return the, er, post. duh
	return post
}

const generateNavigation = (data) => {

	data.forEach((datum) => {
		let link = {
			text: datum.title.rendered,
			url: baseUrl + '/pages/single-post/' + datum.slug + '.html'
		}
		navigation.push(link)
		if (navigation.length === data.length) {
			// console.log(navigation)
			makeHomePage(navigation)
			sanitiseAllPosts(data)
		}
	})
}

const makeArchivePage = (posts) => {
	let content = ejs.render(template, {
		filename: './src/views/index.ejs',
		templateName: 'archive',
		stylesheet: baseUrl + '/css/style.css',
		links: [],
		posts: posts
	})

	// console.log("*************************************\nARCHIVE PAGE:\n", posts)

	fs.writeFile('./src/pages/archive.html', content, {
		flag: 'w'
	}, function(err) {
		if (err) throw err
		// console.log("Saved:", post.slug + ".html")
	})
}

const makeHomePage = (navigation) => {
	let content = ejs.render(template, {
		filename: './src/views/index.ejs',
		templateName: 'home',
		stylesheet: baseUrl + '/css/style.css',
		links: navigation
	})

	fs.writeFile('./src/index.html', content, {
		flag: 'w'
	}, function(err) {
		if (err) throw err
		// console.log("Saved:", post.slug + ".html")
	})
}
