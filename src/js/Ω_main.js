"use strict"

window.onload = () => {

    axios.get('data/data.json').then(function(response) {
        const data = response.data
        document.querySelector('main').innerHTML += "<br /><br /><strong>Adults</strong><br /><ul></ul>"
        data.filter(isAdult).forEach((user) => {
            document.querySelector('main ul').innerHTML += "<li>" + user.name + "</li>"
        })

        // Log for debug
        console.log(data)

    }).catch(function(error) {
        // Log for debug
        console.error(error)
    })

    document.querySelector('main').innerHTML += "<br />width: " + browser.width + "<br />height: " + browser.height


    document.querySelector('#nudge').addEventListener('click', ()=>{
      console.log(browser.height);
      scrollTo(document.body, browser.height, 600)
    })
}
