# Solid Server

This folder is used to serve a [CSS](https://github.com/CommunitySolidServer/CommunitySolidServer) instance for testing and development.

I previously had this dependency installed in the root project, but updating to `v5.0.0` from `v3.0.0` broke [Cypress](https://www.cypress.io/) showing a webpack error (And I thought my webpack days were behind me 😱️). After a couple of hours trying to fix it, I just decided to install this in a different folder and be done with it.

At some point, I have to update the Cypress version as well and hopefully it's not using Webpack anymore. But I don't want to get into all of that now, so in the meantime this is a workaround that gets the job done.
