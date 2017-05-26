# Static WordPress Site Generator

## User stories
- **As a** content editor, **I want** to continue using the WordPress CMS **so that** I don't have to learn a new system.
- **As a** site user, **I want** a fast, efficient site **so that** I am not losing time or bandwidth.
- **As a** business, **I want** a fast, efficient site **so that** users are not put off by lengthy load times.
- **As a** site maintainer, **I want** a secure site **so that** I spend less time dealing with brute-force attacks.
- **As a** developer, **I want** a modular, templated build **so that** I can spend more time developing user features than building the backend.
- **As a** SEO manager, **I want** less dynamic content **so that** Google treats us as a well-positioned site.

_____

## What do we want?
1. Nicely-organised folders of `.html` files
1. A folder of images
1. A `.css` file
1. A `.js` file
1. **All of the above** to be nicely minified for performance

_____

## What do we want to do?
1. Continue using WordPress as usual; changing copy, uploading new posts and associated images
1. The user will receive `.html` files on the front-end
1. The static pages must be as up-to-date as the CMS _with as little delay as possible_

_____

## So what do we need to do?
1. Get the WordPress posts and page data
1. Create the required layout and populate it with the data
1. Write this to a static `.html` file
1. Drop any associated images into an `/images/` folder

### Caveats
1. **Only** do this to a page that has changed
1. **Always** do this when a change is made
1. Manual intervention **is** possible if it is *simple enough* to be done by non-technical staff

### Trickier stuff
1. `POST` form submissions back to WordPress
1. Rebuild any navigation if new pages are added or the menu functionality of WordPress is updated
1. Search functionality - Has to be dynamic and involves a database call/page build
1. Lazy-loading - possibly but belies the "static" part of the brief

### Nice-to-haves
1. Jazzy page transitions

_____

## What do we need to have?
1. Abstracted templates for ease of maintenance and modular development
1. Access to the WordPress REST API
1. Static file builder
1. Some kind of caching and incremental unique filenames for `.css` and `.js` files

_____

## What is there already out there and why don't we use that?
Existing solution | Why we're not using it
-----|-----
[jeckyll](https://jekyllrb.com/) and other "[Static Site Generators](https://www.netlify.com/blog/2016/05/02/top-ten-static-website-generators/)" | Build happens locally, no WordPress - uses markdown
[Node on the server](http://cube-static.teamcube.co.uk/) | Potential issues with downtime, no caching - each 'static' page is generated at the time of request

_____

## Issues
Things I have noticed during the duration of this experiment that are difficult or could prevent the viability.
1. The initial set-up can be tricky;
  - the API return varies from site-to-site, resulting in a potentially large chunk of time sanitising the return data.
1. Retro-fitting this to existing projects is harder than doing it from scratch.
1. Not found a viable solution for only updating what has changed yet.
