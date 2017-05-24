# Static WordPress

## What do we want?
1. Nicely-organised folders of `.html` files
1. A folder of images
1. A `.css` file

## What do we want to do?
1. Continue using WordPress as usual; changing copy, uploading new posts and associated images
1. The user will receive `.html` files on the front-end
1. The static pages must be as up-to-date as the CMS with as little delay as possible

## So what do we need to do?
1. Get the WordPress posts and page data
1. Create the required layout and populate it with the data
1. Write this to a static `.html` file
1. Drop any associated images into an `/images/` folder
1. Generate sitemap

### Caveats
1. **Only** do this to a page that has changed
1. **Always** do this when a change is made
1. Manual intervention **is** possible if it is *simple enough* to be done by non-technical staff

### Trickier stuff
1. `POST` form submissions back to WordPress
1. Rebuild any navigation if new pages are added or the menu functionality of WordPress is updated
1. Search functionality
1. Lazy-loading

### Nice-to-haves
1. Jazzy page transitions

## What do we need to have?
1. Abstracted templates for ease of maintenance and modular development
1. Access to the WordPress REST API
1. Static file builder
1. Some kind of caching and incremental unique filenames for `.css` and `.js` files

## What is there already out there and why don't we use that?
Existing solution | Why we're not using it
-|-
[jeckyll](https://jekyllrb.com/) and other "[Static Site Generators](https://www.netlify.com/blog/2016/05/02/top-ten-static-website-generators/)" | Build happens locally, no WordPress - uses markdown
[Node on the server](http://cube-static.teamcube.co.uk/) | Potential issues with downtime, no caching - each 'static' page is generated at the time of request
